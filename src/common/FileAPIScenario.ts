/**
 * the following scenario will leverage file API to create new DB object or update file
 */
export enum FileAPIScenario {
    NONE = 0,
    UploadUser = 1,
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

    UpdateUserLogo = 20,
    UpdateTemplateFile = 21,
    UpdateQualificationFile = 22,
    UpdateTaskResultFile = 23,
    UpdateUserFrontId = 24,
    UpdateUserBackId = 25,
    UpdateLicense = 26,
    UpdateLicenseWithPersion = 27,
    UpdateAuthLetter = 28,


}
