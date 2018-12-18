// tslint:disable:no-console
export class LoggerManager {
    public static trace(msg: string, ...args: any[]): void {
        if ((window as any).DEBUG === true) {
            console.trace(msg, args);
        }
    }

    public static debug(msg: string, ...args: any[]): void {
        if ((window as any).DEBUG === true) {
            console.debug(msg, args);
        }
    }
    public static info(msg: string, ...args: any[]): void {
        if ((window as any).DEBUG === true) {
            console.info(msg, args);
        }
    }
    public static warn(msg: string, ...args: any[]): void {
        console.warn(msg, args);
    }
    public static error(msg: string, ...args: any[]): void {
        console.error(msg, args);
    }
}
