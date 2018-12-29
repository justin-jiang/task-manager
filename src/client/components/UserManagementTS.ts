import { LoggerManager } from 'client/LoggerManager';
import { IStoreActionArgs } from 'client/VuexOperations/IStoreActionArgs';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { StoreActionNames } from 'client/VuexOperations/StoreActionNames';
import { APIResult } from 'common/responseResults/APIResult';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { UserView } from 'common/responseResults/UserView';
import { Component, Vue } from 'vue-property-decorator';
import { Store } from 'vuex';
import { msgConnectionIssue } from 'client/common/Constants';
import { UserCheckParam } from 'common/requestParams/UserCheckParam';
import { RouterUtils } from 'client/common/RouterUtils';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { FileDownloadParam } from 'common/requestParams/FileDownloadParam';

const compToBeRegistered: any = {

};

@Component({
    components: compToBeRegistered,
})
export class UserManagementTS extends Vue {
    // #region -- referred props and methods by this component
    private search: string = ''; // used for table search
    private getUserObjs(): UserView[] {
        return this.storeState.userObjs;
    }
    private onQualificationDownload(index: number, user: UserView) {
        (async () => {
            let result: APIResult = await this.store.dispatch(
                StoreActionNames.fileDownload,
                {
                    data: {
                        scenario: FileAPIScenario.DownloadQualificationFile,
                        fileId: user.qualificationId,
                        version: user.qualificationVersion,
                    } as FileDownloadParam,
                } as IStoreActionArgs);
            if (result.code === ApiResultCode.Success) {
                if (result.data.type === 'application/json') {
                    const reader = new FileReader();
                    reader.onloadend = (e: ProgressEvent) => {
                        result = JSON.parse((e.srcElement as any).result);
                        this.$message.error(`下载文件失败，错误代码：${result.code}`);
                        LoggerManager.error((e.srcElement as any).result);
                    };
                    reader.readAsText(result.data);
                } else {
                    const url = window.URL.createObjectURL(new Blob([result.data]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', `${user.name}.zip`);
                    document.body.appendChild(link);
                    link.click();
                }
            } else {
                this.$message.error(`资质文件下载失败，错误代码：${result.code}`);
            }

        })().catch((ex) => {
            RouterUtils.goToErrorView(this.$router);
            LoggerManager.error('Error:', ex);
        });
    }
    private onUserCheckPass(index: number, user: UserView): void {
        this.userCheck(user, true);
    }
    private onUserCheckDeny(index: number, user: UserView): void {
        // this.userCheck(user, false);
        this.$message.warning('开发中。。。');
    }
    private onUserDisable(index: number, user: UserView): void {
        this.$message.warning('开发中。。。');
    }
    private onUserDelete(index: number, user: UserView): void {
        this.$message.warning('开发中。。。');
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
        const result: APIResult = await this.store.dispatch(
            StoreActionNames.userQuery, { notUseLocalData: true } as IStoreActionArgs);
        if (result.code !== ApiResultCode.Success) {
            RouterUtils.goToErrorView(this.$router);
            this.$message.error(`获取用户信息失败，错误代码：${result.code}`);
        }
    }
    private userCheck(user: UserView, pass: boolean) {
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
                const result: APIResult = await store.dispatch(
                    StoreActionNames.userCheck,
                    {
                        data: {
                            uid: user.uid,
                            pass,
                        } as UserCheckParam,
                    } as IStoreActionArgs);
                if (result.code === ApiResultCode.Success) {
                    this.$message.success(`${actionName}用户审核成功`);
                } else {
                    this.$message.error(`${actionName}用户审核失败，错误代码：${result.code}`);
                }
            })().catch((ex) => {
                RouterUtils.goToErrorView(this.$router);
            });
        }).catch(() => {
            // do nothing for cancel
        });
    }
    // #endregion
}
