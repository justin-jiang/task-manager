export enum StoreActionNames {
    // #region -- User Actions
    userCreate = 'userCreate',
    userQuery = 'userQuery',
    userCheck = 'userCheck',
    // #endregion

    // #region -- File Actions
    fileCreate = 'fileCreate',
    fileDownload = 'fileDownload',
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
    taskApplyAccept = 'taskAppyAccept',
    taskApplyDeny = 'taskAppyDeny',
    taskRemove = 'taskRemove',
    // #endregion
}
