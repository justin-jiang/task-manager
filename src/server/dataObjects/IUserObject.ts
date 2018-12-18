import { IDBObject } from './IDBObject';
import { UserRole } from 'common/CommonTypes';
import { IQueryConditions } from 'common/requestParams/IQueryConditions';
export interface IUserObject extends IDBObject {
    name: string;
    email: string;
    password: string;
    logoId: string;
    type: number;
    telephone: string;
    roles: UserRole[];
    lastLogonTime: number;
    $$find?(conditions: IQueryConditions): Promise<IUserObject[]>;
}

function getPropKeys(): string[] {
    const propKeys: string[] = [];
    const inst = getBlankIUserModel();
    Object.keys(inst).forEach((key: string) => {
        if (inst[key] instanceof Function) {
            return;
        }
        propKeys.push(key);
    });
    return propKeys;
}
export const keysOfIUserObject: string[] = getPropKeys();

export function getBlankIUserModel(): IUserObject {
    const inst: IUserObject = {
        name: '',
        email: '',
        password: '',
        logoId: '',
        type: 0,
        telephone: '',
        roles: [],
        lastLogonTime: 0,
        uid: '',
        createTime: 0,
    };
    return inst;
}
