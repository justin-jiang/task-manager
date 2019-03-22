export enum StoreActionNames {
    // #region -- User Actions
    userCreate = 'userCreate',
    userQuery = 'userQuery',
    userIdCheck = 'userIdCheck',
    userQualificationCheck = 'userQualificationCheck',
    userEnable = 'userEnable',
    userDisable = 'userDisable',
    userRemove = 'userRemove',
    userAccountInfoEdit = 'userAccountInfoEdit',
    userBasicInfoEdit = 'useBasicInfoEdit',
    userPasswordEdit = 'userPasswordEdit',
    userPasswordRecover = 'userPasswordRecover',
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

    taskApply = 'taskApply',
    taskMarginAudit = 'taskMarginAudit',
    taskApplyCheck = 'taskAppyCheck',
    taskApplyDeny = 'taskAppyDeny',
    taskApplyRemove = 'taskAppyRemove',
    taskBasicInfoEdit = 'taskBasicInfoEdit',
    taskCreation = 'taskCreation',
    taskDepositAudit = 'taskDepositAudit',
    taskExecutorAudit = 'taskExecutorAudit',
    taskHistoryQuery = 'taskHistoryQuery',
    taskInfoAudit = 'taskInfoAudit',
    taskPayToExecutor = 'taskPayToExecutor',
    taskPublisherVisit = 'taskPublisherVisit',
    taskReceiptDeny = 'taskReceiptDeny',
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
