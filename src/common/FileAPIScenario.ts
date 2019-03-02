/**
 * the following scenario will leverage file API to create new DB object or update file
 */
export enum FileAPIScenario {
    None = 0,
    UploadTemplate = 2,


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
    

    UpdateUserLogo = 30,
    UpdateTemplateFile = 31,
    UpdateQualificationFile = 32,
    UpdateTaskResultFile = 33,
    UpdateUserFrontId = 34,
    UpdateUserBackId = 35,
    UpdateLicense = 36,
    UpdateLicenseWithPersion = 37,
    UpdateAuthLetter = 38,
    UpdateDeposit = 39,
    UpdateMargin = 40,


}
