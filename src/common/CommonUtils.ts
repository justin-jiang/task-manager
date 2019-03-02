import { CheckState } from 'common/CheckState';
import { UserView } from 'common/responseResults/UserView';
import { UserRole } from 'common/UserRole';
import * as moment from 'moment';
import { UserObject } from 'server/dataObjects/UserObject';
import * as uuidv4 from 'uuid/v4';
export class CommonUtils {
    public static getUUIDForMongoDB(): string {
        return `M-${(uuidv4 as any)().replace(/-/g, '')}`;
    }

    public static isNullOrEmpty(value: any): boolean {
        if (value == null) {
            return true;
        }
        if (typeof value.trim === 'function' && value.trim() === '') {
            return true;
        }
        return false;
    }
    public static isPrimitiveString(value: any): boolean {
        if (typeof value === 'string') {
            return true;
        } else {
            return false;
        }
    }
    public static isPublisher(roles: UserRole[] | undefined): boolean {
        if (roles == null || roles.length === 0) {
            return false;
        }
        return roles.includes(UserRole.PersonalPublisher) || roles.includes(UserRole.CorpPublisher);
    }
    public static isExecutor(roles: UserRole[] | undefined): boolean {
        if (roles == null || roles.length === 0) {
            return false;
        }
        return roles.includes(UserRole.PersonalExecutor) || roles.includes(UserRole.CorpExecutor);
    }
    public static isAdmin(roles: UserRole[] | undefined): boolean {
        if (roles == null || roles.length === 0) {
            return false;
        }
        return roles.includes(UserRole.Admin);
    }

    public static isUserReady(user: UserView | UserObject): boolean {
        if (this.isAdmin(user.roles)) {
            return true;
        } else {
            return user.idState === CheckState.Checked &&
                user.qualificationState === CheckState.Checked;
        }
    }

    public static isReadyExecutor(user: UserView): boolean {
        return this.isExecutor(user.roles) && this.isUserReady(user);
    }

    public static isReadyPublisher(user: UserView): boolean {
        return this.isPublisher(user.roles) && this.isUserReady(user);
    }

    public static convertTimeStampToText(timestamp: number, onlyDate?: boolean): string {
        if (onlyDate) {
            return (moment as any)(timestamp).format('YYYY-MM-DD');
        } else {
            return (moment as any)(timestamp).format('YYYY-MM-DD HH:mm:ss');
        }
    }

    public static getRandomPassword(): string {
        const passwordChars: string[] = [];
        const possibleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const specialChars = '!@#$%^&';
        const passwordLen: number = 6;
        const randomSpecialChar: string = specialChars.charAt(Math.floor(Math.random() * specialChars.length));
        for (let i = 0; i < passwordLen; i++) {
            passwordChars.push(possibleChars.charAt(Math.floor(Math.random() * possibleChars.length)));
        }

        passwordChars.splice(Math.floor(Math.random() * passwordLen), 0, randomSpecialChar);
        return passwordChars.join('');
    }
}
