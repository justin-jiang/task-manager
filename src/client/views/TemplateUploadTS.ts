import { IFilePostParam } from '@/common/requestParams/IFilePostParam';
import { ITemplatePostParam } from '@/common/requestParams/ITemplatePostParam';
import { ApiResultCode } from '@/common/responseResults/ApiResultCode';
import { IAPIResult } from '@/common/responseResults/IAPIResult';
import { CommonUtils as CommonUtils } from '@/common/CommonUtils';
import { Component, Vue } from 'vue-property-decorator';
import { Store } from 'vuex';
import { IStoreActionArgs } from '../VuexOperations/IStoreActionArgs';
import { IAdminStoreState } from '../VuexOperations/IStoreState';
import { StoreActionNames } from '../VuexOperations/StoreActionNames';
import { API_PATH_API, API_PATH_FILE } from '@/common/Constants';
import { LoggerManager } from '../LoggerManager';
interface IFormData {
    name: string;
    note: string;
}

const compToBeRegistered: any = {
};

@Component({
    components: compToBeRegistered,
})
export class TemplateUploadTS extends Vue {
    // #region -- referred props and methods by Vue Page
    private readonly formRefName = 'templateUploadForm';
    private readonly uploaderRefName = 'templateUploader';
    private readonly uploadURL = `${API_PATH_API}/${API_PATH_FILE}`;

    private readonly templateCountLimit = 1;
    private templateFileList: File[] = [];

    private readonly formDatas: IFormData = {
        name: '',
        note: '',
    };

    private readonly filePostParam: IFilePostParam = {
        entryId: CommonUtils.getUUIDForMongoDB(),
        version: 0,
    };

    private submitting: boolean = false;

    private readonly formRules: any = {
    };

    private templateFileReady(): boolean {
        return this.templateFileList.length > 0;
    }

    private submitForm() {
        (this.$refs[this.formRefName] as any).validate((valid: boolean) => {
            if (valid) {
                this.submitting = true;
                (this.$refs[this.uploaderRefName] as any).submit();
                // const store = (this.$store as Store<IAdminStoreState>);
                // (async () => {

                //     const filePostParam: IFilePostParam = {
                //         entryId: CommonUtils.getUUIDForMongoDB(),
                //         version: 0,
                //         fileData: this.formDatas.templateFile,
                //     };

                //     let apiResult: IAPIResult = await store.dispatch(
                //         StoreActionNames.uploadFile, { data: filePostParam });
                //     if (apiResult != null && apiResult.code === ApiResultCode.Success) {
                //         const postParam: ITemplatePostParam = {
                //             name: this.formDatas.name as string,
                //             note: this.formDatas.note as string,
                //             templateFileId: filePostParam.entryId as string,
                //         };
                //         apiResult = await store.dispatch(
                //             StoreActionNames.createUser, { data: postParam } as IStoreActionArgs);
                //         if (apiResult != null && apiResult.code === ApiResultCode.Success) {
                //             this.$message({
                //                 message: '模板创建成功',
                //                 type: 'success',
                //             });
                //         } else {
                //             this.$message({
                //                 message: `提交失败（失败代码:${apiResult.code}）`,
                //                 type: 'error',
                //             });
                //         }
                //     }
                // })().catch((ex) => {
                //     this.$message({
                //         message: '提交失败',
                //         type: 'error',
                //     });
                // }).finally(() => {
                //     this.submitting = false;
                // });

            } else {
                this.$message({
                    message: '提交前，请检测表单是否填写正确',
                    type: 'warning',
                });
                return false;
            }
        });
    }
    private resetForm() {

    }

    private onTemplateFileChange(file: { raw: File }, fileList: Array<{ raw: File }>) {
        this.templateFileList = [];
        this.templateFileList.push(file.raw);
    }
    private onTemplateFileCountExceed(files: { raw: File }, fileList: Array<{ raw: File }>) {
        this.$message.warning(`每类模板只允许上传一个模板文档`);
    }
    private onTemplateFileSuccess(response: IAPIResult, file: { raw: File }, fileList: Array<{ raw: File }>) {
        if (response.code !== ApiResultCode.Success) {
            this.$message.error(`上传文档失败，失败代码：${response.code}`);
            return;
        }

        // after uploading file, creating the model
        const store = (this.$store as Store<IAdminStoreState>);
        (async () => {

            const postParam: ITemplatePostParam = {
                name: this.formDatas.name as string,
                note: this.formDatas.note as string,
                templateFileId: this.filePostParam.entryId as string,
            };
            const apiResult: IAPIResult = await store.dispatch(
                StoreActionNames.createUser, { data: postParam } as IStoreActionArgs);
            if (apiResult != null && apiResult.code === ApiResultCode.Success) {
                this.$message({
                    message: '模板创建成功',
                    type: 'success',
                });
            } else {
                this.$message({
                    message: `提交失败（失败代码:${apiResult.code}）`,
                    type: 'error',
                });
            }
        })().catch((ex) => {
            this.$message({
                message: '提交失败',
                type: 'error',
            });
        }).finally(() => {
            this.submitting = false;
        });
    }
    private onTemplateFileError(err: Error, file: { raw: File }, fileList: Array<{ raw: File }>) {
        this.$message.error('上传模板文档失败，请查看网络是否正常');
        LoggerManager.error('template upload error', err);
    }
    // #endregion

}
