export enum ApiResultCode {
    NONE = 0,
    Success = 1,
    SystemNotInitialized = 2,
    ApiNotImplemented = 3,
    MethodNotImplemented = 4,

    InputImageTooLarge = 20,
    InputInvalidParam = 21,
    InputInvalidScenario = 22,
    InputInvalidPassword = 23,

    AuthUnauthorized = 50,
    AuthForbidden = 51,
    AuthUserNotReady = 52,

    DbValidationError = 60,
    DbNotFound = 61,
    DbDuplicateKey = 62,
    DbSchemaPropMissed = 63,
    DbUnexpectedUserState = 64,

    FileFailedDownload = 80,
    FileFailedUpload = 81,

    ConnectionError = 500,
}
