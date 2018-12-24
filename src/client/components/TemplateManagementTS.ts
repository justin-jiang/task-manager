import SingleFileUploadVue from 'client/components/SingleFileUploadVue.vue';
import { LoggerManager } from 'client/LoggerManager';
import { RouterUtils } from 'client/views/RouterUtils';
import { IStoreActionArgs } from 'client/VuexOperations/IStoreActionArgs';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { StoreActionNames } from 'client/VuexOperations/StoreActionNames';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { HttpPathItem } from 'common/HttpPathItem';
import { FileCreateParam } from 'common/requestParams/FileCreateParam';
import { FileDownloadParam } from 'common/requestParams/FileDownloadParam';
import { FileEditParam } from 'common/requestParams/FileEditParam';
import { TemplateCreateParam } from 'common/requestParams/TemplateCreateParam';
import { TemplateEditParam } from 'common/requestParams/TemplateEditParam';
import { TemplateFileEditParam } from 'common/requestParams/TemplateFileEditParam';
import { TemplateRemoveParam } from 'common/requestParams/TemplateRemoveParam';
import { APIResult } from 'common/responseResults/APIResult';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { TemplateView } from 'common/responseResults/TemplateView';
import { Component, Vue } from 'vue-property-decorator';
import { Store } from 'vuex';
import { ISingleFileUploadTS } from './SingleFileUploadTS';
interface IFormData {
    name: string;
    note: string;
}

const compToBeRegistered: any = {
    SingleFileUploadVue,
};

@Component({
    components: compToBeRegistered,
})
export class TemplateManagementTS extends Vue {
    // #region -- props and methods for Vue Page or shared among child components
    private readonly templageCreationTabName: string = 'TemplateCreation';
    private readonly templateEditTabName: string = 'TemplateEdit';
    private activeTabName: string = this.templateEditTabName;
    private templateFileTypes: string[] = ['application/zip'];
    private templateFileSizeMLimit: number = 100;
    // #endregion

    // #region -- referred props and methods by Template creation Tab
    private readonly formCreateRefName = 'templateCreateForm';
    private readonly uploaderForCreateRefName = 'uploaderForCreate';
    private readonly uploadURL = `${HttpPathItem.API}/${HttpPathItem.FILE}`;

    private readonly templateCountLimit = 1;
    private templateFileList: File[] = [];

    private readonly formCreateDatas: TemplateCreateParam = new TemplateCreateParam();

    private readonly fileCreateParam: FileCreateParam = new FileCreateParam();

    private submitting: boolean = false;

    private readonly formRules: any = {
        name: [
            { required: true, message: '请输入模板名称', trigger: 'blur' },
            { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' },
        ],
    };

    private templateFileReady(): boolean {
        return this.templateFileList.length > 0;
    }

    private submitForm() {
        (this.$refs[this.formCreateRefName] as any).validate((valid: boolean) => {
            if (valid) {
                this.submitting = true;
                (this.$refs[this.uploaderForCreateRefName] as any).submit();
            } else {
                this.$message({
                    message: '提交前，请检测表单是否填写正确',
                    type: 'warning',
                });
                return false;
            }
        });
    }
    private onTemplateCreateSuccess() {
        this.$message.success('模板创建成功');
        this.resetTemplateCreateForm();
        (async () => {
            await this.$$pullTemplateObjs();
            this.activeTabName = this.templateEditTabName;
        })().catch((ex) => {
            this.$message.error('链接服务器失败，请检查网络连接是否正常');
            LoggerManager.error(ex);
        });
    }
    // #endregion

    // #region -- referred props and methods by Template edit
    private templateObjs: TemplateView[] = [];
    private search: string = '';
    private readonly activeCollapseNames: string[] = [];
    private readonly editCollapseName: string = 'edit';
    private readonly formEditRefName = 'templateEditForm';
    private readonly uploaderForEditRefName = 'uploaderForEdit';
    private readonly formEditDatas: TemplateEditParam = new TemplateEditParam();
    private readonly fileEditParam: FileEditParam = new FileEditParam();
    private selectedTemplateIndex: number | undefined = undefined;

    private isBasicInfoUpdated(): boolean {
        if (this.selectedTemplateIndex == null) {
            return true;
        }
        const selectedTemplate: TemplateView = this.templateObjs[this.selectedTemplateIndex];
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
                const result: APIResult = await store.dispatch(
                    StoreActionNames.templateRemove,
                    {
                        data: {
                            uid: item.uid,
                            templateFileId: item.templateFileId,
                        } as TemplateRemoveParam,
                    } as IStoreActionArgs);
                if (result.code === ApiResultCode.Success) {
                    this.templateObjs.splice(index, 1);
                } else {
                    this.$message.error(`删除模板信息失败，失败代码：${result.code}`);
                }
            })().catch((ex) => {
                RouterUtils.goToErrorView(this.$router);
            });
        }).catch(() => {
            // do nothing for cancel
        });
    }
    private onTemplateDownload(index: number, item: TemplateView): void {
        (async () => {
            const result: APIResult = await this.store.dispatch(
                StoreActionNames.fileDownload,
                {
                    data: {
                        scenario: FileAPIScenario.DownloadTemplateFile,
                        fileId: item.templateFileId,
                        version: item.version,
                    } as FileDownloadParam,
                } as IStoreActionArgs);
            if (result.code === ApiResultCode.Success) {
                const url = window.URL.createObjectURL(new Blob([result.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `${item.name}.zip`);
                document.body.appendChild(link);
                link.click();
            } else {
                this.$message.error(`模板文件下载失败，失败代码：${result.code}`);
            }

        })().catch((ex) => {
            RouterUtils.goToErrorView(this.$router);
        });
    }

    private onTemplateInfoEditSubmit(): void {
        (async () => {
            const result: APIResult = await this.store.dispatch(
                StoreActionNames.templateEdit,
                {
                    data: {
                        uid: this.formEditDatas.uid,
                        name: this.formEditDatas.name,
                        note: this.formEditDatas.note,
                    } as TemplateEditParam,
                } as IStoreActionArgs);
            await this.$$pullTemplateObjs();
            this.syncTemplateEditForm();
            this.$message.success('模板基础信息更新成功');
        })().catch((ex) => {
            this.$message.error('链接服务器失败，请检查网络连接是否正常');
            LoggerManager.error(ex);
        });
    }
    private onTemplateEditSuccess(): void {
        this.resetTemplateEditUploader();
        (async () => {
            await this.$$pullTemplateObjs();
            this.$message.success('模板文件更新成功');
        })().catch((ex) => {
            this.$message.error('链接服务器失败，请检查网络连接是否正常');
            LoggerManager.error(ex);
        });
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
        (async () => {
            // init template creation required data
            this.fileCreateParam.scenario = FileAPIScenario.CreateTemplate;
            this.fileCreateParam.metaData = this.formCreateDatas;
            this.fileEditParam.scenario = FileAPIScenario.EditTemplateFile;
            this.fileEditParam.metaData = new TemplateFileEditParam();

            // init template edit required data
            this.$$pullTemplateObjs();
        })().catch((ex) => {
            this.$message.error('链接失败，请检查网络连接是否正常');
            LoggerManager.error(ex);
        });
    }
    // #endregion

    // region -- internal variables and methods
    private readonly store = (this.$store as Store<IStoreState>);
    private async $$pullTemplateObjs(): Promise<void> {
        const result: APIResult = await this.store.dispatch(
            StoreActionNames.templateQuery, { data: {} } as IStoreActionArgs);
        if (result.code === ApiResultCode.Success) {
            this.templateObjs = result.data;
        } else {
            this.$message.error(`获取模板信息失败，失败代码${result.code}`);
        }
    }

    private resetTemplateCreateForm() {
        (this.$refs[this.formCreateRefName] as any).resetFields();
        (this.$refs[this.uploaderForCreateRefName] as any as ISingleFileUploadTS).reset();
    }

    private syncTemplateEditForm(): void {
        if (this.selectedTemplateIndex == null) {
            this.formEditDatas.uid = '';
            this.formEditDatas.name = '';
            this.formEditDatas.note = '';
            (this.fileEditParam.metaData as TemplateFileEditParam).uid = '';
            (this.fileEditParam.metaData as TemplateFileEditParam).version = -1;
        } else {
            const selectedTemplate: TemplateView = this.templateObjs[this.selectedTemplateIndex];
            this.formEditDatas.uid = selectedTemplate.uid;
            this.formEditDatas.name = selectedTemplate.name;
            this.formEditDatas.note = selectedTemplate.note;
            (this.fileEditParam.metaData as TemplateFileEditParam).uid = selectedTemplate.templateFileId;
            (this.fileEditParam.metaData as TemplateFileEditParam).version = selectedTemplate.version;

        }
    }
    private resetTemplateEditUploader(): void {
        (this.$refs[this.uploaderForEditRefName] as any as ISingleFileUploadTS).reset();
    }
    // #endregion
}
