
export class CommonObject {
    [key: string]: any;
    public uid?: string;
    constructor(withFullProps?: boolean) {
        if (withFullProps === true) {
            this.uid = '';
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
