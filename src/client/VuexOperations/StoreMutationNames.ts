export enum StoreMutationNames {
    // #region -- user relative mutations
    usersUpdate = 'usersUpdate',
    userItemInsert = 'userItemInsert',
    userItemReplace = 'userItemReplace',
    userItemDelete = 'userItemDelete',
    // #endregion

    // #region -- session relative mutations
    sessionInfoUpdate = 'sessionInfoUpdate',
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
}
