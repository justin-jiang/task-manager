import { ApiErrorHandler } from 'client/common/ApiErrorHandler';
import { EventNames } from 'client/common/EventNames';
import { IStoreActionArgs } from 'client/VuexOperations/IStoreActionArgs';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { StoreActionNames } from 'client/VuexOperations/StoreActionNames';
import { TaskPublisherVisitParam } from 'common/requestParams/TaskPublisherVisitParam';
import { ApiResult } from 'common/responseResults/APIResult';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { TaskView } from 'common/responseResults/TaskView';
import { UserView } from 'common/responseResults/UserView';
import { UserType } from 'common/UserTypes';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Store } from 'vuex';


const compToBeRegistered: any = {
};

@Component({
    components: compToBeRegistered,
})
export class PublisherVisitDialogTS extends Vue {
    // #region -- component props and methods
    @Prop() public visibleProp!: boolean;
    @Prop() public taskProp!: TaskView;
    @Prop() public targetTaskPublisherProp!: UserView;
    // #endregion

    // #region -- referred props and methods by page template
    private targetTaskView: TaskView = {};
    private targetTaskPublisherView: UserView = {};
    private reqParam: TaskPublisherVisitParam = new TaskPublisherVisitParam(true);

    private get publisherName(): string {
        if (this.targetTaskPublisherView.type === UserType.Individual) {
            return this.targetTaskPublisherView.name as string;
        } else {
            return this.targetTaskPublisherView.principalName as string;
        }
    }

    private onSubmit(): void {
        (async () => {
            const store = (this.$store as Store<IStoreState>);
            const apiResult: ApiResult = await store.dispatch(
                StoreActionNames.taskPublisherVisit,
                {
                    data: this.reqParam,
                } as IStoreActionArgs);
            if (apiResult.code === ApiResultCode.Success) {
                this.$emit(EventNames.Success, apiResult);
            } else {
                this.$emit(EventNames.Failure, apiResult);
            }
        })();
    }
    private onCancel(): void {
        this.$emit(EventNames.Cancel);
    }

    // #endregion

    // #region -- vue life-circle methods
    private mounted(): void {
        this.targetTaskView = this.taskProp || {};
        this.targetTaskPublisherView = this.targetTaskPublisherProp || {};
    }
    // #endregion

    // #region -- internal variables and methods
    private readonly store = (this.$store as Store<IStoreState>);
    private readonly storeState = (this.$store.state as IStoreState);
    @Watch('taskProp', { immediate: true })
    private onTaskPropChanged(currentValue: TaskView, previousValue: TaskView) {
        this.targetTaskView = currentValue || {};
        this.reqParam.uid = this.targetTaskView.uid;
    }
    @Watch('targetTaskPublisherProp', { immediate: true })
    private onTargetTaskExecutorChanged(currentValue: UserView, previousValue: UserView) {
        this.targetTaskPublisherView = currentValue || {};
    }
    // #endregion
}
