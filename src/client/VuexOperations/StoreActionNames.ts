export enum StoreActionNames {
    // #region -- User Actions
    userCreate = 'userCreate',
    userQuery = 'userQuery',
    userCheck = 'userCheck',
    userEnable = 'userEnable',
    userDisable = 'userDisable',
    userRemove = 'userRemove',
    userAccountInfoEdit = 'userAccountInfoEdit',
    userBasicInfoEdit = 'useBasicInfoEdit',
    userPasswordEdit = 'userPasswordEdit',
    userPasswordReset = 'userPasswordReset',
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
    taskInfoAudit = 'taskInfoAudit',
    taskApply = 'taskApply',
    taskApplyAudit = 'taskAppyAudit',
    taskApplyCheck = 'taskAppyCheck',
    taskApplyDeny = 'taskAppyDeny',
    taskApplyRemove = 'taskAppyRemove',
    taskDepositAudit = 'taskDepositAudit',
    taskBasicInfoEdit = 'taskBasicInfoEdit',
    taskCreation = 'taskCreation',
    taskHistoryQuery = 'taskHistoryQuery',
    taskPublisherVisit = 'taskPublisherVisit',
    taskQuery = 'taskQuery',
    taskRemove = 'taskRemove',

    // used by admin to audit the task result
    taskResultAuit = 'taskResultAudit',
    // used by publisher to check the task result
    taskResultCheck = 'taskResultCheck',
    taskSubmit = 'taskSubmit',
    // #endregion

    // #region -- notfication actions
    notificationQuery = 'notificationQuery',
    notificationRead = 'notificationRead',
    // #endregion
}
