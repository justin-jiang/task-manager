export class ArgsParser {
    public static isDebugMode(): boolean {
        return true;
    }

    public static getPort(): number {
        return 8999;
    }
    public static getMongoDBURLs(): string {
        return '127.0.0.1:27017';
    }
    public static getPoolSize(): number {
        return 10;
    }

    public static getReplicaSetName(): string | undefined {
        return undefined;
    }

    public static getDBUser(): string | undefined {
        return undefined;
    }
    public static getDBPassword(): string | undefined {
        return undefined;
    }
    public static getAuthSource(): string | undefined {
        return undefined;
    }

}
