// import { ValueParser } from './ValueParser';
import * as moment from 'moment';
import { createLogger, format, Logger, transports, LogCallback } from 'winston';

// tslint:disable-next-line:no-var-requires
const DailyRotateFile = require('winston-daily-rotate-file');

/**
 * LoggerManager for server, now we use the winstonLogger
 * if DebugMode, we log the message to console
 * if not, we log the message to file
 */
export class LoggersManager {
    public static setFilePrefix(filePrefix: string) {
        LoggersManager.filePrefix = filePrefix;
    }

    public static verbose(msg: string, ...args: any[]): void {
        if (LoggersManager.loggerInst == null) {
            LoggersManager.initialize();
        }
        LoggersManager.loggerInst.verbose(msg, args);
    }
    public static debug(msg: string, ...args: any[]): void {
        if (LoggersManager.loggerInst == null) {
            LoggersManager.initialize();
        }
        if (args != null) {
            LoggersManager.loggerInst.debug(msg, args);
        } else {
            LoggersManager.loggerInst.debug(msg);
        }

    }
    public static info(msg: string, ...args: any[]): void {
        if (LoggersManager.loggerInst == null) {
            LoggersManager.initialize();
        }
        LoggersManager.loggerInst.info(msg, args);
    }
    public static warn(msg: string, ...args: any[]): void {
        if (LoggersManager.loggerInst == null) {
            LoggersManager.initialize();
        }
        LoggersManager.loggerInst.warn(msg, args);
    }
    public static error(msg: string, ...args: any[]): void {
        if (LoggersManager.loggerInst == null) {
            LoggersManager.initialize();
        }
        LoggersManager.loggerInst.error(msg, args);
    }

    public static log(level: string, msg: string, callback: LogCallback): void {
        if (LoggersManager.loggerInst == null) {
            LoggersManager.initialize();
        }
        LoggersManager.loggerInst.log(level, msg, callback);
    }



    private static loggerInst: Logger;
    private static filePrefix: string = 'log';

    /**
     * Initialize the console logger transport, daily rolling file logger
     * and defaultServerLogger
     */
    private static initialize() {
        const { printf } = format;
        const myFormat = printf((info: any) => {
            const timestamp: string = (moment as any)(new Date()).format('YYYY-MM-DD hh:mm:ss:SSS');
            return `${timestamp} ${info.level}: ${info.message}`;
        });
        const rollingFaleTransport = new DailyRotateFile({
            dirname: './logs',
            filename: `${LoggersManager.filePrefix}_%DATE%_${process.pid}.log'`,
            datePattern: 'YYYY-MM-DD',
            maxFiles: '10',
            maxsize: '100m',
            level: 'info',
            format: format.combine(
                myFormat,
            ),
        });

        LoggersManager.loggerInst = createLogger({
            // format: format.combine(
            //     format.splat(),
            //     format.simple(),
            // ),
            transports: [
                new transports.Console({
                    level: 'debug',
                    format: format.combine(
                        format.colorize(),
                        myFormat,
                    ),
                }),
                rollingFaleTransport,
            ],
        });
    }
}
