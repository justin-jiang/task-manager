import { ViewTextUtils } from 'client/common/ViewTextUtils';
import TaskSpecificInTableVue from 'client/components/TaskSpecificInTableVue.vue';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { CommonUtils } from 'common/CommonUtils';
import { TaskView } from 'common/responseResults/TaskView';
import { TaskState } from 'common/TaskState';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Store } from 'vuex';
import { timingSafeEqual } from 'crypto';

const compToBeRegistered: any = {
    TaskSpecificInTableVue,
};

@Component({
    components: compToBeRegistered,
})
export class TaskTableTS extends Vue {    // #region -- component props and methods
    @Prop() public dataProp!: TaskView;
    // #endregion

    // #region -- refered by this Vue Template
    private readonly labelOfRemainingDays: string = '剩余天数';
    private readonly taskTableRefName: string = 'taskTable';
    private search: string = '';

    private get filteredTaskObjs(): TaskView[] {
        return this.dataProp.filter(
            (data: TaskView) => CommonUtils.isNullOrEmpty(this.search) ||
                (data.name as string).toLowerCase().includes(this.search.toLowerCase())).sort(
                    (a: TaskView, b: TaskView) => {
                        if (a.createTime == null) {
                            // a is behind of b
                            return 1;
                        }
                        if (b.createTime == null) {
                            // a is ahead of b
                            return -1;
                        }
                        // if a.createTime is bigger than b.createTime, a is ahead of b
                        return b.createTime - a.createTime;
                    });
    }
    private isSearchReady(): boolean {
        return true;
    }

    private getRemainingDaysText(task: TaskView): string {
        if (CommonUtils.isTaskCompleted(task)) {
            return '';
        } else {
            return this.getRemainingDays(task.deadline as number).toString();
        }

    }

    private getDeadlineColStyle(row: { row: TaskView, column: { label: string } }): any {
        if (row.column.label === this.labelOfRemainingDays) {
            const remainingDays: number = this.getRemainingDays(row.row.deadline as number);
            if (CommonUtils.isTaskCompleted(row.row) || remainingDays > 5) {
                return {};
            } else if (remainingDays <= 5 && remainingDays > 3) {
                return { background: '#cdcd16' };
            } else {
                return { background: 'red' };
            }
        }
    }
    private getTaskArea(task: TaskView): string {
        return `${task.province}-${task.city}`;
    }

    private nameSort(a: TaskView, b: TaskView): number {
        return (a.name as string).localeCompare(b.name as string, 'zh-CN');
    }
    private locationSort(a: TaskView, b: TaskView): number {
        return this.getTaskArea(a).localeCompare(this.getTaskArea(b), 'zh-CN');
    }
    private deadlineSort(a: TaskView, b: TaskView): number {
        return (a.deadline as number) - (b.deadline as number);
    }
    private stateSort(a: TaskView, b: TaskView): number {
        return this.taskStateToText(a.state as TaskState).localeCompare(
            this.taskStateToText(b.state as TaskState));
    }
    private timestampToDate(timestamp: number): string {
        return ViewTextUtils.convertTimeStampToDate(timestamp);
    }
    private remainingDaysSort(a: TaskView, b: TaskView): number {
        return (a.deadline as number) - (b.deadline as number);
    }
    private createTimeSort(a: TaskView, b: TaskView): number {
        return (a.createTime as number) - (b.createTime as number);
    }
    private taskStateToText(state: TaskState): string {
        return ViewTextUtils.getTaskStateText(state);
    }
    private isNotSubmitted(index: number, task: TaskView): boolean {
        return task.state === TaskState.None || task.state === TaskState.Created;
    }
    private onRowClick(task: TaskView, column: any): void {
        (this.$refs[this.taskTableRefName] as any).toggleRowExpansion(task);
    }
    private onTaskDetailCheck(index: number, task: TaskView): void {
        (this.$refs[this.taskTableRefName] as any).toggleRowExpansion(task);
    }
    // #endregion

    // #region Vue life-circle method
    private mounted(): void {

    }
    // #endregion
    // region -- internal props and methods
    private readonly store = (this.$store as Store<IStoreState>);
    private readonly storeState = (this.$store.state as IStoreState);
    private getRemainingDays(deadline: number): number {
        return Math.round((deadline - Date.now()) / (24 * 3600 * 1000));
    }
    // #endregion

}
