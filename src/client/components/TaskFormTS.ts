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
import { EventNames } from 'client/common/EventNames';
import { getPropKeys } from 'common/commonDataObjects/CommonObject';
const compToBeRegistered: any = {
};
/**
 * the usage scenario of the TaskForm
 */
export enum UsageScenario {
    NONE = 0,
    Create = 1,
    Edit = 2,
}

/**
 * Form data structure
 */
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

    // the following props are only for validated
    area?: boolean;
}

@Component({
    components: compToBeRegistered,
})
/**
 * the form used to create or edit task info
 */
export class TaskFormTS extends Vue {
    // #region -- component props and methods
    @Prop() public taskProp!: TaskView;
    @Prop() public usageSenario!: UsageScenario;
    // #endregion

    // #region -- reference by template
    private readonly taskFormRefName: string = 'taskForm';
    private orignTaskData: TaskView = {};
    private isSubmitting: boolean = false;
    private nullFormData: IFormTaskData = {
        address: '',
        city: '',
        companyContact: '',
        companyName: '',
        contactPhone: '',
        contactEmail: '',
        deadline: Date.now(),
        district: '',
        executorTypes: [UserType.Individual, UserType.Corp],
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
    private formData: IFormTaskData = Object.assign({}, this.nullFormData);
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
            { required: true, message: '不能为空', trigger: 'change' },
            {
                trigger: 'change',
                validator: (rule: any, value: string, callback: any) => {
                    if (this.formData.deadline == null) {
                        callback('不能为空');
                        return;
                    }
                    callback();
                },
            },
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

    private get isCreate(): boolean {
        return this.usageSenario === UsageScenario.Create;
    }

    private get isDataChanged(): boolean {
        return getPropKeys(this.getTaskEditParam()).length > 0;
    }
    private onProvinceChanged(): void {
        this.formData.city = this.cities[0] || '';
    }
    private onCityChanged(): void {
        this.formData.district = this.districts[0] || '';
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
        const confirm = this.$confirm(
            '任务提交后，将不可再编辑和删除，确认要提交此任务吗？',
            '提示', {
                confirmButtonText: '确定',
                type: 'warning',
                center: true,
                closeOnClickModal: false,
            });
        confirm.then(() => {
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
        }).catch(() => {
            // do nothing for cancel
        });
    }
    private onReset(): void {
        if (this.isCreate) {
            Object.assign(this.formData, this.nullFormData);
        } else {
            Object.assign(this.formData, this.orignTaskData);
        }
        setTimeout(() => {
            if (this.$refs[this.taskFormRefName] != null) {
                (this.$refs[this.taskFormRefName] as any).clearValidate();
            }
        }, 0);
    }
    private onCancel(): void {
        if (this.isDataChanged) {
            const confirm = this.$confirm(
                '确实要放弃修改吗？',
                '提示', {
                    confirmButtonText: '确定',
                    type: 'warning',
                    center: true,
                    closeOnClickModal: false,
                });
            confirm.then(() => {
                this.$emit(EventNames.Cancel);
            }).catch(() => {
                // do nothing for cancel
            });
        } else {
            this.$emit(EventNames.Cancel);
        }
    }
    // #endregion

    // #region Vue life-circle method
    private mounted(): void {
        this.orignTaskData = Object.assign({}, this.taskProp);
        if (this.isCreate) {
            Object.assign(this.formData, this.nullFormData);
        } else {
            Object.assign(this.formData, this.orignTaskData);
        }
    }
    // #endregion
    // region -- internal props and methods
    private readonly store = (this.$store as Store<IStoreState>);
    private readonly storeState = (this.$store.state as IStoreState);
    @Watch('taskProp', { immediate: true })
    private onTaskPropChanged(currentValue: TaskView, previousValue: TaskView) {
        if (currentValue != null && !CommonUtils.isNullOrEmpty(currentValue.uid)) {
            this.orignTaskData = currentValue;
        } else {
            this.orignTaskData = Object.assign({}, this.nullFormData);
        }
        this.onReset();
    }

    @Watch('formData.city', { immediate: true })
    private onCityValueChanged(currentValue: string, previousValue: string) {
        this.formData.district = this.districts[0] || '';
    }

    private getTaskCreateParam(): TaskCreateParam {
        return ComponentUtils.pickUpKeysByModel(this.formData, new TaskCreateParam(true));
    }
    private getTaskEditParam(): TaskBasicInfoEditParam {
        const reqParam = new TaskBasicInfoEditParam();
        Object.keys(this.orignTaskData).forEach((item) => {
            if ((this.formData as any)[item] !== undefined &&
                this.orignTaskData[item] !== (this.formData as any)[item]) {
                (reqParam as any)[item] = (this.formData as any)[item];
            }
        });
        if (Object.keys(reqParam).length > 0) {
            reqParam.uid = this.orignTaskData.uid;
        }
        return reqParam;
    }
    private async $$saveTask(isSubmitting?: boolean): Promise<ApiResult> {
        let apiResult: ApiResult = { code: ApiResultCode.NONE };
        if (this.isCreate) {
            // for new creation
            const reqParam = this.getTaskCreateParam();
            apiResult = await this.store.dispatch(
                StoreActionNames.taskCreate, {
                    data: reqParam,
                } as IStoreActionArgs);
        } else {
            // for edit or submitting
            const reqParam = this.getTaskEditParam();
            if (Object.keys(reqParam).length === 0) {
                if (!isSubmitting) {
                    this.$message.warning('没有修改任何属性');
                } else {
                    apiResult.code = ApiResultCode.Success;
                    apiResult.data = this.orignTaskData;
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
