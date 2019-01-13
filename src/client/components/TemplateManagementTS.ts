import { AxiosResponse } from 'axios';
import { ApiErrorHandler } from 'client/common/ApiErrorHandler';
import { msgConnectionIssue } from 'client/common/Constants';
import { RouterUtils } from 'client/common/RouterUtils';
import SingleFileUploadVue from 'client/components/SingleFileUploadVue.vue';
import { LoggerManager } from 'client/LoggerManager';
import { IStoreActionArgs } from 'client/VuexOperations/IStoreActionArgs';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { StoreActionNames } from 'client/VuexOperations/StoreActionNames';
import { StoreMutationNames } from 'client/VuexOperations/StoreMutationNames';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { FileDownloadParam } from 'common/requestParams/FileDownloadParam';
import { FileUploadParam } from 'common/requestParams/FileUploadParam';
import { TemplateCreateParam } from 'common/requestParams/TemplateCreateParam';
import { TemplateEditParam } from 'common/requestParams/TemplateEditParam';
import { TemplateFileEditParam } from 'common/requestParams/TemplateFileEditParam';
import { TemplateRemoveParam } from 'common/requestParams/TemplateRemoveParam';
import { ApiResult } from 'common/responseResults/APIResult';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { TemplateView } from 'common/responseResults/TemplateView';
import { Component, Vue } from 'vue-property-decorator';
import { Store } from 'vuex';
import { ISingleFileUploadTS } from './SingleFileUploadTS';
import { ComponentUtils } from './ComponentUtils';
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
    private templateFileSizeMLimit: number = 100;
    // #endregion

    // #region -- referred props and methods by Template creation Tab
    private readonly formCreateRefName = 'formCreate';
    private readonly uploaderCreateRefName = 'uploaderCreate';

    private readonly formCreateDatas: TemplateCreateParam = new TemplateCreateParam();

    private readonly fileUpdateParam: FileUploadParam = new FileUploadParam();

    private readonly formRules: any = {
        name: [
            { required: true, message: '请输入模板名称', trigger: 'blur' },
            { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' },
        ],
    };

    private onTemplateCreateSuccess(apiResult: ApiResult) {
        this.$message.success('模板创建成功');
        this.resetTemplateCreateForm();
        this.activeTabName = this.templateEditTabName;
        this.store.commit(StoreMutationNames.templateItemInsert, apiResult.data);
    }
    // #endregion

    // #region -- referred props and methods by Template edit
    private getTemplateObjs(): TemplateView[] {
        return this.storeState.templateObjs;
    };
    private search: string = '';
    private readonly activeCollapseNames: string[] = [];
    private readonly editCollapseName: string = 'editCollapse';
    private readonly fileUploadCollapseName: string = 'fileUploadCollapse';
    private readonly formEditRefName = 'formEdit';
    private readonly uploaderEditRefName = 'uploaderEdit';
    private formEditDatas: TemplateEditParam = new TemplateEditParam();
    private fileUploadParam: FileUploadParam = new FileUploadParam();
    private selectedTemplateIndex: number | undefined = undefined;
    private isSearchReady(): boolean {
        return true;
    }

    private isBasicInfoUpdated(): boolean {
        if (this.selectedTemplateIndex == null) {
            return true;
        }
        const selectedTemplate: TemplateView = this.getTemplateObjs()[this.selectedTemplateIndex];
        if (selectedTemplate.name !== this.formEditDatas.name ||
            selectedTemplate.note !== this.formEditDatas.note) {
            return false;
        }
        return true;
    }
    private onTemplateSelect(index: number, item: TemplateView): void {
        this.selectedTemplateIndex = index;
        this.syncTemplateEditForm();
        if (this.activeCollapseNames.length === 0) {
            this.activeCollapseNames.push(this.editCollapseName);
        }
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
                    this.$message.success('模板删除成功');
                } else if (apiResult.code === ApiResultCode.DbNotFound) {
                    this.$message.warning('所删除模板已经不存在');
                    await this.$$pullTemplateObjs();
                } else {
                    this.$message.error(`删除模板信息失败：${ApiErrorHandler.getTextByCode(apiResult.code)}`);
                }
            })().catch((ex) => {
                RouterUtils.goToErrorView(this.$router, this.storeState, msgConnectionIssue, ex);
            });
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
            const result: ApiResult = await this.store.dispatch(
                StoreActionNames.templateEdit,
                {
                    data: {
                        uid: this.formEditDatas.uid,
                        name: this.formEditDatas.name,
                        note: this.formEditDatas.note,
                    } as TemplateEditParam,
                } as IStoreActionArgs);
            this.syncTemplateEditForm();
            this.$message.success('模板基础信息更新成功');
        })().catch((ex) => {
            this.$message.error('链接服务器失败，请检查网络连接是否正常');
            LoggerManager.error(ex);
        });
    }
    private onTemplateEditSuccess(): void {
        this.$message.success('模板文件更新成功');
        this.resetTemplateEditUploader();
    }
    private onCollapseChange(): void {
        if (this.selectedTemplateIndex == null) {
            this.activeCollapseNames.splice(0, this.activeCollapseNames.length);
            this.$message.warning('请先选择要编辑的模板');
        }
    }
    // #endregion

    // #region -- vue life-circle methods
    private mounted() {
        // init template creation required data
        this.fileUpdateParam.scenario = FileAPIScenario.UploadTemplate;
        this.fileUpdateParam.optionData = this.formCreateDatas;
        this.fileUploadParam.scenario = FileAPIScenario.UpdateTemplateFile;
        this.fileUploadParam.optionData = new TemplateFileEditParam();
        (async () => {
            // init template edit required data
            this.$$pullTemplateObjs();
        })().catch((ex) => {
            this.$message.error(msgConnectionIssue);
            LoggerManager.error('ERROR:', ex);
        });
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
                `获取模板信息失败：${ApiErrorHandler.getTextByCode(apiResult.code)}`);
        }
    }

    private resetTemplateCreateForm() {
        (this.$refs[this.formCreateRefName] as any).resetFields();
        (this.$refs[this.uploaderCreateRefName] as any as ISingleFileUploadTS).reset();
    }

    private syncTemplateEditForm(): void {
        const newFormEditData: TemplateEditParam = {};
        const newFileUploadData: FileUploadParam = {};
        newFileUploadData.optionData = new TemplateFileEditParam();
        if (this.selectedTemplateIndex == null) {
            newFormEditData.uid = '';
            newFormEditData.name = '';
            newFormEditData.note = '';
            newFileUploadData.scenario = this.fileUploadParam.scenario;
            newFileUploadData.optionData.templateUid = '';
        } else {
            const selectedTemplate: TemplateView = this.getTemplateObjs()[this.selectedTemplateIndex];
            newFormEditData.uid = selectedTemplate.uid;
            newFormEditData.name = selectedTemplate.name;
            newFormEditData.note = selectedTemplate.note;
            newFileUploadData.scenario = this.fileUploadParam.scenario;
            newFileUploadData.optionData.templateUid = selectedTemplate.uid;
        }
        this.formEditDatas = newFormEditData;
        this.fileUploadParam = newFileUploadData;
    }
    private resetTemplateEditUploader(): void {
        (this.$refs[this.uploaderEditRefName] as any as ISingleFileUploadTS).reset();
    }
    // #endregion
}
