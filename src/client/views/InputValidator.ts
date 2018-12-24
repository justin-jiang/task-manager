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
}
