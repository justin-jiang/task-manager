export enum ApiResultCode {
    NONE = 0,
    Success = 1,
    SystemNotInitialized = 2,
    ApiNotImplemented = 3,
    MethodNotImplemented = 4,

    InputImageTooLarge = 20,
    InputInvalidParam = 21,
    InputInvalidFileScenario = 22,
    InputInvalidPassword = 23,
    InputImageInvalidType = 24,

    AuthUnauthorized = 50,
    AuthForbidden = 51,
    AuthUserNotReady = 52,
    Auth_Not_Task_Publisher_Onwer = 53,
    Auth_User_Disabled = 54,
    Auth_Not_Task_Assigned_Executor = 55,
    Auth_Not_Task_Applicant = 56,

    DbValidationError = 60,
    DbNotFound = 61,
    DbDuplicateKey = 62,
    DbSchemaPropMissed = 63,
    DbUnexpectedUserState = 64,
    DbNotFound_User = 65,
    Db_Qualification_Template_Missed = 66,
    Db_Register_Protocol_Missed = 67,

    FileFailedDownload = 80,
    FileFailedUpload = 81,

    Logic_Receipt_State_Not_Matched = 200,
    Logic_Task_State_Not_Matched = 201,
    Logic_Task_Been_Applied = 202,

    ConnectionError = 500,
}
