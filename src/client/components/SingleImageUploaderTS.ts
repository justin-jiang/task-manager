import { msgConnectionIssue } from 'client/common/Constants';
import { RouterUtils } from 'client/common/RouterUtils';
import { IStoreActionArgs } from 'client/VuexOperations/IStoreActionArgs';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { StoreActionNames } from 'client/VuexOperations/StoreActionNames';
import { CommonUtils } from 'common/CommonUtils';
import { LIMIT_LOGO_SIZE_M } from 'common/Config';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { HttpPathItem } from 'common/HttpPathItem';
import { HttpUploadKey } from 'common/HttpUploadKey';
import { FileUploadParam } from 'common/requestParams/FileUploadParam';
import { ApiResult } from 'common/responseResults/APIResult';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import VueCropper from 'vue-cropperjs';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Store } from 'vuex';
import { ComponentUtils } from './ComponentUtils';
import { LoggerManager } from 'client/LoggerManager';
import { EventNames } from 'client/common/EventNames';


const compToBeRegistered: any = {
    VueCropper,
};

export interface ISingleImageUploaderTS {
    reset(): void;
    submit(): void;
    isChanged(): boolean;
}

@Component({
    components: compToBeRegistered,
})
export class SingleImageUploaderTS extends Vue implements ISingleImageUploaderTS {
    // #region -- component props and methods
    @Prop() public filePostParamProp!: FileUploadParam;
    @Prop() public imageUidProp!: string;
    @Prop() public noCropProp!: boolean;
    public reset(): void {
        this.uploadData.blob = null;
        this.cropDialogVisible = false;
        (this.$refs[this.uploaderRefName] as any).clearFiles();
        this.getImageUrlByUid(this.imageUidProp);
        this.imageUrlForCropper = '';
        if ((this.$refs[this.cropperRefName] as any) != null) {
            (this.$refs[this.cropperRefName] as any).replace(this.imageUrlForCropper);
            (this.$refs[this.cropperRefName] as any).reset();
        }
        this.fileList = [];
        this.$emit(EventNames.Reset);
    }

    public submit() {
        this.isSubmitting = true;
        if (this.uploadData.blob == null) {
            this.$message.warning('请先选择头像');
            return;
        }
        Object.assign(this.uploadData, this.filePostParamProp);
        if (this.uploadData.optionData instanceof Object) {
            this.uploadData.optionData = JSON.stringify(this.uploadData.optionData);
        }
        (this.$refs[this.uploaderRefName] as any).submit();
    }
    public isChanged(): boolean {
        return this.fileList.length !== 0;
    }
    // #endregion

    // #region -- referred props and methods for uploader
    private readonly uploaderRefName: string = 'fileUploader';
    private readonly cropperRefName: string = 'cropper';
    private readonly uploadAPIURL = `${HttpPathItem.Api}/${HttpPathItem.File}`;
    private fileTypes: string[] = ['image/jpeg', 'image/png'];
    private fileSizeM: number = LIMIT_LOGO_SIZE_M;
    private fileList: Array<{ raw: File }> = [];
    private isSubmitting: boolean = false;

    // used by el-uploader to upload the data with file together
    // which is used to create correponding DB object
    private uploadData: FileUploadParam = new FileUploadParam();

    private readonly keyNameOfuploadedFile: string = HttpUploadKey.File;

    private imageUrlForCropper: string = '';
    private imageUrlForUploader: string = '';
    private imageType: string = '';
    private cropDialogVisible: boolean = false;
    private isCropping: boolean = false;

    private get isImageUrlReady(): boolean {
        return !CommonUtils.isNullOrEmpty(this.imageUrlForUploader);
    }
    private get limitTip(): string {
        return `上传图片格式：${this.fileTypes}，大小：小于${LIMIT_LOGO_SIZE_M} MB`;
    }

    private beforeUpload(): boolean {
        let isTypeMatched: boolean = true;
        let isSizeMatched: boolean = true;
        const fileType: string = (this.uploadData.blob as Blob).type;
        const fileSize: number = (this.uploadData.blob as Blob).size;
        if (this.fileTypes != null) {
            isTypeMatched = this.fileTypes.includes(fileType);
        }
        isSizeMatched = fileSize < LIMIT_LOGO_SIZE_M * 1024 * 1024;
        if (!(isTypeMatched && isSizeMatched)) {
            this.reset();
            const apiResult: ApiResult = new ApiResult();
            apiResult.code = !isSizeMatched ? ApiResultCode.InputImageTooLarge : ApiResultCode.InputImageInvalidType;
            this.onFileUploadDone(apiResult);
        }
        return isTypeMatched && isSizeMatched;
    }

    private onFileChange(file: { raw: File }, fileList: Array<{ raw: File }>): void {
        this.fileList = fileList;
        if (fileList.length > 0) {
            fileList.splice(0, fileList.length, file);
            if ((this.$refs[this.cropperRefName] as any) != null) {
                (this.$refs[this.cropperRefName] as any).replace(this.imageUrlForCropper);
            }
            if (this.noCropProp !== true) {
                this.imageUrlForCropper = URL.createObjectURL(file.raw);
                this.cropDialogVisible = true;
            } else {
                this.uploadData.blob = file.raw;
                this.imageUrlForUploader = URL.createObjectURL(file.raw);
            }
            this.imageType = file.raw.type;
            this.$emit(EventNames.Change);
        }
    }

    private onFileRemove(file: { raw: File }, fileList: Array<{ raw: File }>): void {
        this.fileList = fileList;
        this.getImageUrlByUid(this.imageUidProp);
        this.$emit(EventNames.Change);
    }

    /**
     * custom upload action will be trigger when invoking the submit
     */
    private uploadCroppedFile() {
        (async () => {
            const apiResult: ApiResult = await this.store.dispatch(
                StoreActionNames.fileUpload,
                {
                    data: this.uploadData,
                } as IStoreActionArgs);
            if ((this.$refs[this.uploaderRefName] as any) != null) {
                (this.$refs[this.uploaderRefName] as any).clearFiles();
            }
            this.onFileUploadDone(apiResult);
        })();
    }
    private onFileCountExceed(files: { raw: File }, fileList: Array<{ raw: File }>) {
        this.$message.warning(`每次只能上传一个文件`);
    }

    private onImageCropDone(): void {
        this.isCropping = true;
        const newImageURL = (this.$refs.cropper as any).getCroppedCanvas().toDataURL();
        const canvas: HTMLCanvasElement = (this.$refs.cropper as any).getCroppedCanvas();
        canvas.toBlob((blob: Blob) => {
            if (blob != null) {
                this.uploadData.blob = blob;
                this.imageUrlForUploader = newImageURL;
                this.$emit(EventNames.Change);
            } else {
                this.$message.error('获取切图区域失败，请重试');
            }

            this.cropDialogVisible = false;
            this.isCropping = false;
        }, this.imageType);
    }
    private onImageCropCancel(): void {
        this.reset();
    }
    private onFileUploadDone(apiResult: ApiResult) {
        if (apiResult.code === ApiResultCode.Success) {
            this.$emit(EventNames.Success, apiResult);
        } else {
            this.$emit(EventNames.Failure, apiResult);
        }
        this.isSubmitting = false;
    }
    // #endregion

    // #region -- vue life-circle methods
    private mounted(): void {
    }
    // #endregion

    // #region -- internal variables and methods
    private readonly store = (this.$store as Store<IStoreState>);
    private readonly storeState = (this.$store.state as IStoreState);

    @Watch('imageUidProp', { immediate: true })
    private onImageUidPropChanged(currentValue: string, previousValue: string) {
        this.getImageUrlByUid(currentValue);
    }
    private getImageUrlByUid(imageUid?: string): void {
        if (CommonUtils.isNullOrEmpty(imageUid)) {
            this.imageUrlForUploader = '';
        } else {
            (async () => {
                let scenario: FileAPIScenario = FileAPIScenario.None;
                switch (this.filePostParamProp.scenario) {
                    case FileAPIScenario.UploadUserBackId:
                        scenario = FileAPIScenario.DownloadBackId;
                        break;
                    case FileAPIScenario.UploadUserFrontId:
                        scenario = FileAPIScenario.DownloadFrontId;
                        break;
                    case FileAPIScenario.UploadAuthLetter:
                        scenario = FileAPIScenario.DownloadAuthLetter;
                        break;
                    case FileAPIScenario.UploadLicense:
                        scenario = FileAPIScenario.DownloadLicense;
                        break;
                    case FileAPIScenario.UploadLicenseWithPerson:
                        scenario = FileAPIScenario.DownloadLinceWithPerson;
                        break;
                    case FileAPIScenario.UploadUserLogo:
                        scenario = FileAPIScenario.DownloadUserLogo;
                        break;
                    default:
                        this.$message.error(`不支持指定的图片类型：${this.filePostParamProp.scenario}`);
                        LoggerManager.error(`Unsupport scenario:${this.filePostParamProp.scenario}`);
                        break;

                }
                if (scenario !== FileAPIScenario.None) {
                    this.imageUrlForUploader = await ComponentUtils.$$getImageUrl(
                        this, imageUid as string, scenario) || '';
                }
            })();
        }
    }
    // #endregion
}
