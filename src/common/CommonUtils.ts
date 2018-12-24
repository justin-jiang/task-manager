import * as uuidv4 from 'uuid/v4';
import { DBObjectView } from './responseResults/DBObjectView';
import { DBObject } from 'server/dataObjects/DBObject';
export class CommonUtils {
    public static getUUIDForMongoDB(): string {
        return `M-${(uuidv4 as any)().replace(/-/g, '')}`;
    }

    public static getPropKeys(dbObj: DBObject | DBObjectView): string[] {
        const propKeys: string[] = [];
        Object.keys(dbObj).forEach((key: string) => {
            if (dbObj[key] instanceof Function) {
                return;
            }
            propKeys.push(key);
        });
        return propKeys;
    }

    public static isNullOrEmpty(value: any): boolean {
        if (value == null) {
            return true;
        }
        if (typeof value.trim === 'function' && value.trim() === '') {
            return true;
        }
        return false;
    }
    public static isPrimitiveString(value: any): boolean {
        if (typeof value === 'string') {
            return true;
        } else {
            return false;
        }
    }
}
