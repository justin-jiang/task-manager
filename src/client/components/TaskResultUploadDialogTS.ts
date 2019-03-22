import { EventNames } from 'client/common/EventNames';
import SingleFileUploadVue from 'client/components/SingleFileUploadVue.vue';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { ACCEPTED_UPLOAD_FILE_TYPES, LIMIT_FILE_SIZE_M } from 'common/Config';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { FileUploadParam } from 'common/requestParams/FileUploadParam';
import { TaskResultFileUploadParam } from 'common/requestParams/TaskResultFileUploadParam';
import { ApiResult } from 'common/responseResults/APIResult';
import { TaskView } from 'common/responseResults/TaskView';
import { UserView } from 'common/responseResults/UserView';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Store } from 'vuex';
import { ISingleFileUploadTS } from './SingleFileUploadTS';

const compToBeRegistered: any = {
    SingleFileUploadVue,
};



@Component({
    components: compToBeRegistered,
})
export class TaskResultUploadDialogTS extends Vue {
    // #region -- component props and methods
    @Prop() public visibleProp!: boolean;
    @Prop() public taskProp!: TaskView;

    // #endregion

    // #region -- references by the template
    private readonly resultUploaderRefName: string = 'resultUploader';
    private taskResultFileTypes: string[] = ACCEPTED_UPLOAD_FILE_TYPES;
    private taskResultFileSizeMLimit: number = LIMIT_FILE_SIZE_M;
    private filePostParam: FileUploadParam = {};

    private isReadyToSubmit: boolean = false;
    private onSubmit(): void {
        this.filePostParam.scenario = FileAPIScenario.UploadTaskResult;
        this.filePostParam.optionData = new TaskResultFileUploadParam(true);
        this.filePostParam.optionData.uid = this.taskProp.uid;
        (this.$refs[this.resultUploaderRefName] as any as ISingleFileUploadTS).submit();
    }
    private onCancel(): void {
        this.$emit(EventNames.Cancel);
    }
    private onSuccess(apiResult: ApiResult): void {
        this.$emit(EventNames.Success, apiResult);
    }
    private onFileChange(): void {
        const fileUploader = (this.$refs[this.resultUploaderRefName] as any as ISingleFileUploadTS);
        this.isReadyToSubmit = fileUploader != null && fileUploader.isChanged();
    }
    // #endregion

    // #region -- vue life-circle methods
    private mounted(): void {
    }
    // #endregion

    // #region -- internal variables and methods
    private readonly store = (this.$store as Store<IStoreState>);
    private readonly storeState = (this.$store.state as IStoreState);
    @Watch('taskProp', { immediate: true })
    private onTaskChanged(currentValue: TaskView, previousValue: TaskView) {

    }
    // #endregion
}
