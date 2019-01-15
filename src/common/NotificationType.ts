export enum NotificationType {
    None = 0,
    TaskApply = 1,
    TaskApplyDenied = 2,
    TaskApplyAccepted = 3,
    TaskAuditAccepted = 4,
    TaskAuditDenied = 5,
    TaskResultAccepted = 6,
    TaskResultDenied = 7,

    UserLogoCheckFailure = 11,
    UserLogoCheckPass = 12,
    FrontIdCheckFailure = 13,
    FrontIdCheckPass = 14,
    BackIdCheckFailure = 15,
    BackIdCheckPass = 16,
    UserQualificationCheckFailure = 17,
    UserQualificationCheckPass = 18,

}