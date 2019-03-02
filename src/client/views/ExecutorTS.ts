import { RoutePathItem, RouterName, RouterUtils } from 'client/common/RouterUtils';
import { ComponentUtils } from 'client/components/ComponentUtils';
import SingleFileUploadVue from 'client/components/SingleFileUploadVue.vue';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { CommonUtils } from 'common/CommonUtils';
import { NotificationState } from 'common/NotificationState';
import { UserView } from 'common/responseResults/UserView';
import { Component, Vue, Watch } from 'vue-property-decorator';
import { Store } from 'vuex';
const compToBeRegistered: any = {
    SingleFileUploadVue,
};

@Component({
    components: compToBeRegistered,
})
export class ExecutorTS extends Vue {
    // #region -- props and methods for Whole Page
    private isInitialized: boolean = false;
    private activeIndex: string = '';
    private readonly taskIndex: string = `/${RoutePathItem.Executor}/${RoutePathItem.Executor_Task}`;
    private readonly notificationIndex: string = `/${RoutePathItem.Executor}/${RoutePathItem.Executor_Notification}`;
    private readonly userInfoIndex: string = `/${RoutePathItem.Executor}/${RoutePathItem.Executor_UserInfo}`;
    private onMenuSelected(key: string, keyPath: string): void {
        this.activeIndex = key;
    }
    // #endregion

    // #region -- props and methods for notification
    private get hasNotification(): boolean {
        return this.newNotificationCount > 0;
    }
    private get newNotificationCount(): number {
        let count: number = 0;
        this.storeState.notificationObjs.forEach((item) => {
            if (item.state === NotificationState.Unread) {
                count++;
            }
        });
        return count;
    }
    // #endregion

    // #region -- vue life-circle methods
    private mounted(): void {
        this.initialize();
    }

    // #endregion

    // #region internal prop and methods
    private readonly store = (this.$store as Store<IStoreState>);
    private readonly storeState = (this.$store.state as IStoreState);

    @Watch('$store.state.sessionInfo', { immediate: true })
    private onSessionInfoChanged(currentValue: UserView, previousValue: UserView) {
        const sessionInfo = currentValue;
        this.initialize();
    }
    private initialize() {
        const sessionInfo = this.storeState.sessionInfo;
        if (CommonUtils.isReadyExecutor(sessionInfo)) {
            if (this.$route.name === RouterName.Executor) {
                RouterUtils.goToExecutorDefaultView(this.$router);
            } else {
                switch (this.$route.name) {
                    case RouterName.Executor_UserInfo:
                        this.activeIndex = this.userInfoIndex;
                        break;
                    case RouterName.Executor_Notification:
                        this.activeIndex = this.notificationIndex;
                        break;
                    default:
                        this.activeIndex = this.taskIndex;
                        break;
                }
            }
            ComponentUtils.pullNotification(this);
            this.isInitialized = true;
        } else {
            RouterUtils.goToUserHomePage(this.$router, sessionInfo);
        }
    }
    // #endregion

}
