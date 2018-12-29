export enum ApiResultCode {
    NONE = 0,
    Success = 1,
    SystemNotInitialized = 2,
    ApiNotImplemented = 3,
    MethodNotImplemented = 4,

    INPUT_VALIDATE_LOGO_TOO_LARGE = 20,
    INPUT_VALIDATE_INVALID_PARAM = 21,
    INPUT_VALIDATE_INVALID_SCENARIO = 22,

    Auth_Unauthorized = 50,
    Auth_Forbidden = 51,
    Auth_User_Not_Ready = 52,

    DB_VALIDATION_ERROR = 60,
    DB_NOT_FOUND = 61,
    DB_DUPLICATE_KEY = 62,
    DB_SCHEMA_PROP_MISSED = 63,
    DB_Unexpected_User_State = 64,

    FILE_FAILED_DOWNLOAD = 80,

    SystemError = 500,
}
