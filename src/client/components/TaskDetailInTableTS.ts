import { Component, Vue, Prop } from 'vue-property-decorator';
import { Store } from 'vuex';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { CommonUtils } from 'common/CommonUtils';
import { TaskView } from 'common/responseResults/TaskView';
import { TaskState, getTaskStateText } from 'common/TaskState';

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
    private taskStateToText(state: TaskState): string {
        return getTaskStateText(state);
    }
    private timestampToText(timestamp: number): string {
        return CommonUtils.convertTimeStampToText(timestamp);
    }
    private locationToText(task: TaskView): string {
        return `${task.province} ${task.city}`;
    }
    private applicantName(name: string): string {
        return CommonUtils.isNullOrEmpty(name) ? '暂无' : name;
    }
    private executorName(name: string): string {
        return CommonUtils.isNullOrEmpty(name) ? '暂无' : name;
    }
    // #endregion

    // #region Vue life-circle method
    private mounted(): void {
    }
    // #endregion
    // region -- internal props and methods
    private readonly store = (this.$store as Store<IStoreState>);
    private readonly storeState = (this.$store.state as IStoreState);
    // #endregion

}
