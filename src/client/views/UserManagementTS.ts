import { ApiErrorHandler } from 'client/common/ApiErrorHandler';
import { msgConnectionIssue } from 'client/common/Constants';
import { RouterUtils } from 'client/common/RouterUtils';
import { StoreUtils } from 'client/common/StoreUtils';
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
import { FileCheckParam } from 'common/requestParams/FileCheckParam';
import { FileDownloadParam } from 'common/requestParams/FileDownloadParam';
import { UserDisableParam } from 'common/requestParams/UserDisableParam';
import { UserEnableParam } from 'common/requestParams/UserEnableParam';
import { UserIdCheckParam } from 'common/requestParams/UserIdCheckParam';
import { UserPasswordResetParam } from 'common/requestParams/UserPasswordResetParam';
import { UserQualificationCheckParam } from 'common/requestParams/UserQualificationCheckParam';
import { UserRemoveParam } from 'common/requestParams/UserRemoveParam';
import { ApiResult } from 'common/responseResults/APIResult';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { PasswordResetResult } from 'common/responseResults/PasswordResetResult';
import { UserView } from 'common/responseResults/UserView';
import { UserRole } from 'common/UserRole';
import { UserState } from 'common/UserState';
import { UserType } from 'common/UserTypes';
import { Component, Vue } from 'vue-property-decorator';
import { Store } from 'vuex';
const compToBeRegistered: any = {
    FileCheckDialogVue,
    IdentityCheckDialogVue,
    UserDetailInTableVue,
};

@Component({
    components: compToBeRegistered,
})
/**
 * used by admin to manage the executor and publisher
 */
export class UserManagementTS extends Vue {
    // #region -- reference by template
    private readonly userTableRefName: string = 'userTable';
    private readonly typeFilter = [{ text: '企业', value: UserType.Corp }, { text: '个人', value: UserType.Individual }];
    private executorSearch: string = '';
    private publisherSearch: string = '';
    private idCheckDialogVisible: boolean = false;
    private qualificationCheckDialogVisible: boolean = false;
    private selectedUser: UserView = {};
    private get selectedUserUid(): string {
        return this.selectedUser == null ? '' : this.selectedUser.uid as string;
    }
    private isSearchReady(user: UserView): boolean {
        return true;
    }
    private getUserState(user: UserView): string {
        return ViewTextUtils.getUserStateText(user);
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

    private isDisabled(index: number, user: UserView): boolean {
        return user.state === UserState.Disabled;
    }

    private realNameSort(a: UserView, b: UserView): number {
        const aRealName = a.realName as string || '';
        const bRealName = b.realName as string || '';
        return aRealName.localeCompare(bRealName, 'zh-CN');
    }

    /**
     * Disable or Enable User
     * @param index 
     * @param user 
     */
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
                customClass: 'confirm-danger',
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

    private onUserPasswordReset(index: number, user: UserView): void {
        const confirm = this.$confirm(
            `系统会产生一个新的随机密码，确认要重置用户${user.name}的密码吗？`,
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
                    StoreActionNames.userPasswordReset,
                    {
                        data: { uid: user.uid } as UserPasswordResetParam,
                    } as IStoreActionArgs);
                if (apiResult.code === ApiResultCode.Success) {
                    const resultConfirm = this.$confirm(
                        `提交成功，新密码为：${(apiResult.data as PasswordResetResult).password}，用户邮箱为：${user.email}`,
                        '提示', {
                            confirmButtonText: '复制密码到剪切板',
                            cancelButtonText: '关闭',
                            type: 'warning',
                            center: true,
                            closeOnClickModal: false,
                        });
                    resultConfirm.then(() => {
                        ComponentUtils.copyEmailAddressToClipboard(
                            (apiResult.data as PasswordResetResult).password as string);
                        this.$message.success('复制成功');
                    }).catch(() => { });
                } else {
                    this.$message.error(`提交失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
                }
            })();
        }).catch(() => {
            // do nothing for cancel
        });
    }

    private onRowClick(task: UserView, column: any): void {
        (this.$refs[this.userTableRefName] as any).toggleRowExpansion(task);
    }

    private typeFilterHandler(value: UserType, row: UserView, column: any): boolean {
        return value === row.type;
    }
    // #endregion

    // #region -- references by button-radio-group
    private readonly executorRadioLab: number = 0;
    private readonly publisherRadioLab: number = 1;
    private filterRadio: number = this.executorRadioLab;
    // #endregion

    // #region -- references by user table
    private get filterUserObjs(): UserView[] {
        const result: UserView[] = this.storeState.userObjs.filter((item) => {
            if (this.filterRadio === this.executorRadioLab) {
                if (CommonUtils.isExecutor(item)) {
                    return true;
                } else {
                    return false;
                }
            } else {
                if (CommonUtils.isPublisher(item)) {
                    return true;
                } else {
                    return false;
                }
            }
        });
        return result.filter(
            (data: UserView) => !CommonUtils.isNullOrEmpty(this.executorSearch) ||
                (data.name as string).toLowerCase().includes(this.executorSearch.toLowerCase()));
    }
    // #endregion 

    // #region methods and props referred by Id check dialog
    private isIdToBeChecked(user: UserView): boolean {
        return CommonUtils.isAllRequiredIdsUploaded(user) && user.idState === CheckState.ToBeChecked;
    }

    private onIdCheck(index: number, user: UserView): void {
        this.selectedUser = user;
        this.idCheckDialogVisible = true;
    }
    private onIdCheckCancel(): void {
        this.idCheckDialogVisible = false;
    }
    private onIdCheckSubmit(checkParam: UserIdCheckParam): void {
        (async () => {
            const store = (this.$store as Store<IStoreState>);
            const apiResult: ApiResult = await store.dispatch(
                StoreActionNames.userIdCheck,
                {
                    data: checkParam,
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
        const userCheckParam: UserQualificationCheckParam = new UserQualificationCheckParam();
        userCheckParam.uid = this.selectedUser.uid;
        userCheckParam.qualificationState = fileCheckParam.state;
        userCheckParam.qualificationStar = fileCheckParam.star;
        userCheckParam.qualificationScore = fileCheckParam.score;
        userCheckParam.qualificationCheckNote = fileCheckParam.note;
        (async () => {
            const store = (this.$store as Store<IStoreState>);
            const apiResult: ApiResult = await store.dispatch(
                StoreActionNames.userQualificationCheck,
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
            this.qualificationCheckDialogVisible = false;
        });
    }
    private onQualificationCheckCancel(): void {
        this.qualificationCheckDialogVisible = false;
    }
    // #endregion

    // #region -- vue life-circle methods
    private mounted(): void {
        (async () => {
            await StoreUtils.$$pullAllUsers(this.store);
        })();
    }
    // #endregion

    // #region -- internal variables and methods
    private readonly store = (this.$store as Store<IStoreState>);
    private readonly storeState = (this.$store.state as IStoreState);
    // #endregion
}
