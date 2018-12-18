import { LoggersManager } from 'server/libsWrapper/LoggersManager';
import * as mongoose from 'mongoose';
import { ArgsParser } from 'server/common/ArgsParser';
export class MongoDBDriver {
    public static EventConnectionClosed = 'ConnectionClosed';

    /**
     *
     * @param dbId
     */
    public static async $$getConnection(dbId: string) {
        if (MongoDBDriver.connectionCache.dbId != null) {
            return MongoDBDriver.connectionCache.dbId;
        }
        (mongoose as any).Promise = global.Promise;
        mongoose.set('debug', ArgsParser.isDebugMode());
        const dbURLs = ArgsParser.getMongoDBURLs();
        const connOptions: mongoose.ConnectionOptions = {
            poolSize: ArgsParser.getPoolSize(),
            keepAlive: 60 * 1000,
            config: {
                autoIndex: false,
            },
            useNewUrlParser: true,
        };
        if (ArgsParser.getReplicaSetName() != null) {
            connOptions.replicaSet = ArgsParser.getReplicaSetName();
            connOptions.readPreference = 'secondaryPreferred';
        }
        if (ArgsParser.getDBUser() != null &&
            ArgsParser.getDBPassword() != null) {
            connOptions.auth = {
                user: ArgsParser.getDBUser(),
                password: ArgsParser.getDBPassword(),
            };
            if (ArgsParser.getAuthSource() != null) {
                connOptions.authSource = ArgsParser.getAuthSource();
            } else {
                // by default to use the admin db
                connOptions.authSource = 'admin';
            }
        }
        const connectInstance: mongoose.Connection = await (mongoose.createConnection(
            'mongodb://' + dbURLs + '/' + dbId,
            connOptions) as any);

        connectInstance.on('disconnected', MongoDBDriver.onDisconnected);
        connectInstance.on('connected', MongoDBDriver.onConnected);
        connectInstance.on('error', MongoDBDriver.onError);
        MongoDBDriver.connectionCache.dbId = connectInstance;
        return connectInstance;
    }

    /**
     * Map to store the mongoose DB Models for every DB, e.g. wikiDB, globalDB
     */
    private static connectionCache: { [key: string]: mongoose.Connection } = {};

    private static onDisconnected(info: any) {
        LoggersManager.error('onDisconnected', info);
        (async () => {
            // ToDo: remove cache item
        })().catch((ex) => {
            LoggersManager.error(ex);
        });

    }
    private static onConnected(info: any) {
        LoggersManager.info('onConnected', info);
    }
    private static onError(info: any) {
        LoggersManager.info('onError', info);
        (async () => {
            // ToDo: remove cache item
        })().catch((ex) => {
            LoggersManager.error(ex);
        });
    }
}
