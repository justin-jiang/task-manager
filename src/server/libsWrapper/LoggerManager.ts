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
        const myFormat = printf((info: any) => {
            const timestamp: string = (moment as any)(new Date()).format('YYYY-MM-DD hh:mm:ss:SSS');
            const validMetadata = [];
            let metadataJSON: string | undefined;
            if (info.metadata != null) {
                if (info.metadata instanceof Array) {
                    if (info.metadata.length > 0) {
                        (info.metadata as []).forEach((item) => {
                            if (Object.keys(item).length > 0) {
                                validMetadata.push(item);
                            }
                        });
                    }
                } else if (Object.keys(info.metadata).length > 0) {
                    validMetadata.push(info.metadata);
                }
                if (validMetadata.length > 0) {
                    try {
                        metadataJSON = JSON.stringify(validMetadata);
                    } catch (ex) {
                        metadataJSON = JSON.stringify({ error: 'JSON.stringify' });
                    }
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
                dirname: './logs',
                filename: `${LoggerManager.filePrefix}_%DATE%_${process.pid}.log'`,
                datePattern: 'YYYY-MM-DD',
                maxFiles: '10',
                maxsize: '100m',
                level: 'info',
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
    private static filePrefix: string = 'log';
    private static initParam: LoggerManagerInitParam;
}
