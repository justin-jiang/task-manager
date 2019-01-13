export enum StoreActionNames {
    // #region -- User Actions
    userCreate = 'userCreate',
    userQuery = 'userQuery',
    userCheck = 'userCheck',
    userEnable = 'userEnable',
    userDisable = 'userDisable',
    userRemove = 'userRemove',
    userBasicInfoEdit = 'useBasicInfoEdit',
    userPasswordEdit = 'userPasswordEdit',
    // #endregion

    // #region -- File Actions
    fileUpload = 'fileUpload',
    fileDownload = 'fileDownload',
    fileMetaDataQuery = 'fileMetaDataQuery',
    // #endregion

    // #region -- Session Actions
    sessionCreate = 'sessionCreate',
    sessionQuery = 'sessionQuery',
    sessionRemove = 'sessionRemove',
    // #endregion

    // #region -- Template Actions
    templateEdit = 'templateEdit',
    templateQuery = 'templateQuery',
    templateRemove = 'templateRemove',
    // #endregion

    // #region -- task actions
    taskCreation = 'taskCreation',
    taskQuery = 'taskQuery',
    taskApply = 'taskApply',
    taskApplyCheck = 'taskAppyCheck',
    taskApplyDeny = 'taskAppyDeny',
    taskRemove = 'taskRemove',
    taskResultCheck = 'taskResultCheck',
    // #endregion

    // #region -- notfication actions
    notificationQuery = 'notificationQuery',
    notificationRead = 'notificationRead',
    // #endregion
}
