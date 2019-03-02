import { ApiErrorHandler } from 'client/common/ApiErrorHandler';
import { RouterUtils } from 'client/common/RouterUtils';
import SingleFileUploadVue from 'client/components/SingleFileUploadVue.vue';
import { IStoreActionArgs } from 'client/VuexOperations/IStoreActionArgs';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { StoreActionNames } from 'client/VuexOperations/StoreActionNames';
import { StoreMutationNames } from 'client/VuexOperations/StoreMutationNames';
import { CommonUtils } from 'common/CommonUtils';
import { LIMIT_FILE_SIZE_M } from 'common/Config';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { FileDownloadParam } from 'common/requestParams/FileDownloadParam';
import { FileUploadParam } from 'common/requestParams/FileUploadParam';
import { TemplateEditParam } from 'common/requestParams/TemplateEditParam';
import { TemplateFileEditParam } from 'common/requestParams/TemplateFileEditParam';
import { TemplateRemoveParam } from 'common/requestParams/TemplateRemoveParam';
import { ApiResult } from 'common/responseResults/APIResult';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { TemplateView } from 'common/responseResults/TemplateView';
import { Component, Vue } from 'vue-property-decorator';
import { Store } from 'vuex';
import { ComponentUtils } from '../components/ComponentUtils';
import { ISingleFileUploadTS } from '../components/SingleFileUploadTS';

interface IFormTemplateCreateData {
    name?: string;
    note?: string;
    // the following props are only for validation
    templateFileUploader?: string;
}

interface IFormTemplateEditData {
    name?: string;
    note?: string;
}
const compToBeRegistered: any = {
    SingleFileUploadVue,
};

@Component({
    components: compToBeRegistered,
})
export class TemplateManagementTS extends Vue {
    // #region -- props and methods for whole Vue Page
    private readonly templageCreationTabName: string = 'TemplateCreation';
    private readonly templateEditTabName: string = 'TemplateEdit';
    private activeTabName: string = this.templateEditTabName;
    private templateFileTypes: string[] = ['application/zip', 'application/x-rar'];
    private templateFileSizeMLimit: number = LIMIT_FILE_SIZE_M;
    private readonly formRules: any = {
        name: [
            { required: true, message: '请输入模板名称', trigger: 'blur' },
            { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' },
        ],
        templateFileUploader: [
            { required: true, message: '模板文件不能为空', trigger: 'blur' },
        ],
    };
    // #endregion

    // #region -- referred props and methods by Template creation Tab
    private readonly formCreateRefName = 'formCreate';
    private readonly uploaderCreateRefName = 'uploaderCreate';

    private readonly formCreateDatas: IFormTemplateCreateData = {
        note: '',
        name: '',
        templateFileUploader: 'templateFileUploader',

    };
    private fileUploadCreateParam: FileUploadParam = new FileUploadParam();

    private onTemplateCreateSuccess(apiResult: ApiResult) {
        this.$message.success('模板创建成功');
        this.resetTemplateCreateForm();
        this.activeTabName = this.templateEditTabName;
        this.store.commit(StoreMutationNames.templateItemInsert, apiResult.data);
    }
    // #endregion

    // #region -- referred props and methods by Template edit
    private search: string = '';
    private readonly activeCollapseNames: string[] = [];
    private readonly editCollapseName: string = 'editCollapse';
    private readonly fileUploadCollapseName: string = 'fileUploadCollapse';
    private readonly formEditRefName = 'formEdit';
    private readonly uploaderEditRefName = 'uploaderEdit';
    private formEditDatas: IFormTemplateEditData = {
        name: '',
        note: '',
    };

    private fileUploadEditParam: FileUploadParam = new FileUploadParam();
    private selectedTemplate: TemplateView = {};

    private get templateObjs(): TemplateView[] {
        return this.storeState.templateObjs;
    }


    private get isBasicInfoUpdated(): boolean {
        const updatedProps = this.getUpdatedProps();
        return Object.keys(updatedProps).length > 0;
    }
    private isSearchReady(placeholder: TemplateView): boolean {
        return true;
    }
    private onTemplateSelect(index: number, item: TemplateView): void {
        this.selectedTemplate = item;
        this.syncTemplateEditForm();
        if (this.activeCollapseNames.length === 0) {
            this.activeCollapseNames.push(this.editCollapseName);
        }
        ComponentUtils.scrollToView(this.editCollapseName);
    }
    private onTemplateDelete(index: number, item: TemplateView): void {
        const confirm = this.$confirm(
            '确认要将要删除此模板吗？',
            '提示', {
                confirmButtonText: '确定',
                type: 'warning',
                center: true,
                closeOnClickModal: false,
            });
        confirm.then(() => {
            (async () => {
                const store = (this.$store as Store<IStoreState>);
                const apiResult: ApiResult = await store.dispatch(
                    StoreActionNames.templateRemove,
                    {
                        data: {
                            uid: item.uid,
                        } as TemplateRemoveParam,
                    } as IStoreActionArgs);
                if (apiResult.code === ApiResultCode.Success) {
                    this.$message.success('提交成功');
                } else if (apiResult.code === ApiResultCode.DbNotFound) {
                    this.$message.warning('所删除模板已经不存在');
                    await this.$$pullTemplateObjs();
                } else {
                    this.$message.error(`提交失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
                }
            })();
        }).catch(() => {
            // do nothing for cancel
        });
    }
    private onTemplateDownload(index: number, item: TemplateView): void {
        ComponentUtils.downloadFile(
            this,
            {
                scenario: FileAPIScenario.DownloadTemplateFile,
                fileId: item.templateFileUid,
                version: item.version,
            } as FileDownloadParam,
            `${item.name}.zip`);
    }

    private onTemplateInfoEditSubmit(): void {
        (async () => {
            const reqParam = this.getUpdatedProps();
            if (Object.keys(reqParam).length > 0) {
                reqParam.uid = this.selectedTemplate.uid;
                const apiResult: ApiResult = await this.store.dispatch(
                    StoreActionNames.templateEdit,
                    {
                        data: reqParam,
                    } as IStoreActionArgs);
                if (apiResult.code === ApiResultCode.Success) {
                    this.selectedTemplate = apiResult.data;
                    this.syncTemplateEditForm();
                    this.$message.success('提交成功');
                } else {
                    this.$message.error(`提交失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
                }
            } else {
                this.$message.warning('没有属性更新');
            }

        })();
    }
    private onTemplateFileUpdateSuccess(apiResult: ApiResult): void {
        this.store.commit(StoreMutationNames.templateItemReplace, apiResult.data);
        this.resetTemplateEditUploader();
        this.$message.success('提交成功');
    }
    private onCollapseChange(activeNames: string[]): void {
        if (CommonUtils.isNullOrEmpty(this.selectedTemplate.uid)) {
            this.activeCollapseNames.splice(0, this.activeCollapseNames.length);
            this.$message.warning('请先选择要编辑的模板');
        } else if (activeNames.length > 1) {
            this.activeCollapseNames.splice(0, this.activeCollapseNames.length - 1);
        }
    }
    // #endregion

    // #region -- vue life-circle methods
    private mounted() {
        // init template creation required data
        this.fileUploadCreateParam.scenario = FileAPIScenario.UploadTemplate;
        this.fileUploadCreateParam.optionData = this.formCreateDatas;
        this.fileUploadEditParam.scenario = FileAPIScenario.UpdateTemplateFile;
        this.fileUploadEditParam.optionData = new TemplateFileEditParam();
        (async () => {
            // init template edit required data
            this.$$pullTemplateObjs();
        })();
    }
    // #endregion

    // region -- internal variables and methods
    private readonly store = (this.$store as Store<IStoreState>);
    private readonly storeState = (this.$store.state as IStoreState);

    private async $$pullTemplateObjs(): Promise<void> {
        const apiResult: ApiResult = await this.store.dispatch(
            StoreActionNames.templateQuery, { notUseLocalData: true } as IStoreActionArgs);
        if (apiResult.code !== ApiResultCode.Success) {
            RouterUtils.goToErrorView(
                this.$router,
                this.storeState,
                `获取模板信息失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
        }
    }

    private resetTemplateCreateForm() {
        (this.$refs[this.formCreateRefName] as any).resetFields();
        (this.$refs[this.uploaderCreateRefName] as any as ISingleFileUploadTS).reset();
    }

    private syncTemplateEditForm(): void {
        if (CommonUtils.isNullOrEmpty(this.selectedTemplate)) {
            this.formEditDatas.name = '';
            this.formEditDatas.note = '';
        } else {
            this.formEditDatas.name = this.selectedTemplate.name;
            this.formEditDatas.note = this.selectedTemplate.note;
        }

        (this.fileUploadEditParam.optionData as TemplateFileEditParam).templateUid =
            this.selectedTemplate.templateFileUid;
    }
    private resetTemplateEditUploader(): void {
        (this.$refs[this.uploaderEditRefName] as any as ISingleFileUploadTS).reset();
    }
    private getUpdatedProps(): TemplateEditParam {
        const reqParam: TemplateEditParam = new TemplateEditParam();
        const viewKeys: string[] = Object.keys(this.selectedTemplate);
        Object.keys(this.formEditDatas).forEach((item) => {
            if (viewKeys.includes(item) &&
                (this.formEditDatas as any)[item] !== this.selectedTemplate[item]) {
                (reqParam as any)[item] = (this.formEditDatas as any)[item];
            }
        });
        return reqParam;
    }
    // #endregion
}
