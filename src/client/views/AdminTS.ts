import { LoggerManager } from 'client/LoggerManager';
import { IStoreActionArgs } from 'client/VuexOperations/IStoreActionArgs';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { StoreActionNames } from 'client/VuexOperations/StoreActionNames';
import { UserView } from 'common/responseResults/UserView';
import { UserRole } from 'common/UserRole';
import { Component, Vue, Watch } from 'vue-property-decorator';
import { Store } from 'vuex';
import { RoutePathItem, RouterUtils } from './RouterUtils';
const compToBeRegistered: any = {
};

@Component({
    components: compToBeRegistered,
})
export class AdminTS extends Vue {
    // #region -- referred props and methods by Vue Page
    private activeIndex: string = '';
    private isAdminUserReady: boolean = false;

    private readonly templateIndex: string = `/${RoutePathItem.Admin}/${RoutePathItem.Admin_Template}`;
    private readonly notificationIndex: string = `/${RoutePathItem.Admin}/${RoutePathItem.Admin_Notification}`;
    private readonly userIndex: string = `/${RoutePathItem.Admin}/${RoutePathItem.Admin_User}`;

    private onMenuSelected(key: string, keyPath: string): void {
        LoggerManager.debug('selectedMenu:', key, keyPath);
    }
    // #endregion

    // #region Vue life-circle method
    private mounted(): void {
        (async () => {

            if (this.storeState.sessionInfo == null) {
                // consider async load, the sub page might be accessed before App.TS done,
                // so if there is no sessionInfo in store, try to read it from server
                await this.store.dispatch(
                    StoreActionNames.sessionQuery, { data: null } as IStoreActionArgs);
            }
            if (this.storeState.sessionInfo != null &&
                this.storeState.sessionInfo.roles != null) {
                if (!this.storeState.sessionInfo.roles.includes(UserRole.Admin)) {
                    RouterUtils.goToUserHomePage(this.$router, (this.storeState.sessionInfo as UserView).roles);
                } else {
                    this.isAdminUserReady = true;
                    RouterUtils.goToAdminTemplateManagementView(this.$router);
                    this.activeIndex = this.$route.name as string;
                }
            }
        })().catch((ex) => {
            this.$message.error('登录失败，请检查网络连接是否正常');
            LoggerManager.error(ex);
        });
    }
    // #endregion

    // region -- internal props and methods
    private readonly store = (this.$store as Store<IStoreState>);
    private readonly storeState = (this.$store.state as IStoreState);
    /**
     * When Url is /admin, we should go to the default template management route
     * @param val 
     * @param oldVal 
     */
    @Watch('$route.path', { immediate: true, deep: true })
    private onRouteChanged(val: any, oldVal: any) {
        if (/\/admin\/?$/i.test(val)) {
            RouterUtils.goToAdminTemplateManagementView(this.$router);
        }
    }
    // #endregion
}
