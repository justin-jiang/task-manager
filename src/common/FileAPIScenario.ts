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

    UpdateUserLogo = 20,
    UpdateTemplateFile = 21,
    UpdateQualificationFile = 22,
    UpdateTaskResultFile = 23,

    UpdateUserFrontId = 24,
    UpdateUserBackId = 25,

}
