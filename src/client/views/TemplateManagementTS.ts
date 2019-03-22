import { ApiErrorHandler } from 'client/common/ApiErrorHandler';
import SingleFileUploadVue from 'client/components/SingleFileUploadVue.vue';
import TemplateFormVue from 'client/components/TemplateFormVue.vue';
import { IStoreActionArgs } from 'client/VuexOperations/IStoreActionArgs';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { StoreActionNames } from 'client/VuexOperations/StoreActionNames';
import { StoreMutationNames } from 'client/VuexOperations/StoreMutationNames';
import { CommonUtils } from 'common/CommonUtils';
import { LIMIT_FILE_SIZE_M } from 'common/Config';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { FileDownloadParam } from 'common/requestParams/FileDownloadParam';
import { TemplateRemoveParam } from 'common/requestParams/TemplateRemoveParam';
import { ApiResult } from 'common/responseResults/APIResult';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { TemplateView } from 'common/responseResults/TemplateView';
import { Component, Vue } from 'vue-property-decorator';
import { Store } from 'vuex';
import { ComponentUtils } from '../components/ComponentUtils';

const compToBeRegistered: any = {
    SingleFileUploadVue,
    TemplateFormVue,
};

@Component({
    components: compToBeRegistered,
})
export class TemplateManagementTS extends Vue {
    // #region -- reference by template

    private readonly templateFileTypes: string[] = ['application/zip', 'application/x-rar'];
    private readonly templateFileSizeMLimit: number = LIMIT_FILE_SIZE_M;
    private templateDialogVisible: boolean = false;
    private selectedTemplate: TemplateView = {};
    private search: string = '';

    private isSearchReady(placeholder: TemplateView): boolean {
        return true;
    }
    private get templateObjs(): TemplateView[] {
        return this.storeState.templateObjs.filter(
            (item: TemplateView) => {
                if (!this.search) {
                    return true;
                }
                if (item != null && item.name != null && item.name.toLowerCase().includes(this.search.toLowerCase())) {
                    return true;
                } else {
                    return false;
                }
            });
    }
    /**
     * triggered by create button click
     */
    private onCreate(): void {
        this.selectedTemplate = {};
        this.templateDialogVisible = true;
    }

    private onTemplateSelect(index: number, item: TemplateView): void {
        this.selectedTemplate = item;
        this.templateDialogVisible = true;
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
    // #endregion

    //#region -- reference by TemplateForm Dialog
    private get templateDialogTitle(): string {
        if (CommonUtils.isNullOrEmpty(this.selectedTemplate.uid)) {
            return '模板创建';
        } else {
            return '模板编辑';
        }
    }
    private onTemplateFormCancel(): void {
        this.templateDialogVisible = false;
    }

    private onTemplateFormSuccess(apiResult: ApiResult): void {
        this.templateDialogVisible = false;
        this.$message.success('提交成功');
    }
    //#endregion


    // #region -- vue life-circle methods
    private mounted() {
        // init template creation required data
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
            this.$message.error(`获取模板信息失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
        }
    }

    // #endregion
}
