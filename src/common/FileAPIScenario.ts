/**
 * For user related file, 
 * the value will be part of file entry(i.e. <uid>-<scenario number>_<version number>).
 * So !!!!!! Please don't change the value !!!!!!!!!
 */
export enum FileAPIScenario {
    NONE = 0,
    CreateUser = 1,
    CreateTemplate = 2,
    CreateQualification = 3,

    DownloadUserLogo = 4,
    DownloadTemplateFile = 5,
    DownloadQualificationFile = 6,

    EditUserLogo = 7,
    EditTemplateFile = 8,
    EditQualificationFile = 9,

}
