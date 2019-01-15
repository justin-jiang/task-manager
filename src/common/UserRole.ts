
export enum UserRole {
    None = 0,
    Admin = 1,
    CorpPublisher = 2,
    PersonalPublisher = 3,
    CorpExecutor = 4,
    PersonalExecutor = 5,
}

export function getUserRowText(role: UserRole): string {
    switch (role) {
        case UserRole.CorpExecutor:
            return '企业执行者';
        case UserRole.PersonalExecutor:
            return '个人执行者';
        case UserRole.CorpPublisher:
            return '企业发布者';
        case UserRole.PersonalPublisher:
            return '个人发布者';
        default:
            return '无效角色';
    }

}
