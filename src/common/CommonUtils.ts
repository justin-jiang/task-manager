import { DBObjectView } from 'common/responseResults/DBObjectView';
import { IdentityState } from 'common/responseResults/IdentityState';
import { QualificationState } from 'common/responseResults/QualificationState';
import { UserView } from 'common/responseResults/UserView';
import { UserRole } from 'common/UserRole';
import * as moment from 'moment';
import { DBObject } from 'server/dataObjects/DBObject';
import { UserObject } from 'server/dataObjects/UserObject';
import * as uuidv4 from 'uuid/v4';
import { LogoState } from './responseResults/LogoState';
import { UserState } from './UserState';
export class CommonUtils {
    public static getUUIDForMongoDB(): string {
        return `M-${(uuidv4 as any)().replace(/-/g, '')}`;
    }

    public static getPropKeys(dbObj: DBObject | DBObjectView): string[] {
        const propKeys: string[] = [];
        Object.keys(dbObj).forEach((key: string) => {
            if (dbObj[key] instanceof Function) {
                return;
            }
            propKeys.push(key);
        });
        return propKeys;
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
        return user.logoState === LogoState.Checked &&
            user.qualificationState === QualificationState.Checked &&
            user.frontIdState === IdentityState.Checked &&
            user.backIdState === IdentityState.Checked &&
            user.state === UserState.Enabled;
    }

    public static isReadyExecutor(user: UserView): boolean {
        return this.isExecutor(user.roles) && this.isUserReady(user);
    }

    public static isReadyPublisher(user: UserView): boolean {
        return this.isPublisher(user.roles) && this.isUserReady(user);
    }

    public static convertTimeStampToText(timestamp: number): string {
        return (moment as any)(timestamp).format('YYYY-MM-DD HH:mm:ss');
    }
}
