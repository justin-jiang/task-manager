import { getPropKeys } from 'common/commonDataObjects/CommonObject';
import { TaskExecutorReceiptUploadParam } from 'common/requestParams/TaskExecutorReceiptUploadParam';
import * as http from 'http';
import { ArgsParser } from 'server/common/ArgsParser';
import { TemplateModelWrapper } from 'server/dataModels/TemplateModelWrapper';
import { UserModelWrapper } from 'server/dataModels/UserModelWrapper';
import { FileStorage } from 'server/dbDrivers/mongoDB/FileStorage';
import { IndexExpress } from 'server/expresses/IndexExpress';
import { LoggerManager } from 'server/libsWrapper/LoggerManager';
import { TaskApplicationModelWrapper } from './dataModels/TaskApplicationModelWrapper';
import { TaskCheckRecordModelWrapper } from './dataModels/TaskCheckRecordModelWrapper';
import { TaskModelWrapper } from './dataModels/TaskModelWrapper';
import { UserNotificationModelWrapper } from './dataModels/UserNotificationModelWrapper';
import { keysOfTaskObject } from './dataObjects/TaskObject';
import { LoggerManagerInitParam } from './libsWrapper/LoggersManagerInitParam';
import { UserBasicInfoEditParam } from 'common/requestParams/UserBasicInfoEditParam';
import { keysOfUserObject } from './dataObjects/UserObject';
import { TaskDepositImageUploadParam } from 'common/requestParams/TaskDepositImageUploadParam';
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
    await TaskCheckRecordModelWrapper.$$warmUp();
    await UserNotificationModelWrapper.$$warmUp();

    await FileStorage.initialize();
}

function reqParamValidationAgainstTask(reqParams: any[]): void {
    reqParams.forEach((param) => {
        getPropKeys(param).forEach((paramItem) => {
            if (!keysOfTaskObject.includes(paramItem)) {
                LoggerManager.error(`${paramItem} missed in TaskObject`);
                process.exit();
            }
        });
    });
}

function reqParamValidationAgainstUser(reqParams: any[]): void {
    reqParams.forEach((param) => {
        getPropKeys(param).forEach((paramItem) => {
            if (!keysOfUserObject.includes(paramItem)) {
                LoggerManager.error(`${paramItem} missed in UserObject`);
                process.exit();
            }
        });
    });
}

function reqParamValidation(): void {
    const reqParamsForTask: any[] = [
        new TaskExecutorReceiptUploadParam(true),
        new TaskDepositImageUploadParam(true),
    ];
    reqParamValidationAgainstTask(reqParamsForTask);


    const reqParamsForUser: any[] = [
        new UserBasicInfoEditParam(true)
    ];
    reqParamValidationAgainstUser(reqParamsForUser);
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
LoggerManager.info('starting ...');

// Schema Validation
if (ArgsParser.isDebugMode()) {
    LoggerManager.info('Request Parameters Schema Validation in DebugMode ...');
    reqParamValidation();
}

let httpServer: http.Server;

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

