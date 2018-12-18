import { FileStorage } from '../dbDrivers/mongoDB/FileStorage';

export class FileRequestHandler {
    public static async $$uploadFile(
        entryId: string, version: number, fileData: Buffer | NodeJS.ReadableStream, metaData?: any): Promise<void> {
        await FileStorage.$$saveEntry(entryId, version, metaData, fileData);
    }
}
