import { ValueParser } from 'server/libsWrapper/ValueParser';

interface IPM2EnvConfig {
    DebugMode?: boolean;
    ResetDB?: boolean;
    PoolSize?: number;
    AppPort?: number;
    MongoDBURLs?: string;
    ReplicaSetName?: string;
    RebuildES?: boolean;
    ESURL?: string;
    HealthCheckHost?: string;
    IsOnline?: boolean;
    UTCLogTime?: boolean;
    DBUser?: string;
    DBPassword?: string;
    AuthSource?: string;
    ResetAdmin?: boolean;
}
export class ArgsParser {
    public static isDebugMode(): boolean {
        return ValueParser.parseBoolean((process.env as IPM2EnvConfig).DebugMode, false);
    }

    public static getPort(): number {
        return ValueParser.parseNumber((process.env as IPM2EnvConfig).AppPort, 8999);
    }
    public static getMongoDBURLs(): string {
        if ((process.env as IPM2EnvConfig).MongoDBURLs != null) {
            return (process.env as IPM2EnvConfig).MongoDBURLs as string;
        } else {
            return '127.0.0.1:27017';
        }
    }
    public static getPoolSize(): number {
        return ValueParser.parseNumber((process.env as IPM2EnvConfig).PoolSize, 10);
    }

    public static getReplicaSetName(): string | undefined {
        return (process.env as IPM2EnvConfig).ReplicaSetName;
    }

    public static getDBUser(): string | undefined {
        return (process.env as IPM2EnvConfig).DBUser;
    }
    public static getDBPassword(): string | undefined {
        return (process.env as IPM2EnvConfig).DBPassword;
    }
    public static getAuthSource(): string | undefined {
        return (process.env as IPM2EnvConfig).AuthSource;
    }

}
