import { ApiErrorHandler } from 'client/common/ApiErrorHandler';
import { InputValidator } from 'client/common/InputValidator';
import { ViewTextUtils } from 'client/common/ViewTextUtils';
import { IStoreActionArgs } from 'client/VuexOperations/IStoreActionArgs';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { StoreActionNames } from 'client/VuexOperations/StoreActionNames';
import { CommonUtils } from 'common/CommonUtils';
import { locations } from 'common/Locations';
import { TaskBasicInfoEditParam } from 'common/requestParams/TaskBasicInfoEditParam';
import { TaskCreateParam } from 'common/requestParams/TaskCreateParam';
import { TaskSubmitParam } from 'common/requestParams/TaskSubmitParam';
import { ApiResult } from 'common/responseResults/APIResult';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { TaskView } from 'common/responseResults/TaskView';
import { TemplateView } from 'common/responseResults/TemplateView';
import { TaskState } from 'common/TaskState';
import { UserType } from 'common/UserTypes';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Store } from 'vuex';
import { ComponentUtils } from './ComponentUtils';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { FileDownloadParam } from 'common/requestParams/FileDownloadParam';
const compToBeRegistered: any = {
};
export enum UsageScenario {
    NONE = 0,
    Create = 1,
    Edit = 2,
    Detail = 3,
    Audit = 4,
}
interface IFormTaskData {
    address?: string;
    city?: string;
    companyContact?: string;
    companyName?: string;
    contactPhone?: string;
    contactEmail?: string;
    executorTypes?: UserType[];
    deadline?: number;
    district?: string;
    minExecutorStar?: number;
    name?: string;
    note?: string;
    proposedMargin?: number;
    province?: string;
    reward?: number;
    templateFileUid?: string;

    // the following props are for validated
    area?: boolean;
}
enum EventNames {
    Success = 'success',
    Failure = 'failure',
    Cancelled = 'cancelled',
}
@Component({
    components: compToBeRegistered,
})
/**
 * the form used to create or edit task info
 */
export class TaskFormTS extends Vue {
    // #region -- component props and methods
    @Prop() public taskViewProp!: TaskView;
    @Prop() public usageSenario!: UsageScenario;
    // #endregion

    // #region -- props and methods refered by vue page
    private readonly taskFormRefName: string = 'taskForm';
    private targetTaskView: TaskView = {};
    private isSubmitting: boolean = false;
    private formData: IFormTaskData = {
        address: '',
        city: '',
        companyContact: '',
        companyName: '',
        contactPhone: '',
        contactEmail: '',
        deadline: Date.now(),
        district: '',
        executorTypes: [],
        minExecutorStar: 0,
        name: '',
        note: '',
        proposedMargin: 0,
        province: '',
        reward: 0,
        templateFileUid: '',
        // the following props are only for validation
        area: false,
    };
    private readonly formRules: any = {
        name: [
            { required: true, message: '请输入任务名称', trigger: 'blur' },
            { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' },
        ],
        reward: [
            { required: true, message: '不能为空', trigger: 'blur' },
        ],
        proposedMargin: [
            { required: true, message: '不能为空', trigger: 'blur' },
        ],
        deadline: [
            { required: true, message: '不能为空', trigger: 'blur' },
        ],
        executorTypes: [
            { required: true, message: '不能为空', trigger: 'change' },
            {
                trigger: 'change',
                validator: (rule: any, value: string, callback: any) => {
                    if (this.formData.executorTypes == null ||
                        this.formData.executorTypes.length === 0) {
                        callback('不能为空');
                        return;
                    }
                    callback();
                },
            },
        ],
        minExecutorStar: [
            { required: true, message: '不能为空', trigger: 'blur' },
        ],
        note: [
            { required: true, message: '不能为空', trigger: 'blur' },
            { min: 3, message: '不能少于3个字', trigger: 'blur' },
        ],
        templateFileUid: [{ required: true, message: '不能为空', trigger: 'change' }, {
            trigger: 'change',
            validator: (rule: any, value: string, callback: any) => {
                if (CommonUtils.isNullOrEmpty(this.formData.templateFileUid)) {
                    callback('模板不能为空');
                    return;
                }
                callback();
            },
        }],
        address: [{ required: true, message: '不能为空', trigger: 'blur' }],
        area: [{ required: true, trigger: 'change' }, {
            trigger: 'change',
            validator: (rule: any, value: string, callback: any) => {
                if (CommonUtils.isNullOrEmpty(this.formData.province)) {
                    callback('省份不能为空');
                    return;
                }
                if (CommonUtils.isNullOrEmpty(this.formData.city)) {
                    callback('市不能为空');
                    return;
                }
                if (CommonUtils.isNullOrEmpty(this.formData.district)) {
                    callback('区不能为空');
                    return;
                }
                callback();
            },
        }],
        companyName: [
            { required: true, message: '不能为空', trigger: 'blur' },
        ],
        companyContact: [
            { required: true, message: '不能为空', trigger: 'blur' },
        ],
        contactPhone: [
            { required: true, message: '不能为空', trigger: 'blur' },
            { validator: InputValidator.checkTelephone, trigger: 'blur' },
        ],
        contactEmail: [
            { required: true, message: '不能为空', trigger: 'blur' },
            { validator: InputValidator.checkEmail, trigger: 'blur' },
        ],

    };
    private readonly pickerOptions = {
        disabledDate(time: Date) {
            return time.getTime() < Date.now();
        },
        shortcuts: [
            {
                text: '一周后',
                onClick(picker: any) {
                    const date = new Date();
                    date.setTime(date.getTime() + 3600 * 1000 * 24 * 7);
                    picker.$emit('pick', date);
                },
            }],
    };
    private get userTypeSelection(): any {
        return ViewTextUtils.getUserTypeSelection();
    }
    private get userStar(): any {
        const options: Array<{ label: string, value: number }> = [];
        options.push({ label: '全部', value: 0 });
        options.push({ label: '一星或以上', value: 1 });
        options.push({ label: '二星或以上', value: 2 });
        options.push({ label: '三星或以上', value: 3 });
        options.push({ label: '四星或以上', value: 4 });
        options.push({ label: '五星', value: 5 });
        return options;
    }
    private get isSubmitted(): boolean {
        return this.targetTaskView.state != null &&
            this.targetTaskView.state !== TaskState.None &&
            this.targetTaskView.state !== TaskState.Created;
    }
    private get provinces(): string[] {
        const provinces: string[] = [];
        for (const item of locations) {
            provinces.push(item.name);
        }
        return provinces;
    }

    private get cities(): string[] {
        const cities: string[] = [];
        for (const pItem of locations) {
            if (this.formData.province === pItem.name) {
                for (const cItem of pItem.cities) {
                    cities.push(cItem.name);
                }
                break;
            }
        }
        return cities;
    }

    private get districts(): string[] {
        const districts: string[] = [];
        for (const pItem of locations) {
            if (this.formData.province === pItem.name) {
                for (const cItem of pItem.cities) {
                    if (cItem.name === this.formData.city) {
                        for (const dItem of cItem.districts) {
                            districts.push(dItem.name);
                        }
                        break;
                    }
                }
                break;
            }
        }
        return districts;
    }
    private get selectedTemplateName(): string {
        this.templateObjs.forEach((item) => {
            if (item.templateFileUid === this.formData.templateFileUid) {
                return item.name;
            }
        });
        return '';
    }
    private get templateObjs(): TemplateView[] {
        return this.storeState.templateObjs;
    }

    private get isTaskResultReady(): boolean {
        return !CommonUtils.isNullOrEmpty(this.targetTaskView.resultFileUid);
    }
    private get isCreate(): boolean {
        return this.usageSenario === UsageScenario.Create;
    }
    private get isEdit(): boolean {
        return this.usageSenario === UsageScenario.Edit;
    }
    private get isDetail(): boolean {
        return this.usageSenario === UsageScenario.Detail;
    }
    private onProvinceChanged(): void {
        this.formData.city = undefined;
        this.formData.district = undefined;
    }
    private onCityChanged(): void {
        this.formData.district = undefined;
    }
    private onSave(): void {
        (this.$refs[this.taskFormRefName] as any).validate((valid: boolean) => {
            if (valid) {
                (async () => {
                    this.isSubmitting = true;
                    await this.$$saveTask();
                })().finally(() => {
                    this.isSubmitting = false;
                });
            } else {
                this.$message.warning('表单中包含不合格的内容');
            }
        });
    }
    private onSubmit(): void {
        (this.$refs[this.taskFormRefName] as any).validate((valid: boolean) => {
            if (valid) {
                (async () => {
                    this.isSubmitting = true;
                    let apiResult: ApiResult = await this.$$saveTask(true/*submit task*/);
                    if (apiResult.code === ApiResultCode.Success) {
                        apiResult = await this.store.dispatch(
                            StoreActionNames.taskSubmit, {
                                data: { uid: (apiResult.data as TaskView).uid } as TaskSubmitParam,
                            } as IStoreActionArgs);
                        if (apiResult.code === ApiResultCode.Success) {
                            this.$message.success('提交成功');
                            this.onReset();
                            this.$emit(EventNames.Success, apiResult);
                        } else {
                            this.$message.error(`提交失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
                            this.$emit(EventNames.Failure, apiResult);
                        }
                    }

                })().finally(() => {
                    this.isSubmitting = false;
                });
            } else {
                this.$message.warning('表单中包含不合格的内容');
            }
        });
    }
    private onReset(): void {
        if (this.isCreate) {
            (this.$refs[this.taskFormRefName] as any).resetFields();
            this.formData.province = '';
            this.formData.city = '';
            this.formData.district = '';
            this.formData.deadline = Date.now();
        } else {
            Object.assign(this.formData, this.targetTaskView);
        }
    }
    private onCancelled(): void {
        this.$emit(EventNames.Cancelled);
    }
    private onResultDownload(): void {
        if (CommonUtils.isNullOrEmpty(this.targetTaskView.resultFileUid)) {
            this.$message.warning('尽调结果未上传');
            return;
        }
        ComponentUtils.downloadFile(this,
            {
                scenario: FileAPIScenario.DownloadTaskResultFile,
                fileId: this.targetTaskView.resultFileUid,
                version: this.targetTaskView.resultFileversion,
            } as FileDownloadParam,
            `${this.targetTaskView.name}.zip`);
    }
    private onTemplateDownload(): void {
        ComponentUtils.downloadFile(this,
            {
                scenario: FileAPIScenario.DownloadTemplateFile,
                fileId: this.targetTaskView.templateFileUid,
            } as FileDownloadParam,
            `${this.targetTaskView.name}.zip`);
    }


    // #endregion

    // #region Vue life-circle method
    private mounted(): void {
        this.targetTaskView = this.taskViewProp || {};
        Object.assign(this.formData, this.targetTaskView);
    }
    // #endregion
    // region -- internal props and methods
    private readonly store = (this.$store as Store<IStoreState>);
    private readonly storeState = (this.$store.state as IStoreState);
    @Watch('taskViewProp', { immediate: true })
    private ontaskViewChanged(currentValue: TaskView, previousValue: TaskView) {
        this.targetTaskView = currentValue || {};
        Object.assign(this.formData, this.targetTaskView);
    }

    private getTaskCreateParam(formData: IFormTaskData): TaskCreateParam {
        return ComponentUtils.pickUpKeysByModel(formData, new TaskCreateParam(true));
    }
    private getTaskEditParam(formData: IFormTaskData): TaskBasicInfoEditParam {
        const reqParam = new TaskBasicInfoEditParam();
        Object.keys(this.targetTaskView).forEach((item) => {
            if (this.targetTaskView[item] !== (formData as any)[item]) {
                (reqParam as any)[item] = (formData as any)[item];
            }
        });
        if (Object.keys(reqParam).length > 0) {
            reqParam.uid = this.targetTaskView.uid;
        }
        return reqParam;
    }
    private async $$saveTask(isSubmitting?: boolean): Promise<ApiResult> {
        let apiResult: ApiResult = { code: ApiResultCode.NONE };
        if (this.isCreate) {
            // for new creation
            const reqParam = this.getTaskCreateParam(this.formData);
            apiResult = await this.store.dispatch(
                StoreActionNames.taskCreation, {
                    data: reqParam,
                } as IStoreActionArgs);
        } else {
            // for edit or submitting
            const reqParam = this.getTaskEditParam(this.formData);
            if (Object.keys(reqParam).length === 0) {
                if (!isSubmitting) {
                    this.$message.warning('没有修改任何属性');
                } else {
                    apiResult.code = ApiResultCode.Success;
                    apiResult.data = this.targetTaskView;
                }
                return apiResult;
            }
            apiResult = await this.store.dispatch(
                StoreActionNames.taskBasicInfoEdit, {
                    data: reqParam,
                } as IStoreActionArgs);
        }

        if (apiResult.code === ApiResultCode.Success) {
            this.$message.success('提交成功');
            this.onReset();
            this.$emit(EventNames.Success, apiResult);
        } else {
            this.$message.error(`提交失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
            this.$emit(EventNames.Failure, apiResult);
        }
        return apiResult;
    }
    // #endregion

}
