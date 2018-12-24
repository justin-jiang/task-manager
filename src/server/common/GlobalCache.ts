import * as NodeCache from 'node-cache';
import { LoggerManager } from 'server/libsWrapper/LoggerManager';

export class GlobalCache {
    private static cacheInst: NodeCache = new (NodeCache as any)({ stdTTL: 3600, checkperiod: 120 });
    public static set(key: string, value: any, ttl?: number): boolean {
        let result: boolean;
        if (ttl != null) {
            result = this.cacheInst.set(key, value, ttl);
        } else {
            result = this.cacheInst.set(key, value);
        }
        if (result === false) {
            LoggerManager.warn(`failed to set cache with key:${key}`);
        }
        return result;
    }

    public static get(key: string) {
        const result: any = this.cacheInst.get(key);
        if (result == null) {
            LoggerManager.warn(`failed to get cache with key:${key}`);
        }
        return result;
    }
}
