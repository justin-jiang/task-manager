import * as uuidv4 from 'uuid/v4';
export class CommonUtils {
    public static getUUIDForMongoDB(): string {
        return `M-${(uuidv4 as any)().replace('-', '')}`;
    }
}
