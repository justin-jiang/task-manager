export enum TaskState {
    None = 0,
    // task is created and wait to be submitted by publisher
    Created = 1,
    // task has been submitted, info is waitted to be auditted by admin
    Submitted = 2,

    // deposit has been sumbitted, and wait for admin to audit
    DepositUploaded = 4,
    // both info and deposit has been auditted and wait to be applied by executors
    ReadyToApply = 5,
    // task has been applied by some executor and wait for margin
    Applying = 6,
    // executor has sumbit the margin and wait for be audit by admin
    MarginUploaded = 7,
    // margin has been auditted and task has been assigned to the executor too, wait for the task regin from executor
    Assigned = 8,
    // task result has been uploaded by executor and wait to be auditted by admin
    ResultUploaded = 9,
    // task result has been auditted by admin and wait for the publisher check
    ResultAudited = 10,
    // publisher has acceptted the result and wait to be visited by admin
    ResultChecked = 11,
    // publisher visit has been done by admin and wait to pay to executor
    PublisherVisited = 12,
    // has paid to executor
    ExecutorPaid = 13,
    ReceiptUploaded = 14,

    // some sub state which will be used in task histories
    InfoAuditDenied = 101,
    DepositAuditDenied = 102,
    ExecutorAuditDenied = 103,
    ResultAuditDenied = 104,
    ResultCheckDenied = 105,
    MarginAuditDenied = 106,
    ApplyReleased = 107,
    DepositRefund = 108,
    MarginRefund = 109,
}

