import { ApiErrorHandler } from 'client/common/ApiErrorHandler';
import { msgConnectionIssue } from 'client/common/Constants';
import { RouterUtils } from 'client/common/RouterUtils';
import { ViewTextUtils } from 'client/common/ViewTextUtils';
import { ComponentUtils } from 'client/components/ComponentUtils';
import FileCheckDialogVue from 'client/components/FileCheckDialogVue.vue';
import IdentityCheckDialogVue from 'client/components/IdentityCheckDialogVue.vue';
import UserDetailInTableVue from 'client/components/UserDetailInTableVue.vue';
import { IStoreActionArgs } from 'client/VuexOperations/IStoreActionArgs';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { StoreActionNames } from 'client/VuexOperations/StoreActionNames';
import { StoreMutationNames } from 'client/VuexOperations/StoreMutationNames';
import { CheckState } from 'common/CheckState';
import { CommonUtils } from 'common/CommonUtils';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { FileDownloadParam } from 'common/requestParams/FileDownloadParam';
import { UserCheckParam } from 'common/requestParams/UserCheckParam';
import { UserDisableParam } from 'common/requestParams/UserDisableParam';
import { UserEnableParam } from 'common/requestParams/UserEnableParam';
import { UserPasswordResetParam } from 'common/requestParams/UserPasswordResetParam';
import { UserRemoveParam } from 'common/requestParams/UserRemoveParam';
import { ApiResult } from 'common/responseResults/APIResult';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { UserView } from 'common/responseResults/UserView';
import { UserRole } from 'common/UserRole';
import { UserState } from 'common/UserState';
import { UserType } from 'common/UserTypes';
import { Component, Vue } from 'vue-property-decorator';
import { Store } from 'vuex';
import { FileCheckParam } from 'common/requestParams/FileCheckParam';
const compToBeRegistered: any = {
    FileCheckDialogVue,
    IdentityCheckDialogVue,
    UserDetailInTableVue,
};

@Component({
    components: compToBeRegistered,
})
export class UserManagementTS extends Vue {
    // #region -- referred props and methods by this component
    private readonly executorTabName = 'executorTab';
    private readonly publisherTabName = 'publisherTab';
    private isInitialized: boolean = false;
    private activeTabName: string = this.executorTabName;
    private executorSearch: string = '';
    private publisherSearch: string = '';
    private idCheckDialogVisible: boolean = false;
    private qualificationCheckDialogVisible: boolean = false;
    private selectedUser: UserView = {};
    private get selectedUserUid(): string {
        return this.selectedUser == null ? '' : this.selectedUser.uid as string;
    }
    private get publisherObjs(): UserView[] {
        return this.storeState.userObjs.filter((item) => {
            if (CommonUtils.isNullOrEmpty(this.publisherSearch)) {
                if (CommonUtils.isPublisher(item.roles)) {
                    return true;
                } else {
                    return false;
                }
            } else {
                if (CommonUtils.isPublisher(item.roles) &&
                    (item.name as string).toLowerCase().includes(this.publisherSearch.toLowerCase())) {
                    return true;
                } else {
                    return false;
                }
            }
        });
    }
    private get executorObjs(): UserView[] {
        return this.storeState.userObjs.filter((item) => {
            if (CommonUtils.isNullOrEmpty(this.executorSearch)) {
                if (CommonUtils.isExecutor(item.roles)) {
                    return true;
                } else {
                    return false;
                }
            } else {
                if (CommonUtils.isExecutor(item.roles) &&
                    (item.name as string).toLowerCase().includes(this.executorSearch.toLowerCase())) {
                    return true;
                } else {
                    return false;
                }
            }
        });
    }
    private isSearchReady(user: UserView): boolean {
        return true;
    }
    private getUserState(user: UserView): string {
        return ComponentUtils.getUserStateText(user);
    }
    private getName(user: UserView): string {
        if (user.type === UserType.Corp) {
            return user.realName as string;
        } else {
            return user.re;
        }
    }
    private getPersonName(user: UserView): string {
        if (user.type === UserType.Corp) {
            return user.principalName as string;
        } else {
            return user.realName as string;
        }
    }
    private getUserRole(user: UserView): string {
        return ViewTextUtils.getUserRoleText((user.roles as UserRole[])[0]);
    }
    private getRegisterDate(user: UserView): string {
        return CommonUtils.convertTimeStampToText(user.createTime as number, true);
    }
    private btnTextForEnableOrDisable(user: UserView): string {
        if (user.state === UserState.Disabled) {
            return '启用';
        } else {
            return '禁用';
        }
    }

    private onUserDisableOrEnable(index: number, user: UserView): void {
        const actionName: string = user.state === UserState.Disabled ? '启用' : '禁用';
        const apiParam: UserDisableParam | UserEnableParam = user.state === UserState.Disabled ?
            { uid: user.uid } as UserEnableParam : { uid: user.uid } as UserDisableParam;
        const apiActionName: string = user.state === UserState.Disabled ?
            StoreActionNames.userEnable : StoreActionNames.userDisable;
        const confirm = this.$confirm(
            `确认要${actionName}此用户吗？`,
            '提示', {
                confirmButtonText: '确定',
                type: 'warning',
                center: true,
                closeOnClickModal: false,
            });
        confirm.then(() => {
            (async () => {
                const store = (this.$store as Store<IStoreState>);
                const apiResult: ApiResult = await store.dispatch(
                    apiActionName,
                    {
                        data: apiParam,
                    } as IStoreActionArgs);
                if (apiResult.code === ApiResultCode.Success) {
                    this.$message.success(`${actionName}用户成功`);
                } else {
                    this.$message.error(`${actionName}用户失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
                }
            })().catch((ex) => {
                RouterUtils.goToErrorView(this.$router, this.storeState, msgConnectionIssue, ex);
            });
        }).catch(() => {
            // do nothing for cancel
        });
    }
    private onUserDelete(index: number, user: UserView): void {
        const confirm = this.$confirm(
            `确认要删除此用户吗？`,
            '提示', {
                confirmButtonText: '确定',
                type: 'warning',
                center: true,
                closeOnClickModal: false,
            });
        confirm.then(() => {
            (async () => {
                const store = (this.$store as Store<IStoreState>);
                const apiResult: ApiResult = await store.dispatch(
                    StoreActionNames.userRemove,
                    {
                        data: { uid: user.uid } as UserRemoveParam,
                    } as IStoreActionArgs);
                if (apiResult.code === ApiResultCode.Success) {
                    this.$message.success(`删除用户成功`);
                } else {
                    this.$message.error(`删除用户失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
                }
            })().catch((ex) => {
                RouterUtils.goToErrorView(this.$router, this.storeState, msgConnectionIssue, ex);
            });
        }).catch(() => {
            // do nothing for cancel
        });
    }
    // #endregion

    // #region methods and props referred by Id check dialog
    private isIdToBeChecked(user: UserView): boolean {
        return ComponentUtils.isAllRequiredIdsUploaded(user) && user.idState === CheckState.ToBeChecked;
    }

    private onIdCheck(index: number, user: UserView): void {
        this.selectedUser = user;
        this.idCheckDialogVisible = true;
    }
    private onIdCheckCancelled(): void {
        this.idCheckDialogVisible = false;
    }
    private onIdCheckSubmit(checkParam: UserCheckParam): void {
        this.userCheck(this.selectedUser as UserView, checkParam);
    }

    private onUserPasswordReset(index: number, user: UserView): void {
        (async () => {
            const store = (this.$store as Store<IStoreState>);
            const apiResult: ApiResult = await store.dispatch(
                StoreActionNames.userCheck,
                {
                    data: { uid: user.uid } as UserPasswordResetParam,
                } as IStoreActionArgs);
            if (apiResult.code === ApiResultCode.Success) {
                this.$message.success(`提交成功`);
            } else {
                this.$message.error(`提交失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
            }
        })().finally(() => {
            this.idCheckDialogVisible = false;
            this.qualificationCheckDialogVisible = false;
        });
    }
    // #endregion

    // #region methods and props referred by file check dialog
    private isQualificationToBeChecked(user: UserView): boolean {
        return user.qualificationState === CheckState.ToBeChecked;
    }
    private onQualificationDownload() {
        ComponentUtils.downloadFile(this,
            {
                scenario: FileAPIScenario.DownloadQualificationFile,
                fileId: (this.selectedUser as UserView).qualificationUid,
                version: (this.selectedUser as UserView).qualificationVersion,
            } as FileDownloadParam,
            `${(this.selectedUser as UserView).name}.zip`);
    }
    private onQualificationCheck(index: number, user: UserView): void {
        this.selectedUser = user;
        this.qualificationCheckDialogVisible = true;
    }
    private onQualificationCheckSubmit(fileCheckParam: FileCheckParam): void {
        const userCheckParam: UserCheckParam = new UserCheckParam();
        userCheckParam.uid = this.selectedUser.uid;
        userCheckParam.qualificationState = fileCheckParam.state;
        userCheckParam.qualificationStar = fileCheckParam.star;
        userCheckParam.qualificationScore = fileCheckParam.score;
        userCheckParam.qualificationCheckNote = fileCheckParam.note;
        this.userCheck(this.selectedUser as UserView, userCheckParam);
    }
    private onQualificationCheckCancelled(): void {
        this.qualificationCheckDialogVisible = false;
    }
    // #endregion

    // #region -- vue life-circle methods
    private mounted(): void {
        (async () => {
            this.$$pullUserObjs();
        })();
    }
    // #endregion

    // #region -- internal variables and methods
    private readonly store = (this.$store as Store<IStoreState>);
    private readonly storeState = (this.$store.state as IStoreState);
    private async $$pullUserObjs(): Promise<void> {
        const apiResult: ApiResult = await this.store.dispatch(
            StoreActionNames.userQuery, { notUseLocalData: true } as IStoreActionArgs);
        if (apiResult.code !== ApiResultCode.Success) {
            RouterUtils.goToErrorView(
                this.$router,
                this.storeState,
                `获取用户信息失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
        } else {
            this.isInitialized = true;
        }
    }
    private userCheck(user: UserView, userCheckParam: UserCheckParam) {
        (async () => {
            const store = (this.$store as Store<IStoreState>);
            const apiResult: ApiResult = await store.dispatch(
                StoreActionNames.userCheck,
                {
                    data: userCheckParam,
                } as IStoreActionArgs);
            if (apiResult.code === ApiResultCode.Success) {
                const updatedUserView = apiResult.data;
                this.store.commit(StoreMutationNames.userItemReplace, updatedUserView);
                this.$message.success(`提交成功`);
            } else {
                this.$message.error(`提交失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
            }
        })().finally(() => {
            this.idCheckDialogVisible = false;
            this.qualificationCheckDialogVisible = false;
        });
    }
    // #endregion
}
