import { ApiErrorHandler } from 'client/common/ApiErrorHandler';
import { msgConnectionIssue } from 'client/common/Constants';
import { RouterUtils } from 'client/common/RouterUtils';
import FileCheckDialogVue from 'client/components/FileCheckDialogVue.vue';
import IdentityCheckDialogVue from 'client/components/IdentityCheckDialogVue.vue';
import { LoggerManager } from 'client/LoggerManager';
import { IStoreActionArgs } from 'client/VuexOperations/IStoreActionArgs';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { StoreActionNames } from 'client/VuexOperations/StoreActionNames';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { FileType } from 'common/FileType';
import { FileDownloadParam } from 'common/requestParams/FileDownloadParam';
import { UserCheckParam } from 'common/requestParams/UserCheckParam';
import { UserDisableParam } from 'common/requestParams/UserDisableParam';
import { UserEnableParam } from 'common/requestParams/UserEnableParam';
import { UserRemoveParam } from 'common/requestParams/UserRemoveParam';
import { ApiResult } from 'common/responseResults/APIResult';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { LogoState } from 'common/responseResults/LogoState';
import { QualificationState } from 'common/responseResults/QualificationState';
import { UserView } from 'common/responseResults/UserView';
import { getUserStateText, UserState } from 'common/UserState';
import { Component, Vue } from 'vue-property-decorator';
import { Store } from 'vuex';
import { ComponentUtils } from './ComponentUtils';
import { CommonUtils } from 'common/CommonUtils';
import { UserType } from 'common/UserTypes';
import { IdentityState } from 'common/responseResults/IdentityState';
const compToBeRegistered: any = {
    FileCheckDialogVue,
    IdentityCheckDialogVue,
};

@Component({
    components: compToBeRegistered,
})
export class UserManagementTS extends Vue {
    // #region -- referred props and methods by this component
    private search: string = ''; // used for table search
    private idCheckDialogVisible: boolean = false;
    private qualificationCheckDialogVisible: boolean = false;
    private selectedUser: UserView = {};
    private selectedUserUid: string = '';
    private getUserObjs(): UserView[] {
        return this.storeState.userObjs;
    }
    private getUserState(userView: UserView): string {
        return getUserStateText(userView);
    }
    private btnTextForEnableOrDisable(user: UserView): string {
        if (user.state === UserState.Disabled) {
            return '启用';
        } else {
            return '禁用';
        }
    }
    private isSearchReady(): boolean {
        return true;
    }
    private isIdToBeChecked(user: UserView): boolean {
        return user.logoState === LogoState.ToBeChecked ||
            user.frontIdState === IdentityState.ToBeChecked ||
            user.backIdState === IdentityState.ToBeChecked;
    }
    private isQualificationToBeChecked(user: UserView): boolean {
        return user.qualificationState === QualificationState.ToBeChecked;
    }

    private onIdCheck(index: number, user: UserView): void {
        this.selectedUser = user;
        this.selectedUserUid = user.uid as string;
        this.idCheckDialogVisible = true;
    }
    private onIdCheckCanceled(): void {
        this.idCheckDialogVisible = false;
    }
    private onIdCheckSubmit(checkParam: UserCheckParam): void {
        if (checkParam.backIdState === (this.selectedUser as UserView).backIdState) {
            delete checkParam.backIdState;
        }
        if (checkParam.frontIdState === (this.selectedUser as UserView).frontIdState) {
            delete checkParam.frontIdState;
        }
        if (checkParam.logoState === (this.selectedUser as UserView).logoState) {
            delete checkParam.logoState;
        }
        this.userCheck(this.selectedUser as UserView, checkParam);
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
    private onQualificationCheckDenied(userCheckParam: UserCheckParam): void {
        userCheckParam.uid = this.selectedUser.uid;
        this.userCheck(this.selectedUser as UserView, userCheckParam);
    }
    private onQualificationCheckAccepted(userCheckParam: UserCheckParam): void {
        userCheckParam.uid = this.selectedUser.uid;
        this.userCheck(this.selectedUser as UserView, userCheckParam);
    }
    private onQualificationCheckCanceled(): void {
        this.qualificationCheckDialogVisible = false;
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
                    this.$message.error(`${actionName}用户失败：${ApiErrorHandler.getTextByCode(apiResult.code)}`);
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
                    this.$message.error(`删除用户失败：${ApiErrorHandler.getTextByCode(apiResult.code)}`);
                }
            })().catch((ex) => {
                RouterUtils.goToErrorView(this.$router, this.storeState, msgConnectionIssue, ex);
            });
        }).catch(() => {
            // do nothing for cancel
        });
    }
    // #endregion

    // #region -- vue life-circle methods
    private mounted(): void {
        (async () => {
            this.$$pullUserObjs();
        })().catch((ex) => {
            this.$message.error(msgConnectionIssue);
            LoggerManager.error('ERROR:', ex);
        });
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
                `获取用户信息失败：${ApiErrorHandler.getTextByCode(apiResult.code)}`);
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
                this.$message.success(`审核提交成功`);
            } else {
                this.$message.error(`审核提交失败：${ApiErrorHandler.getTextByCode(apiResult.code)}`);
            }
        })().finally(() => {
            this.idCheckDialogVisible = false;
            this.qualificationCheckDialogVisible = false;
        });
    }
    // #endregion
}
