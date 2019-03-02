import { ViewTextUtils } from 'client/common/ViewTextUtils';
import { ComponentUtils } from 'client/components/ComponentUtils';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { CommonUtils } from 'common/CommonUtils';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { FileDownloadParam } from 'common/requestParams/FileDownloadParam';
import { TaskView } from 'common/responseResults/TaskView';
import { TaskState } from 'common/TaskState';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Store } from 'vuex';
import { UserType } from 'common/UserTypes';

const compToBeRegistered: any = {
};

@Component({
    components: compToBeRegistered,
})
export class TaskDetailInTableTS extends Vue {
    // #region -- component props and methods
    @Prop() public dataProp!: TaskView;
    // #endregion

    // #region -- props and methods refered by vue page
    private get taskStateToText(): string {
        if (this.dataProp != null) {
            return ViewTextUtils.getTaskStateText(this.dataProp.state as TaskState);
        } else {
            return '';
        }
    }
    private timestampToText(timestamp: number): string {
        return CommonUtils.convertTimeStampToText(timestamp);
    }
    private get locationToText(): string {
        return `${this.dataProp.province} ${this.dataProp.city}`;
    }
    private get applicantName(): string {
        return CommonUtils.isNullOrEmpty(this.dataProp.applicantName) ? '暂无' : this.dataProp.applicantName as string;
    }
    private get executorName(): string {
        return CommonUtils.isNullOrEmpty(this.dataProp.executorName) ? '暂无' : this.dataProp.executorName as string;
    }
    private get executorTypes(): string {
        const types: string[] = [];
        if (this.dataProp.executorTypes != null) {
            this.dataProp.executorTypes.forEach((item: UserType) => {
                switch (item) {
                    case UserType.Individual:
                        types.push('个人');
                        break;
                    case UserType.Corp:
                        types.push('企业');
                        break;
                    default:
                        types.push(item.toString());
                }
            });
        }
        return types.join(',');
    }
    private get executorStar(): string {
        return `${this.dataProp.minExecutorStar} 星及以上`;
    }
    private get isTaskExecutor(): boolean {
        return (this.dataProp.state as TaskState) > TaskState.ReadyToAuditApply &&
            this.dataProp.executorUid === this.storeState.sessionInfo.uid;
    }
    private onDownloadTaskTemplate(): void {
        ComponentUtils.downloadFile(this,
            {
                scenario: FileAPIScenario.DownloadTemplateFile,
                fileId: this.dataProp.templateFileUid,
            } as FileDownloadParam,
            `${this.dataProp.name}.zip`);
    }
    // #endregion

    // #region Vue life-circle method
    private mounted(): void {
        if (this.dataProp == null) {
            this.dataProp = {};
        }
    }
    // #endregion
    // region -- internal props and methods
    private readonly store = (this.$store as Store<IStoreState>);
    private readonly storeState = (this.$store.state as IStoreState);
    // #endregion

}
