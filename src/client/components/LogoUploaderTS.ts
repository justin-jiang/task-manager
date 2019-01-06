import { LoggerManager } from 'client/LoggerManager';
import { CommonUtils } from 'common/CommonUtils';
import { HttpPathItem } from 'common/HttpPathItem';
import { FileUploadParam } from 'common/requestParams/FileUploadParam';
import { APIResult } from 'common/responseResults/APIResult';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { msgConnectionIssue } from 'client/common/Constants';
import VueCropper from 'vue-cropperjs';
import { HttpUploadKey } from 'common/HttpUploadKey';
import { Store } from 'vuex';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { StoreActionNames } from 'client/VuexOperations/StoreActionNames';
import { FileDownloadParam } from 'common/requestParams/FileDownloadParam';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { IStoreActionArgs } from 'client/VuexOperations/IStoreActionArgs';
import { RouterUtils } from 'client/common/RouterUtils';
import { ApiErrorHandler } from 'client/common/ApiErrorHandler';

enum EventNames {
    LogoChanged = 'logoChanged',
    UploadSuccess = 'success',
    UploadFailure = 'failure',

}


const compToBeRegistered: any = {
    VueCropper,
};

export interface ILogoUploaderTS {
    reset(): void;
    submit(): void;
}

@Component({
    components: compToBeRegistered,
})
export class LogoUploaderTS extends Vue implements ILogoUploaderTS {
    // #region -- component props and methods
    @Prop() public filePostParamProp!: FileUploadParam | undefined;
    @Prop() public logoUidProp!: string | undefined;
    public reset(): void {
        (this.$refs[this.uploaderRefName] as any).clearFiles();
    }

    public submit() {
        this.isSubmitting = true;
        if (this.logoBlob == null) {
            this.$message.warning('请先选择头像');
            return;
        }
        Object.assign(this.uploadData, this.filePostParamProp);
        if (this.uploadData.metadata instanceof Object) {
            this.uploadData.metadata = JSON.stringify(this.uploadData.metadata);
        }

        (this.$refs[this.uploaderRefName] as any).submit();
    }

    // #endregion

    // #region -- referred props and methods for uploader
    private readonly uploaderRefName: string = 'fileUploader';
    private readonly cropperRefName: string = 'cropper';
    private readonly uploadAPIURL = `${HttpPathItem.API}/${HttpPathItem.FILE}`;
    private fileTypes: string[] = ['image/jpeg', 'image/png'];
    private fileSizeM: number = 5;
    private readonly countLimit = 1;
    private fileList: File[] = [];

    private isSubmitting: boolean = false;

    // used by el-uploader to upload the data with file together
    // which is used to create correponding DB object
    private uploadData: FileUploadParam = new FileUploadParam();

    private readonly keyNameOfuploadedFile: string = HttpUploadKey.File;
    private logoUrlForUploader: string = '';
    private logoUrlForCropper: string = '';
    private logoBlob: Blob | undefined;
    private cropDialogVisible: boolean = false;

    private isLogoURLReady(): boolean {
        return !CommonUtils.isNullOrEmpty(this.logoUrlForUploader);
    }

    private beforeUpload(file: File): boolean {
        let isTypeMatched: boolean = true;
        let isSizeMatched: boolean = true;
        if (this.fileTypes != null) {
            isTypeMatched = this.fileTypes.includes(file.type);
        }
        if (this.fileSizeM != null) {
            isSizeMatched = file.size < this.fileSizeM * 1024 * 1024;
        }
        if (!isTypeMatched) {
            this.$message.error(`上传头像图片只能是 ${this.fileTypes} 格式，实际格式：${file.type}`);
        }
        if (!isSizeMatched) {
            this.$message.error(`上传头像图片大小不能超过 ${this.fileSizeM} MB.`);
        }
        if (!(isTypeMatched && isSizeMatched)) {
            this.reset();
        }
        return isTypeMatched && isSizeMatched;
    }

    private onFileChange(file: { raw: File }, fileList: Array<{ raw: File }>) {
        if (fileList.length > 0) {
            this.logoUrlForCropper = URL.createObjectURL(file.raw);
            if ((this.$refs[this.cropperRefName] as any) != null) {
                (this.$refs[this.cropperRefName] as any).replace(this.logoUrlForCropper);
            }
            this.cropDialogVisible = true;
        }
    }
    private onFileCountExceed(files: { raw: File }, fileList: Array<{ raw: File }>) {
        this.$message.warning(`每次只能上传一个文件`);
    }

    private onLogoCropDone(): void {
        const newLogoURL = (this.$refs.cropper as any).getCroppedCanvas().toDataURL();
        const canvas: HTMLCanvasElement = (this.$refs.cropper as any).getCroppedCanvas();
        canvas.toBlob((blob: Blob) => {
            if (blob != null) {
                this.logoBlob = blob;
                this.logoUrlForUploader = newLogoURL;
                this.$emit(EventNames.LogoChanged);
            } else {
                this.$message.error('获取切图区域失败，请重试');
            }

            this.cropDialogVisible = false;
        });
    }
    private onLogoCropCancel(): void {
        this.logoBlob = undefined;
        this.cropDialogVisible = false;
    }
    private onFileUploadDone(apiResult: APIResult, file: { raw: File }, fileList: Array<{ raw: File }>) {
        if (apiResult.code === ApiResultCode.Success) {
            this.$emit(EventNames.UploadSuccess, apiResult);
        } else {
            if (apiResult.code === ApiResultCode.DbDuplicateKey) {
                this.$message.error(`所上传对象已存在，上传失败：${ApiErrorHandler.getTextByCode(apiResult.code)}`);
            } else {
                this.$message.error(`上传失败：${ApiErrorHandler.getTextByCode(apiResult.code)}`);
            }
            this.$emit(EventNames.UploadFailure, apiResult);
        }
        this.reset();
        this.isSubmitting = false;
    }
    private onFileUploadError(err: Error, file: { raw: File }, fileList: Array<{ raw: File }>) {
        this.reset();
        this.$message.error(msgConnectionIssue);
        LoggerManager.error('Error:', err);
        this.isSubmitting = false;
    }
    // #endregion

    // #region -- vue life-circle methods
    private mounted(): void {
        if (!CommonUtils.isNullOrEmpty(this.logoUidProp)) {
            (async () => {
                let apiResult: APIResult = await this.store.dispatch(
                    StoreActionNames.fileDownload,
                    {
                        data: {
                            fileId: this.logoUidProp,
                            scenario: FileAPIScenario.DownloadUserLogo,
                            version: 0,
                        } as FileDownloadParam,
                    } as IStoreActionArgs);
                if (apiResult.code !== ApiResultCode.Success) {
                    this.$message.error(`获取Logo失败：${ApiErrorHandler.getTextByCode(apiResult.code)}`);
                } else {
                    if (apiResult.data.type === 'application/json') {
                        const reader = new FileReader();
                        reader.onloadend = (e: ProgressEvent) => {
                            apiResult = JSON.parse((e.srcElement as any).result);
                            this.$message.error(`获取Logo失败：${ApiErrorHandler.getTextByCode(apiResult.code)}`);
                            LoggerManager.error((e.srcElement as any).result);
                        };
                        reader.readAsText(apiResult.data);
                    } else {
                        this.logoUrlForUploader = URL.createObjectURL(apiResult.data);
                    }
                }
            })().catch((ex) => {
                RouterUtils.goToErrorView(this.$router, this.storeState, msgConnectionIssue, ex);
            });
        }
    }
    // #endregion

    // #region -- internal variables and methods
    private readonly store = (this.$store as Store<IStoreState>);
    private readonly storeState = (this.$store.state as IStoreState);
    // #endregion
}
