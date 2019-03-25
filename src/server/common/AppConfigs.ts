export class AppConfigs {
    public appPort?: number;
    public applyingDeadline?: number;
    public authSource?: string;
    public debugMode?: boolean;
    public dbPassword?: string;
    public dbUser?: string;
    public healthCheckHost?: string;
    public mongoDbUrls?: string;
    public poolSize?: number;
    public replicaSetName?: string;


    constructor(withFullProps?: boolean) {
        if (withFullProps) {
            this.appPort = 0;
            this.authSource = '';
            this.dbPassword = '';
            this.debugMode = true;
            this.healthCheckHost = '';
            this.mongoDbUrls = '';
            this.poolSize = 0;
            this.replicaSetName = '';
        }
    }
}
