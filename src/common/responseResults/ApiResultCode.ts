export enum ApiResultCode {
    Success = 0,
    UnknownError = 1,
    ApiNotImplemented = 2,
    MethodNotImplemented = 3,

    Unauthorized = 50,
    Forbidden = 51,

    DB_VALIDATION_ERROR = 60,
}
