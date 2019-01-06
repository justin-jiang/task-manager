import { RoutePathItem, RouterUtils } from 'client/common/RouterUtils';
import { LoggerManager } from 'client/LoggerManager';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { CommonUtils } from 'common/CommonUtils';
import { UserView } from 'common/responseResults/UserView';
import { Component, Vue, Watch } from 'vue-property-decorator';
import { Store } from 'vuex';
const compToBeRegistered: any = {
};

@Component({
    components: compToBeRegistered,
})
export class AdminTS extends Vue {
    // #region -- referred props and methods by Vue Page
    private activeIndex: string = '';
    private isLoading: boolean = true;

    private readonly notificationIndex: string = `/${RoutePathItem.Admin}/${RoutePathItem.Admin_Notification}`;
    private readonly userIndex: string = `/${RoutePathItem.Admin}/${RoutePathItem.Admin_User}`;

    private onMenuSelected(key: string, keyPath: string): void {
        LoggerManager.debug('selectedMenu:', key, keyPath);
    }
    // #endregion

    // #region Vue life-circle method
    private mounted(): void {
        this.initialize();
    }
    @Watch('$store.state.sessionInfo', { immediate: true, deep: true })
    private onSessionInfoChanged(currentValue: UserView, previousValue: UserView) {
        const sessionInfo = currentValue;
        if (sessionInfo != null && sessionInfo.roles != null && this.isLoading) {
            this.initialize();
        }
    }

    // #endregion

    // region -- internal props and methods
    private readonly store = (this.$store as Store<IStoreState>);
    private readonly storeState = (this.$store.state as IStoreState);
    private initialize() {
        const sessionInfo = this.storeState.sessionInfo;
        if (sessionInfo != null && sessionInfo.roles != null && this.isLoading) {
            if (!CommonUtils.isAdmin(sessionInfo.roles)) {
                RouterUtils.goToUserHomePage(this.$router, sessionInfo.roles);
            } else {
                this.isLoading = false;
                RouterUtils.goToAdminUserManagementView(this.$router);
                this.activeIndex = this.$route.name as string;
            }
        }
    }
    // #endregion
}
