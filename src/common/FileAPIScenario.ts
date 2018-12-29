/**
 * the following scenario will leverage file API to create new DB object or update file
 */
export enum FileAPIScenario {
    NONE = 0,
    UploadUser = 1,
    UploadTemplate = 2,


    DownloadUserLogo = 4,
    DownloadTemplateFile = 5,
    DownloadQualificationFile = 6,

    UpdateUserLogo = 7,
    UpdateTemplateFile = 8,
    UpdateQualificationFile = 9,
    UpdateTaskResultFile = 10,

}
