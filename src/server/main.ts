import * as http from 'http';
import { IndexExpress } from 'server/expresses/IndexExpress';
import { LoggersManager } from 'server/libsWrapper/LoggersManager';
import { ArgsParser } from './common/ArgsParser';
import { UserModelWrapper } from './dataModels/UserModelWrapper';
/**
 * Event listener for HTTP server "error" event.
 */
function onError(error: any) {
    if (error.syscall !== 'listen') {
        const errMsg = JSON.stringify(error);
        LoggersManager.error(errMsg);
        if (!ArgsParser.isDebugMode()) {
            LoggersManager.log('error', errMsg, () => {
                process.exit();
            });
        }
        return;
    }

    const bind = ArgsParser.getPort();
    let errInfo;
    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            errInfo = `${bind} requires elevated privileges`;
            LoggersManager.error(errInfo);
            if (!ArgsParser.isDebugMode()) {
                LoggersManager.log('error', errInfo, () => {
                    process.exit();
                });
            }
            break;
        case 'EADDRINUSE':
            errInfo = `${bind} is already in use`;
            LoggersManager.error(errInfo);
            if (!ArgsParser.isDebugMode()) {
                LoggersManager.log('error', errInfo, () => {
                    process.exit();
                });
            }
            break;
        default:
            errInfo = JSON.stringify(error);
            LoggersManager.error(errInfo);
            if (!ArgsParser.isDebugMode()) {
                LoggersManager.log('error', errInfo, () => {
                    process.exit();
                });
            }
    }
}
function onListening() {
    const addr = httpServer.address();
    const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    const info = `Listening on ${bind}`;
    LoggersManager.info(info);
}
function startServer() {
    LoggersManager.info('creating Http Server with Express ...');
    const indexExpress = new IndexExpress();
    indexExpress.setPort(ArgsParser.getPort());
    httpServer = http.createServer(indexExpress.getExpressApp());
    httpServer.listen(ArgsParser.getPort());
    httpServer.on('error', onError);
    httpServer.on('listening', onListening);
}
async function $$databaseWarmUp(): Promise<void> {
    LoggersManager.info('database warmup ...');
    await UserModelWrapper.$$warmUp();
}
LoggersManager.setFilePrefix('ServerApp');

let httpServer: http.Server;
LoggersManager.info('starting ...');
(async () => {
    await $$databaseWarmUp();
    startServer();
    // monitor the quit code of SIGINT
    process.on('SIGINT', (signal: NodeJS.Signals) => {
        LoggersManager.log('info', 'Existing by SIGINT ...', () => {
            process.exit();
        });

    });

})().catch((ex) => {
    LoggersManager.error(ex);
});

