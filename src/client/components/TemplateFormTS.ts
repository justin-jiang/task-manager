import { ApiErrorHandler } from 'client/common/ApiErrorHandler';
import { EventNames } from 'client/common/EventNames';
import { ISingleFileUploadTS } from 'client/components/SingleFileUploadTS';
import SingleFileUploadVue from 'client/components/SingleFileUploadVue.vue';
import { IStoreActionArgs } from 'client/VuexOperations/IStoreActionArgs';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { StoreActionNames } from 'client/VuexOperations/StoreActionNames';
import { StoreMutationNames } from 'client/VuexOperations/StoreMutationNames';
import { CommonUtils } from 'common/CommonUtils';
import { LIMIT_FILE_SIZE_M } from 'common/Config';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { FileUploadParam } from 'common/requestParams/FileUploadParam';
import { TemplateCreateParam } from 'common/requestParams/TemplateCreateParam';
import { TemplateEditParam } from 'common/requestParams/TemplateEditParam';
import { ApiResult } from 'common/responseResults/APIResult';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { TemplateView } from 'common/responseResults/TemplateView';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Store } from 'vuex';
import { ComponentUtils } from './ComponentUtils';
const compToBeRegistered: any = {
    SingleFileUploadVue,
};
export enum UsageScenario {
    NONE = 0,
    Create = 1,
    Edit = 2,
    Detail = 3,
    Audit = 4,
}
interface IFormData extends TemplateView {
    // the following props are only for validation
    templateFileUploader?: string;
}

@Component({
    components: compToBeRegistered,
})
/**
 * the form used to create or edit task info
 */
export class TemplateFormTS extends Vue {
    // #region -- component props and methods
    @Prop() public templateViewProp!: TemplateView;
    // #endregion

    // #region -- reference by template
    private readonly formRefName: string = 'templateForm';
    private readonly formData: IFormData = {
        note: '',
        name: '',
        templateFileUploader: 'templateFileUploader',
    };

    private readonly formRules: any = {
        name: [
            { required: true, message: '请输入模板名称', trigger: 'blur' },
            { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' },
        ],
        templateFileUploader: [
            { required: true, message: '模板文件不能为空', trigger: 'blur' },
            {
                trigger: 'change',
                validator: (rule: any, value: string, callback: any) => {
                    if (CommonUtils.isNullOrEmpty(this.templateView.uid)) {
                        callback('模板文件不能为空');
                        return;
                    }
                    callback();
                },
            },
        ],

    };


    private isSubmitting: boolean = false;
    private templateView: TemplateView = {};
    private isFileChanged: boolean = false;
    private uploadParam: FileUploadParam = new FileUploadParam();
    private get isReadyToSave(): boolean {

        const updatedProps = this.getUpdatedProps();
        if (this.isFileChanged || Object.keys(updatedProps).length > 0) {
            return true;
        } else {
            return false;
        }
    }
    private onTemplateFileChange(): void {
        const uploader: ISingleFileUploadTS =
            (this.$refs[this.uploaderRefName] as any as ISingleFileUploadTS);
        this.isFileChanged = uploader.isChanged();
    }
    private onSave(): void {
        (this.$refs[this.formRefName] as any).validate((valid: boolean) => {
            if (valid) {
                if (CommonUtils.isNullOrEmpty(this.templateView.uid)) {
                    // invoke the file upload api with TemplateCreate Scenario
                    this.uploadParam.scenario = FileAPIScenario.CreateTemplate;
                    this.uploadParam.optionData = ComponentUtils.pickUpKeysByModel(
                        this.formData, new TemplateCreateParam(true));
                    const uploader: ISingleFileUploadTS =
                        this.$refs[this.uploaderRefName] as any as ISingleFileUploadTS;
                    uploader.submit();
                } else {
                    this.updateTemplate();
                }
            } else {
                this.$message.warning('表单中包含不合格的内容');
            }
        });

    }

    private onReset(): void {
        this.resetTemplateForm();
        this.$emit(EventNames.Reset);
    }

    private onCancel(): void {
        this.$emit(EventNames.Cancel);
    }

    // #endregion

    //#region -- reference by SingleFileUploadVue
    private readonly uploaderRefName = 'uploader';
    private templateFileTypes: string[] = ['application/zip', 'application/x-rar'];
    private templateFileSizeMLimit: number = LIMIT_FILE_SIZE_M;

    private onTemplateCreateSuccess(apiResult: ApiResult) {
        this.resetTemplateForm();
        this.store.commit(StoreMutationNames.templateItemInsert, apiResult.data);
        this.$emit(EventNames.Success);
    }
    private resetTemplateForm() {
        Object.assign(this.formData, this.templateView);
        const uploader: ISingleFileUploadTS = (this.$refs[this.uploaderRefName] as any as ISingleFileUploadTS);
        if (uploader != null) {
            uploader.reset();
        }
    }
    //#endregion

    // #region Vue life-circle method
    private mounted(): void {
        this.templateView = this.templateViewProp || {};
        Object.assign(this.formData, this.templateView);
    }
    // #endregion
    // region -- internal props and methods
    private readonly store = (this.$store as Store<IStoreState>);
    private readonly storeState = (this.$store.state as IStoreState);
    @Watch('templateViewProp', { immediate: true })
    private onTemplateViewChanged(currentValue: TemplateView, previousValue: TemplateView) {
        this.templateView = currentValue || { name: '', note: '' } as TemplateView;
        Object.assign(this.formData, this.templateView);
    }

    private getUpdatedProps(): TemplateEditParam {
        const reqParam: TemplateEditParam = new TemplateEditParam();
        const viewKeys: string[] = Object.keys(this.templateView);
        Object.keys(this.formData).forEach((item) => {
            if (viewKeys.includes(item) &&
                (this.formData as any)[item] !== this.templateView[item]) {
                (reqParam as any)[item] = (this.formData as any)[item];
            }
        });
        return reqParam;
    }
    private updateTemplate(): void {
        (async () => {
            const reqParam = this.getUpdatedProps();
            if (Object.keys(reqParam).length > 0) {
                reqParam.uid = this.templateView.uid;
                const apiResult: ApiResult = await this.store.dispatch(
                    StoreActionNames.templateEdit,
                    {
                        data: reqParam,
                    } as IStoreActionArgs);
                if (apiResult.code === ApiResultCode.Success) {
                    this.templateView = apiResult.data;
                    Object.assign(this.formData, this.templateView);
                    this.$emit(EventNames.Success);
                } else {
                    this.$message.error(`提交失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
                }
            } else {
                this.$message.warning('没有属性更新');
            }
        })();
    }
    // #endregion

}
