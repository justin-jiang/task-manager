import { ApiErrorHandler } from 'client/common/ApiErrorHandler';
import { msgConnectionIssue } from 'client/common/Constants';
import { RouterUtils } from 'client/common/RouterUtils';
import AvatarWithNameVue from 'client/components/AvatarWithNameVue.vue';
import { ComponentUtils } from 'client/components/ComponentUtils';
import { IStoreActionArgs } from 'client/VuexOperations/IStoreActionArgs';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { StoreActionNames } from 'client/VuexOperations/StoreActionNames';
import { CommonUtils } from 'common/CommonUtils';
import { NOTIFICATION_PULL_INTERVAL } from 'common/Config';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { ApiResult } from 'common/responseResults/APIResult';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { UserView } from 'common/responseResults/UserView';
import { UserRole } from 'common/UserRole';
import { Component, Vue, Watch } from 'vue-property-decorator';
import { Store } from 'vuex';
import { StoreMutationNames } from './VuexOperations/StoreMutationNames';

const compToBeRegistered: any = {
    AvatarWithNameVue,
};

@Component({
    components: compToBeRegistered,
})
export class AppTS extends Vue {
    // #region -- props and methods refered by Vue Template
    private readonly LogoffCommand: string = 'Logoff';
    private readonly SessionInfoCommand: string = 'SessionInfo';
    private isInitialized: boolean = false;
    private interval: number = -1;

    private get logonUserName(): string {
        return this.storeState.sessionInfo.name as string;
    }
    private get logoUrl(): string {
        return this.storeState.sessionInfo.logoUrl as string;
    }
    private get qualificationStar(): number | null {
        return this.storeState.sessionInfo.qualificationStar || null;
    }
    private get qualificationScore(): number | null {
        return this.storeState.sessionInfo.qualificationScore || null;
    }

    private get isLogon(): boolean {
        return !CommonUtils.isNullOrEmpty(this.logonUserName);
    }
    private handleCommand(command: string): void {
        (async () => {
            if (command === this.LogoffCommand) {
                // reset store
                this.store.commit(StoreMutationNames.sessionReset);
                const apiResult: ApiResult = await this.store.dispatch(
                    StoreActionNames.sessionRemove, { data: null } as IStoreActionArgs);
                if (apiResult.code === ApiResultCode.Success ||
                    apiResult.code === ApiResultCode.AuthUnauthorized) {
                    RouterUtils.goToLoginView(this.$router);
                } else {
                    const errStr: string = `退出登录失败：${ApiErrorHandler.getTextByCode(apiResult)}`;
                    RouterUtils.goToErrorView(this.$router, this.storeState, errStr);
                }
            } else if (command === this.SessionInfoCommand) {
                this.$message.warning('开发中。。。');
            }
        })().catch((ex) => {
            RouterUtils.goToErrorView(this.$router, this.storeState, msgConnectionIssue, ex);
        });
    }

    // #endregion

    // #region -- vue life-circle events
    private mounted(): void {
        (async () => {
            const apiResult: ApiResult = await this.store.dispatch(
                StoreActionNames.sessionQuery, { notUseLocalData: true } as IStoreActionArgs);
            ComponentUtils.pullNotification(this, false);
            this.interval = setInterval(() => {
                ComponentUtils.pullNotification(this, true);
            }, NOTIFICATION_PULL_INTERVAL) as any as number;
            if (apiResult.code === ApiResultCode.Success) {
                if (!CommonUtils.isNullOrEmpty(this.storeState.sessionInfo.logoUid)) {
                    const logoUrl: string | undefined = await ComponentUtils.$$getImageUrl(
                        this, this.storeState.sessionInfo.logoUid as string, FileAPIScenario.DownloadUserLogo);
                    if (logoUrl != null) {
                        this.store.commit(StoreMutationNames.sessionInfoPropUpdate, { logoUrl } as UserView)
                    }
                }

                if (!CommonUtils.isUserReady(this.storeState.sessionInfo)) {
                    RouterUtils.goToUserRegisterView(
                        this.$router, (this.storeState.sessionInfo.roles as UserRole[])[0]);
                    return;
                }

                if (RouterUtils.isHomeUrl() ||
                    RouterUtils.isLoginUrl() ||
                    RouterUtils.isErrorUrl()) {
                    RouterUtils.goToUserHomePage(this.$router, this.storeState.sessionInfo);
                }
            } else if (apiResult.code === ApiResultCode.AuthUnauthorized) {
                if (RouterUtils.isUserRegisterUrl()) {
                    return;
                }

                if (!RouterUtils.isHomeUrl() &&
                    !RouterUtils.isLoginUrl() &&
                    !RouterUtils.isErrorUrl()) {
                    this.store.commit(StoreMutationNames.sessionRedirectUrlUpdate, window.location.href);
                }
                RouterUtils.goToLoginView(this.$router);
            } else if (apiResult.code === ApiResultCode.SystemNotInitialized) {
                RouterUtils.goToAdminRegisterView(this.$router);
            } else {
                const errStr: string = `系统错误：${ApiErrorHandler.getTextByCode(apiResult)}`;
                RouterUtils.goToErrorView(this.$router, this.storeState, errStr);
            }
        })().catch((ex) => {
            RouterUtils.goToErrorView(this.$router, this.storeState, msgConnectionIssue, ex);
        }).finally(() => {
            this.isInitialized = true;
        });
    }
    private beforeDestroy(): void {
        clearInterval(this.interval);
    }

    // #endregion

    // #region -- internal props and methods
    private readonly store = (this.$store as Store<IStoreState>);
    private readonly storeState = (this.$store.state as IStoreState);

    /**
     * When Url is /admin, we should go to the default template management route
     * @param val 
     * @param oldVal 
     */
    @Watch('$route.path', { immediate: true })
    private onRouteChanged(val: string, oldVal: string) {
        if (this.storeState.sessionInfo.roles == null) {
            if (!RouterUtils.isHomeUrl() &&
                !RouterUtils.isLoginUrl() &&
                !RouterUtils.isErrorUrl()) {
                this.store.commit(StoreMutationNames.sessionRedirectUrlUpdate, window.location.href);
            }
        } else if (RouterUtils.isAdminRoot()) {
            RouterUtils.goToAdminUserManagementView(this.$router);
        } else if (RouterUtils.isHomeUrl()) {
            RouterUtils.goToUserHomePage(this.$router, this.storeState.sessionInfo);
        } else if (RouterUtils.isPublishRoot()) {
            RouterUtils.goToPublisherDefaultView(this.$router);
        }
    }
    // #endregion
}
