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
export class PublisherTS extends Vue {

    // #region -- props and methods for Whole Template
    private activeIndex: string = '';
    private isLoading: boolean = true;

    private readonly templateIndex: string = `/${RoutePathItem.Publisher}/${RoutePathItem.Publisher_Template}`;
    private readonly taskIndex: string = `/${RoutePathItem.Publisher}/${RoutePathItem.Publisher_Task}`;
    private readonly notificationIndex: string = `/${RoutePathItem.Publisher}/${RoutePathItem.Publisher_Notification}`;
    private readonly userInfoIndex: string = `/${RoutePathItem.Publisher}/${RoutePathItem.Publisher_UserInfo}`;

    private onMenuSelected(key: string, keyPath: string): void {
        LoggerManager.debug('selectedMenu:', key, keyPath);
    }
    // #endregion

    // #region -- vue life-circle methods and events
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

    // #region internal prop and methods
    private readonly store = (this.$store as Store<IStoreState>);
    private readonly storeState = (this.$store.state as IStoreState);
    private initialize() {
        const sessionInfo = this.storeState.sessionInfo;
        if (sessionInfo != null && sessionInfo.roles != null && this.isLoading) {
            if (!CommonUtils.isPublisher(sessionInfo.roles)) {
                RouterUtils.goToUserHomePage(this.$router, sessionInfo.roles);
            } else {
                this.isLoading = false;
                RouterUtils.goToPublisherView(this.$router);
                this.activeIndex = this.$route.name as string;
            }
        }
    }
    // #endregion

}
