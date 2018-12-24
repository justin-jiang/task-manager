export enum ApiResultCode {
    NONE = 0,
    Success = 1,
    SystemNotInitialized = 2,
    ApiNotImplemented = 3,
    MethodNotImplemented = 4,

    INPUT_VALIDATE_LOGO_TOO_LARGE = 20,
    INPUT_VALIDATE_INVALID_PARAM = 21,
    INPUT_VALIDATE_INVALID_SCENARIO = 22,

    Unauthorized = 50,
    Forbidden = 51,

    DB_VALIDATION_ERROR = 60,
    DB_NOT_FOUND = 61,
    DB_DUPLICATE_KEY = 62,
    DB_SCHEMA_PROP_MISSED = 63,

    FILE_FAILED_DOWNLOAD = 80,

    SystemError = 500,
}
