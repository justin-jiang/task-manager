import { CommonUtils } from 'common/CommonUtils';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import * as mongo from 'mongodb';
import * as mongoose from 'mongoose';
import { ApiError } from 'server/common/ApiError';
import { mongodbName } from 'server/common/Constants';
import { LoggerManager } from 'server/libsWrapper/LoggerManager';
import { Readable } from 'stream';
import { MongoDBDriver } from './MongoDBDriver';
import { FileType } from 'server/common/FileType';

interface DBFiles {
    _id: mongo.ObjectId;
    filename: string;
    chunkSize: number;
    length: number;

}
// interface DBChunks {
//     files_id: mongo.ObjectId;
//     // The sequence number of the chunk. GridFS numbers all chunks, starting with 0.
//     n: number;

// }
export interface IFileMetaData {
    [key: string]: any;
    type: FileType;
    checked: boolean;
}
export class FileStorage {
    private static readonly metadataKeyName = 'metadata';
    public static async initialize(): Promise<void> {
        if (this.dbInstance == null || this.grid == null) {
            const conn: mongoose.Connection = await MongoDBDriver.$$getConnection(mongodbName);
            this.dbInstance = conn.db;
            this.grid = new mongoose.mongo.GridFSBucket(this.dbInstance);
        }
    }
    public static createWriteStream(
        fileId: string, version: number, metadata?: IFileMetaData): mongo.GridFSBucketWriteStream {
        const entryId: string = `${fileId}_${version}`;
        const options: any = {};
        options[this.metadataKeyName] = metadata;
        return this.grid.openUploadStreamWithId(
            entryId,
            entryId,
            options);
    }

    public static async $$saveEntry(
        fileId: string, version: number, metadata: IFileMetaData, data: Buffer | NodeJS.ReadableStream) {
        if (CommonUtils.isNullOrEmpty(fileId)) {
            throw new ApiError(ApiResultCode.INPUT_VALIDATE_INVALID_PARAM, 'fileId cannot be null on save');
        }
        if (version == null || version < 0) {
            throw new ApiError(ApiResultCode.INPUT_VALIDATE_INVALID_PARAM,
                'file version cannot be null or less than 0 on save');
        }

        let retryCount = 2;
        while (retryCount > 0) {
            retryCount--;
            try {
                await this.$$tryToSaveEntry(fileId, version, metadata, data);
                break;
            } catch (ex) {
                if (ex.code === 11000) {
                    // the file already exist in fs.trunks but not in fs.files
                    await this.$$removeDuplicatedChunkEntry(fileId, version);
                } else {
                    throw ex;
                }
            }
        }
    }

    public static createReadStream(fileId: string, version: number): mongo.GridFSBucketReadStream {
        return this.grid.openDownloadStreamByName(`${fileId}_${version}`);
    }

    public static async $$getEntry(files: string[]) {
        const filesCollection: mongo.Collection = this.dbInstance.collection('fs.files');
        return await filesCollection.find({ _id: { $in: files } });
    }
    public static async $$updateEntryMeta(entryId: string, metadata: IFileMetaData) {
        const filesCollection: mongo.Collection = this.dbInstance.collection('fs.files');
        const valueParam: any = {};
        Object.keys(metadata).forEach((key) => {
            valueParam[`${this.metadataKeyName}.${key}`] = metadata[key];
        });
        await filesCollection.updateOne(
            { _id: entryId },
            { $set: valueParam });
    }
    public static async $$deleteEntry(fileId: string, version?: number): Promise<void> {
        let cursor: mongo.Cursor | undefined;
        try {
            if (version == null) {
                cursor = this.grid.find({ filename: { $regex: `${fileId}_*` } });
            } else {
                cursor = this.grid.find({ filename: `${fileId}_${version}` });
            }
            while (await cursor.hasNext()) {
                const it: DBFiles = await cursor.next();
                LoggerManager.debug(`delete file with id:${it._id}`);
                await this.grid.delete(it._id);
            }
        } finally {
            if (cursor != null) {
                await cursor.close();
            }
        }


    }
    public static $$pipeStreamPromise(rs: NodeJS.ReadableStream, ws: NodeJS.WritableStream) {
        return new Promise((resolve, reject) => {
            ws.on('error', (err: any) => {
                reject(err);
                LoggerManager.error('ws error', err);
            });

            ws.on('finish', () => {
                resolve();
                LoggerManager.debug('ws finish');
            });

            rs.on('error', (err) => {
                reject(err);
                LoggerManager.error('rs error', err);
            });
            rs.pipe(ws);
        });
    }
    private static dbInstance: mongo.Db;
    private static grid: mongo.GridFSBucket;

    private static async $$removeDuplicatedChunkEntry(fileId: string, version: number) {
        const chunksCollection: mongo.Collection = this.dbInstance.collection('fs.chunks');
        await chunksCollection.remove(
            { files_id: `${fileId}_${version}` },
        );
    }

    private static async $$tryToSaveEntry(
        fileId: string, version: number, userMeta: any, data: Buffer | NodeJS.ReadableStream) {
        const writeStream: mongo.GridFSBucketWriteStream = this.createWriteStream(
            fileId,
            version,
            userMeta);

        if (data instanceof Buffer) {
            const readableData = new Readable();
            readableData.push(data as Buffer);
            readableData.push(null);
            await this.$$pipeStreamPromise(readableData, writeStream);
        } else {
            await this.$$pipeStreamPromise(data as NodeJS.ReadableStream, writeStream);
        }
    }
}
