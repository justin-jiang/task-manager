import * as http from 'http';
import { ArgsParser } from 'server/common/ArgsParser';
import { TemplateModelWrapper } from 'server/dataModels/TemplateModelWrapper';
import { UserModelWrapper } from 'server/dataModels/UserModelWrapper';
import { FileStorage } from 'server/dbDrivers/mongoDB/FileStorage';
import { IndexExpress } from 'server/expresses/IndexExpress';
import { LoggerManager } from 'server/libsWrapper/LoggerManager';
import { LoggerManagerInitParam } from './libsWrapper/LoggersManagerInitParam';
import { TaskModelWrapper } from './dataModels/TaskModelWrapper';
import { TaskApplicationModelWrapper } from './dataModels/TaskApplicationModelWrapper';
/**
 * Event listener for HTTP server "error" event.
 */
function onError(error: any) {
    if (error.syscall !== 'listen') {
        const errMsg = JSON.stringify(error);
        LoggerManager.log('error', errMsg, () => {
            process.exit();
        });
        return;
    }

    const bind = ArgsParser.getPort();
    let errInfo;
    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            errInfo = `${bind} requires elevated privileges`;
            LoggerManager.log('error', errInfo, () => {
                process.exit();
            });
            break;
        case 'EADDRINUSE':
            errInfo = `${bind} is already in use`;
            LoggerManager.log('error', errInfo, () => {
                process.exit();
            });
            break;
        default:
            errInfo = JSON.stringify(error);
            LoggerManager.error(errInfo);
            LoggerManager.log('error', errInfo, () => {
                process.exit();
            });
    }
}
function onListening() {
    const addr = httpServer.address();
    const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    const info = `Listening on ${bind}`;
    LoggerManager.info(info);
}
function startServer() {
    LoggerManager.info('creating Http Server with Express ...');
    const indexExpress = new IndexExpress();
    indexExpress.setPort(ArgsParser.getPort());
    httpServer = http.createServer(indexExpress.getExpressApp());
    httpServer.listen(ArgsParser.getPort());
    httpServer.on('error', onError);
    httpServer.on('listening', onListening);
}
/**
 * initialize all the Models here to avoid cold boot for users
 */
async function $$databaseWarmUp(): Promise<void> {
    LoggerManager.info('database warmup ...');
    await UserModelWrapper.$$warmUp();
    await TemplateModelWrapper.$$warmUp();
    await TaskModelWrapper.$$warmUp();
    await TaskApplicationModelWrapper.$$warmUp();

    await FileStorage.initialize();
}

/**
 * ##### Code Start from Here #####
 */

// please initialize log before any work
const logInitParam: LoggerManagerInitParam = {
    isDebug: ArgsParser.isDebugMode(),
    logFilePrefix: 'ServerApp',
};
LoggerManager.initialize(logInitParam);

let httpServer: http.Server;
LoggerManager.info('starting ...');
(async () => {
    LoggerManager.info('initializing DB ...');
    await $$databaseWarmUp();
    LoggerManager.info('starting HTTP Server ...');
    startServer();
    // monitor the quit code of SIGINT
    process.on('SIGINT', (signal: NodeJS.Signals) => {
        LoggerManager.log('error', 'Existing by SIGINT ...', () => {
            process.exit();
        });
    });

})().catch((ex) => {
    LoggerManager.error(ex);
    process.exit();
});

