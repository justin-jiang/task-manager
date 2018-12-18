import * as mongo from 'mongodb';
import * as mongoose from 'mongoose';
import { mongodbName } from 'server/common/Constants';
import { MongoDBDriver } from './MongoDBDriver';
import { Readable } from 'stream';
import { LoggersManager } from 'server/libsWrapper/LoggersManager';


export class FileStorage {

    public static createWriteStream(entryId: string, version: number, userMeta?: any): mongo.GridFSBucketWriteStream {
        this.initialize();
        const fileId: string = `${entryId}_${version}`;
        return this.grid.openUploadStream(fileId,
            {
                metadata: userMeta,
            });
    }

    public static async $$saveEntry(
        entryId: string, version: number, userMeta: any, data: Buffer | NodeJS.ReadableStream) {
        this.initialize();
        let retryCount = 2;
        while (retryCount > 0) {
            retryCount--;
            try {
                await this.$$tryToSaveEntry(entryId, version, userMeta, data);
                break;
            } catch (ex) {
                if (ex.code === 11000) {
                    // the file already exist in fs.trunks but not in fs.files
                    await this.$$removeDuplicatedChunkEntry(entryId, version);
                } else {
                    throw ex;
                }
            }
        }
    }

    public static createReadStream(entryId: string, version: number): mongo.GridFSBucketReadStream {
        this.initialize();
        return this.grid.openDownloadStream(
            new mongo.ObjectID(`${entryId}_${version}`));
    }

    public static async $$getEntry(files: string[]) {
        this.initialize();
        const filesCollection: mongo.Collection = this.dbInstance.collection('fs.files');
        return await filesCollection.find({ _id: { $in: files } });
    }
    private static dbInstance: mongo.Db;
    private static grid: mongo.GridFSBucket;
    private static async initialize(): Promise<void> {
        if (this.dbInstance == null || this.grid == null) {
            const conn: mongoose.Connection = await MongoDBDriver.$$getConnection(mongodbName);
            this.dbInstance = conn.db;
            this.grid = new mongoose.mongo.GridFSBucket(this.dbInstance);
        }
    }

    private static async $$removeDuplicatedChunkEntry(entryId: string, version: number) {
        const chunksCollection: mongo.Collection = this.dbInstance.collection('fs.chunks');
        await chunksCollection.remove(
            { files_id: `${entryId}_${version}` },
        );
    }

    private static async $$tryToSaveEntry(
        entryId: string, version: number, userMeta: any, data: Buffer | NodeJS.ReadableStream) {
        const writeStream: mongo.GridFSBucketWriteStream = this.createWriteStream(
            entryId,
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

    private static $$pipeStreamPromise(rs: NodeJS.ReadableStream, ws: NodeJS.WritableStream) {
        return new Promise((resolve, reject) => {
            ws.on('error', (err: any) => {
                reject(err);
                LoggersManager.error('ws error', err);
            });

            ws.on('finish', () => {
                resolve();
                LoggersManager.debug('ws finish');
            });

            rs.on('error', (err) => {
                reject(err);
                LoggersManager.error('rs error', err);
            });
            rs.pipe(ws);
        });
    }
}
