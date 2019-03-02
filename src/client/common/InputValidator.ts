export class InputValidator {
    public static passwordCheck(rule: any, value: string, callback: (param?: Error) => void) {
        const minLen: number = 6;
        if (!value) {
            return callback(new Error('不能为空'));
        } else if (value.length < minLen) {
            return callback(new Error(`长度不能小于${minLen}`));
        } else if (/^[a-zA-Z0-9]+$/i.test(value)) {
            return callback(new Error(`请包含至少一个特殊字符`));
        } else {
            callback();
        }
    }
    public static checkEmail(rule: any, value: string, callback: any): void {
        if (!value) {
            callback(new Error('电子邮箱不能为空'));
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
    public static checkAccountName(rule: any, value: string, callback: any): void {
        if (!value) {
            callback(new Error('账号名称不能为空'));
        } else {
            // tslint:disable-next-line:max-line-length
            const namePattern = /^[0-9a-zA-Z-_]{3,}$/;
            if (namePattern.test(value)) {
                callback();
            } else {
                callback(new Error('三位或以上数字，字母，短横线和下划线的组合'));
            }
        }
    }
    public static checkTelephone(rule: any, value: string, callback: any) {
        if (!value) {
            return callback(new Error('手机号码不能为空'));
        } else {
            // tslint:disable-next-line:max-line-length
            const regexPattern = /^(\+\d{1,3}[- ]?)?1\d{10}$/;
            if (regexPattern.test(value)) {
                callback();
            } else {
                callback(new Error('手机号码格式不正确'));
            }
        }
    }

    public static checkIdNumber(rule: any, value: string, callback: any) {
        // 加权因子
        const weightFactor: number[] = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
        // 校验码
        const checkCode: string[] = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];


        const last = value[17];

        const seventeen = value.substring(0, 17);

        // ISO 7064:1983.MOD 11-2
        // 判断最后一位校验码是否正确
        const arr: string[] = seventeen.split("");
        const len: number = arr.length;
        let num: number = 0;
        for (let i = 0; i < len; i++) {
            num = num + parseInt(arr[i], 10) * weightFactor[i];
        }

        // 获取余数
        const resisue: number = num % 11;
        const lastNo: string = checkCode[resisue];

        // 格式的正则
        // 正则思路
        /*
        第一位不可能是0
        第二位到第六位可以是0-9
        第七位到第十位是年份，所以七八位为19或者20
        十一位和十二位是月份，这两位是01-12之间的数值
        十三位和十四位是日期，是从01-31之间的数值
        十五，十六，十七都是数字0-9
        十八位可能是数字0-9，也可能是X
        */
        // tslint:disable-next-line:max-line-length
        const idcardPattern = /^[1-9][0-9]{5}([1][9][0-9]{2}|[2][0][0|1][0-9])([0][1-9]|[1][0|1|2])([0][1-9]|[1|2][0-9]|[3][0|1])[0-9]{3}([0-9]|[X])$/;

        // 判断格式是否正确
        const format = idcardPattern.test(value);


        if (last === lastNo && format) {
            callback();
        } else {
            callback(new Error('身份证号码格式不正确'));
        }
    }
}
