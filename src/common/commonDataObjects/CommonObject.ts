
export class CommonObject {
    [key: string]: any;
    public uid?: string;
    public createTime?: number;
    constructor(withFullProps?: boolean) {
        if (withFullProps === true) {
            this.uid = '';
            this.createTime = 0;
        }
    }
}

export function getPropKeys(dbObj: any): string[] {
    const propKeys: string[] = [];
    Object.keys(dbObj).forEach((key: string) => {
        if (dbObj[key] instanceof Function) {
            return;
        }
        propKeys.push(key);
    });
    return propKeys;
}
