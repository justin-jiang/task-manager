import { ValueParser } from 'server/libsWrapper/ValueParser';
import { AppConfigs } from 'server/common/AppConfigs';


export class ArgsParser {
    public static isDebugMode(): boolean {
        return ValueParser.parseBoolean((process.env as any).debugMode, false);
    }

    public static getApiPublicPath(): string {
        return (process.env as AppConfigs).apiPublicPath || '/';
    }

    public static getPort(): number {
        return ValueParser.parseNumber((process.env as AppConfigs).appPort, 8999);
    }
    public static getMongoDBURLs(): string {
        if ((process.env as AppConfigs).mongoDbUrls != null) {
            return (process.env as AppConfigs).mongoDbUrls as string;
        } else {
            return '127.0.0.1:27017';
        }
    }
    public static getPoolSize(): number {
        return ValueParser.parseNumber((process.env as AppConfigs).poolSize, 10);
    }

    public static getReplicaSetName(): string | undefined {
        return (process.env as AppConfigs).replicaSetName;
    }
    public static getStaticPublicPath(): string {
        return (process.env as AppConfigs).staticPublicPath || '/';
    }
    public static getDBUser(): string | undefined {
        return (process.env as AppConfigs).dbUser;
    }
    public static getDBPassword(): string | undefined {
        return (process.env as AppConfigs).dbPassword;
    }
    public static getAuthSource(): string | undefined {
        return (process.env as AppConfigs).authSource;
    }

    public static getApplyingDeadline(): number {
        return ValueParser.parseNumber((process.env as AppConfigs).applyingDeadline,
            30 * 60 * 1000);
    }
}
