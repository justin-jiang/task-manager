import { msgConnectionIssue } from 'client/common/Constants';
import { RouterUtils } from 'client/common/RouterUtils';
import { LoggerManager } from 'client/LoggerManager';
import { IStoreActionArgs } from 'client/VuexOperations/IStoreActionArgs';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { StoreActionNames } from 'client/VuexOperations/StoreActionNames';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { FileDownloadParam } from 'common/requestParams/FileDownloadParam';
import { UserCheckParam } from 'common/requestParams/UserCheckParam';
import { UserDisableParam } from 'common/requestParams/UserDisableParam';
import { UserEnableParam } from 'common/requestParams/UserEnableParam';
import { UserRemoveParam } from 'common/requestParams/UserRemoveParam';
import { APIResult } from 'common/responseResults/APIResult';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { LogoState } from 'common/responseResults/LogoState';
import { QualificationState } from 'common/responseResults/QualificationState';
import { UserView } from 'common/responseResults/UserView';
import { getUserStateText, UserState } from 'common/UserState';
import { FileType } from 'common/FileType';
import { Component, Vue } from 'vue-property-decorator';
import { Store } from 'vuex';
import { ComponentUtils } from './ComponentUtils';
import { ApiErrorHandler } from 'client/common/ApiErrorHandler';
const compToBeRegistered: any = {

};

@Component({
    components: compToBeRegistered,
})
export class UserManagementTS extends Vue {
    // #region -- referred props and methods by this component
    private search: string = ''; // used for table search
    private logoCheckDialogVisible: boolean = false;
    private qualificationCheckDialogVisible: boolean = false;
    private selectedUser: UserView | undefined;
    private selectedUserLogoUrl: string = '';
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
    private isLogoToBeChecked(user: UserView): boolean {
        return user.logoState === LogoState.ToBeChecked;
    }
    private isQualificationToBeChecked(user: UserView): boolean {
        return user.qualificationState === QualificationState.ToBeChecked;
    }

    private onLogoCheck(index: number, user: UserView): void {
        this.selectedUser = user;
        (async () => {
            const logoURL: string | undefined = await ComponentUtils.getLogoUrl(
                this, (this.selectedUser as UserView).logoId as string);
            if (logoURL != null) {
                this.logoCheckDialogVisible = true;
                this.selectedUserLogoUrl = logoURL;
            } else {
                this.$message.error('获取头像信息失败');
            }
        })().catch((ex) => {
            RouterUtils.goToErrorView(this.$router, this.storeState, msgConnectionIssue, ex);
        });
    }
    private onLogoCheckCanceled(): void {
        this.logoCheckDialogVisible = false;
    }
    private onLogoCheckAccepted(): void {
        this.userCheck(this.selectedUser as UserView, FileType.UserLogo, true);
    }
    private onLogoCheckDenied(): void {
        this.userCheck(this.selectedUser as UserView, FileType.UserLogo, false);
    }
    private onQualificationDownload() {
        (async () => {
            let apiResult: APIResult = await this.store.dispatch(
                StoreActionNames.fileDownload,
                {
                    data: {
                        scenario: FileAPIScenario.DownloadQualificationFile,
                        fileId: (this.selectedUser as UserView).qualificationId,
                        version: (this.selectedUser as UserView).qualificationVersion,
                    } as FileDownloadParam,
                } as IStoreActionArgs);
            if (apiResult.code === ApiResultCode.Success) {
                if (apiResult.data.type === 'application/json') {
                    const reader = new FileReader();
                    reader.onloadend = (e: ProgressEvent) => {
                        apiResult = JSON.parse((e.srcElement as any).result);
                        this.$message.error(`下载文件失败：${ApiErrorHandler.getTextByCode(apiResult.code)}`);
                        LoggerManager.error((e.srcElement as any).result);
                    };
                    reader.readAsText(apiResult.data);
                } else {
                    const url = window.URL.createObjectURL(new Blob([apiResult.data]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', `${(this.selectedUser as UserView).name}.zip`);
                    document.body.appendChild(link);
                    link.click();
                }
            } else {
                this.$message.error(`资质文件下载失败：${ApiErrorHandler.getTextByCode(apiResult.code)}`);
            }

        })().catch((ex) => {
            RouterUtils.goToErrorView(this.$router, this.storeState, msgConnectionIssue, ex);
        });
    }
    private onQualificationCheck(index: number, user: UserView): void {
        this.selectedUser = user;
        this.qualificationCheckDialogVisible = true;
    }
    private onQualificationCheckDenied(): void {
        this.userCheck(this.selectedUser as UserView, FileType.Qualification, false);
    }
    private onQualificationCheckAccepted(): void {
        this.userCheck(this.selectedUser as UserView, FileType.Qualification, true);
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
                const apiResult: APIResult = await store.dispatch(
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
                const apiResult: APIResult = await store.dispatch(
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
        const apiResult: APIResult = await this.store.dispatch(
            StoreActionNames.userQuery, { notUseLocalData: true } as IStoreActionArgs);
        if (apiResult.code !== ApiResultCode.Success) {
            RouterUtils.goToErrorView(
                this.$router,
                this.storeState,
                `获取用户信息失败：${ApiErrorHandler.getTextByCode(apiResult.code)}`);
        }
    }
    private userCheck(user: UserView, type: FileType, pass: boolean) {
        const actionName: string = pass ? '通过' : '拒绝';

        const confirm = this.$confirm(
            `确认要${actionName}此用户的审核吗？`,
            '提示', {
                confirmButtonText: '确定',
                type: 'warning',
                center: true,
                closeOnClickModal: false,
            });
        confirm.then(() => {
            (async () => {
                const store = (this.$store as Store<IStoreState>);
                const apiResult: APIResult = await store.dispatch(
                    StoreActionNames.userCheck,
                    {
                        data: {
                            uid: user.uid,
                            type,
                            pass,
                        } as UserCheckParam,
                    } as IStoreActionArgs);
                if (apiResult.code === ApiResultCode.Success) {
                    this.$message.success(`${actionName}用户审核成功`);
                } else {
                    this.$message.error(`${actionName}用户审核失败：${ApiErrorHandler.getTextByCode(apiResult.code)}`);
                }
            })().catch((ex) => {
                RouterUtils.goToErrorView(this.$router, this.storeState, msgConnectionIssue, ex);
            }).finally(() => {
                this.logoCheckDialogVisible = false;
                this.qualificationCheckDialogVisible = false;
            });
        }).catch(() => {
            // do nothing for cancel
        });
    }
    // #endregion
}
