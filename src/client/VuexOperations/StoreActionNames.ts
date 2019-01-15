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
    // used by admin to check whether the task can be published
    taskAudit = 'taskAudit',
    taskCreation = 'taskCreation',
    taskQuery = 'taskQuery',
    taskApply = 'taskApply',
    // used by admin to check the task apply 
    // the publisher cannot see the apply until the admin approve the apply
    taskApplyAudit = 'taskAppyAudit',
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
