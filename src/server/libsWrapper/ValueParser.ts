export class ValueParser {
    public static parseBoolean(
        value: string | null | boolean | number | undefined,
        defaultValue: boolean): boolean {
        if (value == null) {
            return defaultValue;
        }
        if (typeof (value) === 'boolean') {
            return value;
        }
        if (typeof (value) === 'string') {
            if (/^true$/i.test(value)) {
                return true;
            } else {
                return false;
            }
        }
        if (typeof (value) === 'number') {
            if (value <= 0) {
                return false;
            } else {
                return true;
            }
        }
        return defaultValue;
    }
    public static parseNumber(value: string | number | undefined, defaultValue: number) {
        if (value == null) {
            return defaultValue;
        }
        const parsedResult = parseInt(value as string, 10);

        if (isNaN(parsedResult)) {
            return defaultValue;
        }

        return parsedResult;
    }
}
