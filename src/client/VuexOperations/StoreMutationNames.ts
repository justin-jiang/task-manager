export enum StoreMutationNames {
    // #region -- user relative mutations
    usersUpdate = 'usersUpdate',
    userItemInsert = 'userItemInsert',
    userItemReplace = 'userItemReplace',
    userItemDelete = 'userItemDelete',
    userItemUpdate = 'userItemUpdate',
    // #endregion

    // #region -- session relative mutations
    sessionInfoUpdate = 'sessionInfoUpdate',
    sessionInfoPropUpdate = 'sessionInfoPropUpdate',
    sessionRedirectUrlUpdate = 'sessionRedirectUrlUpdate',
    sessionReset = 'sessionReset',
    // #endregion

    // #region -- template relative
    templatesUpdate = 'templatesUpdate',
    templateItemRemove = 'templateItemRemove',
    templateItemReplace = 'templateItemReplace',
    templateItemInsert = 'templateItemInsert',
    // #endregion

    // #region -- task relative
    tasksUpdate = 'tasksUpdate',
    taskItemInsert = 'taskItemInsert',
    taskItemReplace = 'taskItemReplace',
    taskItemRemove = 'taskItemRemove',
    // #endregion

    // #region -- notification relative
    notificationUpdate = 'notificationUpdate',
    notificationItemReplace = 'notificationItemReplace',
    notificationItemInsert = 'notificationItemInsert',
    // #endregion
}
