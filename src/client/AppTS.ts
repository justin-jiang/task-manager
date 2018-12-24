import { IStoreActionArgs } from 'client/VuexOperations/IStoreActionArgs';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { StoreActionNames } from 'client/VuexOperations/StoreActionNames';
import { APIResult } from 'common/responseResults/APIResult';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { UserView } from 'common/responseResults/UserView';
import { Component, Vue } from 'vue-property-decorator';
import { Store } from 'vuex';
import { LoggerManager } from './LoggerManager';
import { RouterUtils } from './views/RouterUtils';

const compToBeRegistered: any = {
};

@Component({
    components: compToBeRegistered,
})
export class AppTS extends Vue {
    // #region -- props and methods refered by Vue Template
    private readonly LogoffCommand: string = 'Logoff';
    private readonly SessionInfoCommand: string = 'SessionInfo';
    private handleCommand(command: string): void {

        (async () => {
            if (command === this.LogoffCommand) {
                const apiResult: APIResult = await this.store.dispatch(
                    StoreActionNames.sessionRemove, { data: null } as IStoreActionArgs);
                this.storeState.sessionInfo = undefined;
                if (apiResult.code === ApiResultCode.Success ||
                    apiResult.code === ApiResultCode.Unauthorized) {
                    RouterUtils.goToLoginView(this.$router);
                } else {
                    const errStr: string = `退出登录失败（错误代码:${apiResult.code}）`;
                    LoggerManager.error(errStr);
                    RouterUtils.goToErrorView(this.$router);
                }
            } else if (command === this.SessionInfoCommand) {
                this.$message.warning('开发中。。。');
            }
        })().catch((ex) => {
            this.$message.error('链接服务器失败，请检查网络连接是否正常');
            LoggerManager.error(ex);
        });
    }
    private onLoginSessionInfo() {
        this.$message.warning('开发中。。。');
    }
    // #endregion

    // #region -- vue life-circle events
    private mounted(): void {
        (async () => {

            const apiResult: APIResult = await this.store.dispatch(
                StoreActionNames.sessionQuery, { data: null } as IStoreActionArgs);
            if (apiResult.code === ApiResultCode.Success) {
                if (RouterUtils.isHomeUrl() ||
                    RouterUtils.isLoginUrl() ||
                    RouterUtils.isErrorUrl()) {
                    RouterUtils.goToUserHomePage(this.$router,
                        (this.storeState.sessionInfo as UserView).roles);
                }
            } else if (apiResult.code === ApiResultCode.Unauthorized) {
                if (!RouterUtils.isHomeUrl() &&
                    !RouterUtils.isLoginUrl() &&
                    !RouterUtils.isErrorUrl()) {
                    (this.$store.state as IStoreState).redirectURLAfterLogin = window.location.href;
                }
                RouterUtils.goToLoginView(this.$router);
            } else if (apiResult.code === ApiResultCode.SystemNotInitialized) {
                RouterUtils.goToAdminRegisterView(this.$router);
            } else {
                const errStr: string = `系统错误（错误代码:${apiResult.code}）`;
                LoggerManager.error(errStr);
                RouterUtils.goToErrorView(this.$router);
            }
        })().catch((ex) => {
            this.$message.error('链接服务器失败，请检查网络连接是否正常');
            LoggerManager.error(ex);
        });
    }
    // #endregion

    // #region -- internal props and methods
    private readonly store = (this.$store as Store<IStoreState>);
    private readonly storeState = (this.$store.state as IStoreState);
    // #endregion
}
