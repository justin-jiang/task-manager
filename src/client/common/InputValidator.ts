export class InputValidator {
    public static passwordCheck(rule: any, value: string, callback: (param?: Error) => void) {
        const minLen: number = 6;
        if (!value) {
            return callback(new Error('不能为空'));
        } else if (value.length < minLen) {
            return callback(new Error(`长度不能小于${minLen}`));
        } else if (/^[a-zA-Z0-9]+$/i.test(value)) {
            return callback(new Error(`请包涵至少一个特殊字符`));
        } else {
            callback();
        }
    }
    public static checkEmail(rule: any, value: string, callback: any) {
        if (!value) {
            return callback(new Error('电子邮箱不能为空'));
        } else {
            // tslint:disable-next-line:max-line-length
            const emailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (emailPattern.test(value)) {
                callback();
            } else {
                callback(new Error('电子邮箱格式不正确'));
            }
        }
    }
    public static checkTelephone(rule: any, value: string, callback: any) {
        if (!value) {
            return callback(new Error('手机号码不能为空'));
        } else {
            // tslint:disable-next-line:max-line-length
            const regexPattern = /^(\+\d{1,3}[- ]?)?\d{11}$/;
            if (regexPattern.test(value)) {
                callback();
            } else {
                callback(new Error('手机号码格式不正确'));
            }
        }
    }
}
