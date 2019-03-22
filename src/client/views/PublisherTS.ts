import { RoutePathItem, RouterName, RouterUtils } from 'client/common/RouterUtils';
import { ComponentUtils } from 'client/components/ComponentUtils';
import { LoggerManager } from 'client/LoggerManager';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { CommonUtils } from 'common/CommonUtils';
import { NotificationState } from 'common/NotificationState';
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
    private get activeIndex(): string {
        switch (this.$route.name) {
            case RouterName.Publisher_UserInfo:
                return this.userInfoIndex;
            case RouterName.Publisher_Notification:
                return this.notificationIndex;

            case RouterName.Publisher_Template:
                return this.templateIndex;
            default:
                return this.taskIndex;
        }
    }
    private isInitialized: boolean = false;

    private readonly templateIndex: string = `/${RoutePathItem.Publisher}/${RoutePathItem.Publisher_Template}`;
    private readonly taskIndex: string = `/${RoutePathItem.Publisher}/${RoutePathItem.Publisher_Task}`;
    private readonly notificationIndex: string = `/${RoutePathItem.Publisher}/${RoutePathItem.Publisher_Notification}`;
    private readonly userInfoIndex: string = `/${RoutePathItem.Publisher}/${RoutePathItem.Publisher_UserInfo}`;

    private onMenuSelected(key: string, keyPath: string): void {
        LoggerManager.debug('selectedMenu:', key, keyPath);
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

    // #region -- vue life-circle methods and events
    private mounted(): void {
        this.initialize();
    }
    @Watch('$store.state.sessionInfo', { immediate: true })
    private onSessionInfoChanged(currentValue: UserView, previousValue: UserView) {
        const sessionInfo = currentValue;
        this.initialize();
    }

    // #endregion

    // #region internal prop and methods
    private readonly store = (this.$store as Store<IStoreState>);
    private readonly storeState = (this.$store.state as IStoreState);
    private initialize() {
        const sessionInfo = this.storeState.sessionInfo;
        if (CommonUtils.isPublisher(sessionInfo)) {
            this.isInitialized = true;
            ComponentUtils.pullTemplates(this);
        }
    }
    // #endregion
}
