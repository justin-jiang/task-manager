import { ApiErrorHandler } from 'client/common/ApiErrorHandler';
import { msgConnectionIssue } from 'client/common/Constants';
import { RouterUtils } from 'client/common/RouterUtils';
import { ViewTextUtils } from 'client/common/ViewTextUtils';
import { IStoreActionArgs } from 'client/VuexOperations/IStoreActionArgs';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { StoreActionNames } from 'client/VuexOperations/StoreActionNames';
import { CommonUtils } from 'common/CommonUtils';
import { NotificationState } from 'common/NotificationState';
import { NotificationType } from 'common/NotificationType';
import { NotificationReadParam } from 'common/requestParams/NotificationReadParam';
import { ApiResult } from 'common/responseResults/APIResult';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { UserNotificationView } from 'common/responseResults/UserNotificationView';
import { UserView } from 'common/responseResults/UserView';
import { Component, Vue, Watch } from 'vue-property-decorator';
import { Store } from 'vuex';
import { taskListTabName } from './PublisherTaskTS';

const compToBeRegistered: any = {

};

@Component({
    components: compToBeRegistered,
})
export class NotificationManagementTS extends Vue {
    // #region -- component props and methods
    // #endregion

    // #region -- referred props and methods by Vue Page
    private isInitialized: boolean = false;
    public renderedNotifications: UserNotificationView[] = [];
    private executorInfoDialogVisible: boolean = false;

    private get hasNotification(): boolean {
        return this.renderedNotifications.length > 0;
    }
    private timestampToText(timestamp: number): string {
        return ViewTextUtils.convertTimeStampToDatetime(timestamp);
    }
    private isUnread(item: UserNotificationView) {
        return item.state === NotificationState.Unread;
    }
    private needAction(item: UserNotificationView): boolean {
        return !CommonUtils.isNullOrEmpty(this.getActionName(item));
    }
    private getActionName(item: UserNotificationView): string {
        let name: string = '';
        switch (item.type) {
            case NotificationType.TaskApply:
                name = '查看申请者资料';
                break;
        }
        return name;
    }
    private getTitle(item: UserNotificationView): string {
        return ViewTextUtils.getNotficationTitle(item.type as NotificationType);
    }
    private onActionClick(item: UserNotificationView): void {
        switch (item.type) {
            case NotificationType.TaskApply:
                this.executorInfoDialogVisible = true;
                break;
            default:
                this.$message.warning('开发中。。。');
        }
    }
    private onSetUnread(item: UserNotificationView): void {
        (async () => {
            const apiResult: ApiResult = await this.store.dispatch(
                StoreActionNames.notificationRead,
                { data: { uid: item.uid } as NotificationReadParam } as IStoreActionArgs);
            if (apiResult.code !== ApiResultCode.Success) {
                this.$message.error(`标记消息已读失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
            }
        })().catch((ex) => {
            RouterUtils.goToErrorView(this.$router, this.storeState, msgConnectionIssue, ex);
        });
    }
    private onExecutorInfoDialogCancel(): void {
        this.executorInfoDialogVisible = false;
    }
    private onGoToAppliedTask(): void {
        RouterUtils.goToPublisherTaskView(this.$router, taskListTabName);
    }
    // #endregion

    // #region -- vue life-circle methods
    private mounted() {
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
    @Watch('$store.state.notificationObjs', { immediate: true })
    private onNotificationChanged(currentValue: UserNotificationView[], previousValue: UserNotificationView[]) {
        // TODO: support incremental render
        this.renderedNotifications = this.storeState.notificationObjs;
    }
    private initialize() {
        const sessionInfo = this.storeState.sessionInfo;
        if (CommonUtils.isReadyPublisher(sessionInfo) ||
            CommonUtils.isReadyExecutor(sessionInfo) ||
            CommonUtils.isAdmin(sessionInfo)) {
            this.isInitialized = true;
            // TODO: support incremental render
            this.renderedNotifications = this.storeState.notificationObjs;
        }
    }
    // #endregion
}

