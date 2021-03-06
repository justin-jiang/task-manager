/**
 * Please don't refer any class from the app to avoid nested ref
 */
import * as moment from 'moment';
import { createLogger, format, Logger, transports, LogCallback } from 'winston';
import { LoggerManagerInitParam } from './LoggersManagerInitParam';

// tslint:disable-next-line:no-var-requires
const DailyRotateFile = require('winston-daily-rotate-file');

/**
 * LoggerManager for server, now we use the winstonLogger
 * if DebugMode, we log the message to console
 * if not, we log the message to file
 */
export class LoggerManager {
    /**
     * Initialize the console logger transport, daily rolling file logger
     * and defaultServerLogger
     */
    public static initialize(initParam: LoggerManagerInitParam) {
        this.initParam = initParam || {};
        const { printf } = format;
        const procIndex: string = process.env.NODE_APP_INSTANCE == null ? '0' : (process.env.NODE_APP_INSTANCE);
        const myFormat = printf((info: any) => {
            const timestamp: string = (moment as any)(new Date()).format('YYYY-MM-DD hh:mm:ss:SSS');
            let metadataJSON: string | undefined;
            if (info.metadata != null && info.metadata.meta != null) {
                try {
                    metadataJSON = JSON.stringify(info.metadata.meta);
                } catch (ex) {
                    metadataJSON = JSON.stringify({ error: 'JSON.stringify' });
                }
            }
            if (metadataJSON === undefined) {
                return `${timestamp} ${info.level}: ${info.message}`;
            } else {
                return `${timestamp} ${info.level}: ${info.message} -- ${metadataJSON}`;
            }
        });

        const customTransports: any = [];
        if (!this.initParam.isDebug) {
            const rollingFaleTransport = new DailyRotateFile({
                dirname: `./logs/${procIndex}`,
                filename: `${LoggerManager.filePrefix}_%DATE%.log`,
                datePattern: 'YYYY-MM-DD',
                maxFiles: '10',
                maxsize: '100m',
                level: 'info',
                auditFile: `./logs/${procIndex}/log_audit.json`,
                format: format.combine(
                    format.metadata(),
                    myFormat,
                ),
            });
            customTransports.push(rollingFaleTransport);
        } else {
            customTransports.push(new transports.Console({
                level: 'debug',
                format: format.combine(
                    format.colorize(),
                    format.splat(),
                    format.metadata(),
                    myFormat,
                ),
            }));
        }
        LoggerManager.loggerInst = createLogger({
            transports: customTransports,
        });
    }
    public static setFilePrefix(filePrefix: string) {
        LoggerManager.filePrefix = filePrefix;
    }

    public static verbose(msg: string, metadata?: any): void {
        if (LoggerManager.loggerInst == null) {
            LoggerManager.initialize({});
        }
        LoggerManager.loggerInst.verbose(msg, metadata);
    }
    public static debug(msg: string, metadata?: any): void {
        if (LoggerManager.loggerInst == null) {
            LoggerManager.initialize({});
        }
        LoggerManager.loggerInst.debug(msg, metadata);
    }
    public static info(msg: string, metadata?: any): void {
        if (LoggerManager.loggerInst == null) {
            LoggerManager.initialize({});
        }
        LoggerManager.loggerInst.info(msg, metadata);
    }
    public static warn(msg: string, metadata?: any): void {
        if (LoggerManager.loggerInst == null) {
            LoggerManager.initialize({});
        }
        LoggerManager.loggerInst.warn(msg, metadata);
    }
    public static error(msg: string, metadata?: any): void {
        if (LoggerManager.loggerInst == null) {
            LoggerManager.initialize({});
        }
        LoggerManager.loggerInst.error(msg, metadata);
    }

    public static log(level: string, msg: string, callback: LogCallback): void {
        if (LoggerManager.loggerInst == null) {
            LoggerManager.initialize({});
        }
        LoggerManager.loggerInst.log(level, msg, callback);
        if (this.initParam.isDebug && callback != null) {
            callback();
        }
    }



    private static loggerInst: Logger;
    private static filePrefix: string = 'TM';
    private static initParam: LoggerManagerInitParam;
}
