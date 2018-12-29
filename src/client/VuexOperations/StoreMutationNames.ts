export enum StoreMutationNames {
    // #region -- user relative mutations
    usersUpdate = 'usersUpdate',
    userItemInsert = 'userItemInsert',
    userItemReplace = 'userItemReplace',
    // #endregion

    // #region -- session relative mutations
    sessionInfoUpdate = 'sessionInfoUpdate',
    // #endregion

    // #region -- template relative
    templatesUpdate = 'templatesUpdate',
    // #endregion

    // #region -- task relative
    tasksUpdate = 'tasksUpdate',
    taskItemReplace = 'taskItemReplace',
    taskItemRemove = 'taskItemRemove',
    // #endregion
}
