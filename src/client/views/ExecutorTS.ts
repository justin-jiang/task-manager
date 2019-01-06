import { msgConnectionIssue } from 'client/common/Constants';
import { RouterUtils, RoutePathItem, RouterName } from 'client/common/RouterUtils';
import SingleFileUploadVue from 'client/components/SingleFileUploadVue.vue';
import { LoggerManager } from 'client/LoggerManager';
import { IStoreActionArgs } from 'client/VuexOperations/IStoreActionArgs';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { StoreActionNames } from 'client/VuexOperations/StoreActionNames';
import { CommonUtils } from 'common/CommonUtils';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { FileUploadParam } from 'common/requestParams/FileUploadParam';
import { TaskApplyParam } from 'common/requestParams/TaskApplyParam';
import { TaskResultFileUploadParam } from 'common/requestParams/TaskResultFileUploadParam';
import { APIResult } from 'common/responseResults/APIResult';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { TaskView } from 'common/responseResults/TaskView';
import { UserView } from 'common/responseResults/UserView';
import { TaskState, getTaskStateText } from 'common/TaskState';
import { Component, Vue, Watch } from 'vue-property-decorator';
import { Store } from 'vuex';
import { UserState } from 'common/UserState';
import { UserRole } from 'common/UserRole';
import { ApiErrorHandler } from 'client/common/ApiErrorHandler';
const compToBeRegistered: any = {
    SingleFileUploadVue,
};

@Component({
    components: compToBeRegistered,
})
export class ExecutorTS extends Vue {




    // #region -- props and methods for Whole Page
    private isLoading: boolean = true;
    private activeIndex: string = '';
    private readonly taskIndex: string = `/${RoutePathItem.Executor}/${RoutePathItem.Executor_Task}`;
    private readonly notificationIndex: string = `/${RoutePathItem.Executor}/${RoutePathItem.Executor_Notification}`;
    private readonly userInfoIndex: string = `/${RoutePathItem.Executor}/${RoutePathItem.Executor_UserInfo}`;
    private onMenuSelected(key: string, keyPath: string): void {
        LoggerManager.debug('selectedMenu:', key, keyPath);
    }
    // #endregion

    // #region -- vue life-circle methods
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
            if (!CommonUtils.isExecutor(sessionInfo.roles)) {
                RouterUtils.goToUserHomePage(this.$router, sessionInfo.roles);
            } else {
                this.isLoading = false;
                if (this.$route.name === RouterName.Executor) {
                    RouterUtils.goToExecutorView(this.$router);
                } else {
                    this.activeIndex = this.$route.name as string;
                }
            }
        }
    }

    // #endregion

}
