/**
 * the following scenario will leverage file API to create new DB object or update file
 */
export enum FileAPIScenario {
    None = 0,
    CreateTaskTemplate = 1,

    DownloadTaskResultFile = 10,
    DownloadUserLogo = 11,
    DownloadTemplateFile = 12,
    DownloadQualificationFile = 13,
    DownloadFrontId = 14,
    DownloadBackId = 15,
    DownloadAuthLetter = 16,
    DownloadLicense = 17,
    DownloadLinceWithPerson = 18,
    DownloadQualificationTemplate = 19,
    DownloadTaskDepositImage = 20,
    DownloadTaskMarginImage = 21,
    DownloadRegisterProtocol = 22,


    UploadUserLogo = 30,
    UploadQualificationTemplate = 31,
    UploadQualification = 32,
    UploadTaskResult = 33,
    UploadUserFrontId = 34,
    UploadUserBackId = 35,
    UploadLicense = 36,
    UploadLicenseWithPerson = 37,
    UploadAuthLetter = 38,
    UploadTaskDeposit = 39,
    UploadTaskMargin = 40,
    UploadTaskExecutorPay = 41,
    UploadExecutorTaskReceipt = 42,
    UploadRegisterProtocol = 43,
    UploadTaskRefund = 44,

}
