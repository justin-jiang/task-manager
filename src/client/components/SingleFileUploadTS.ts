import { msgConnectionIssue } from 'client/common/Constants';
import { LoggerManager } from 'client/LoggerManager';
import { CommonUtils } from 'common/CommonUtils';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { HttpPathItem } from 'common/HttpPathItem';
import { HttpUploadKey } from 'common/HttpUploadKey';
import { FileUploadParam } from 'common/requestParams/FileUploadParam';
import { ApiResult } from 'common/responseResults/APIResult';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { ApiErrorHandler } from 'client/common/ApiErrorHandler';
import { EventNames } from 'client/common/EventNames';

const compToBeRegistered: any = {
};

export interface ISingleFileUploadTS {
    reset(): void;
    submit(): void;
    isChanged(): boolean;
}

@Component({
    components: compToBeRegistered,
})
export class SingleFileUploadTS extends Vue implements ISingleFileUploadTS {
    // #region -- component props and methods
    @Prop() public filePostParamProp!: FileUploadParam;

    // the submit button text
    @Prop() public buttonTextProp!: string;

    @Prop() public fileTypesProp!: string[];
    @Prop() public fileSizeMProp!: number;

    @Prop() public hideSubmitButtonProp!: boolean;

    public reset(): void {
        (this.$refs[this.uploaderRefName] as any).clearFiles();
        this.fileList = [];
        this.$emit(EventNames.Reset);
    }

    public submit(): void {
        this.onSubmit();
    }
    public isChanged(): boolean {
        return this.fileList.length !== 0;
    }
    // #endregion

    // #region -- referred props and methods for uploader
    private readonly uploaderRefName = 'fileUploader';
    private readonly uploadAPIURL = `${HttpPathItem.Api}/${HttpPathItem.File}`;
    private readonly countLimit = 1;
    private readonly keyNameOfuploadedFile: string = HttpUploadKey.File;

    // defaut button text which will be overridden by buttonTextProp if it is not null
    private buttonDefaultText: string = '点击上传';
    private acceptFileTypes: string = '';
    private fileList: Array<{ raw: File }> = [];

    private isSubmitting: boolean = false;

    // used by el-uploader to upload the data with file together
    // which is used to create correponding DB object if required
    private fileUploadParam: FileUploadParam = {
        scenario: FileAPIScenario.None,
        optionData: '',
    } as FileUploadParam;
    private get uploadTip(): string {
        let fileTypes: string = '不限';
        let fileSizeLimit: string = '不限';
        if (this.fileTypesProp != null && this.fileTypesProp.length > 0) {
            const readableTypes: string[] = [];
            this.fileTypesProp.forEach((type) => {
                if (/^\w+\/[-\w]+$/i.test(type)) {
                    readableTypes.push(type.split('\/')[1]);
                }
            });
            fileTypes = readableTypes.join(',');
        }
        if (this.fileSizeMProp != null) {
            fileSizeLimit = `${this.fileSizeMProp} MB`;
        }
        return `可上传文件类型：${fileTypes}，可上传文件最大值：${fileSizeLimit}`;
    }

    private get isReadyToSubmit(): boolean {
        return !this.isSubmitting && this.fileList.length > 0;
    }
    private get buttonText(): string {
        return this.buttonTextProp != null ? this.buttonTextProp : this.buttonDefaultText;
    }
    private get hideSubmitButton(): boolean {
        return this.hideSubmitButtonProp === true;
    }
    private beforeUpload(file: File): boolean {
        let isTypeMatched: boolean = true;
        let isSizeMatched: boolean = true;
        if (this.fileTypesProp != null) {
            isTypeMatched = this.fileTypesProp.includes(file.type);
        }
        if (this.fileSizeMProp != null) {
            isSizeMatched = file.size < this.fileSizeMProp * 1024 * 1024;
        }
        if (!isTypeMatched) {
            this.$message.error(`上传头像图片只能是 ${this.fileTypesProp} 格式，实际格式：${file.type}`);
        }
        if (!isSizeMatched) {
            this.$message.error(`上传头像图片大小不能超过 ${this.fileSizeMProp} MB.`);
        }
        if (!(isTypeMatched && isSizeMatched)) {
            this.reset();
        }
        return isTypeMatched && isSizeMatched;
    }

    private onSubmit() {
        this.isSubmitting = true;
        if (this.fileList.length === 0) {
            this.$message.warning('请先选择文件');
            return;
        }
        Object.assign(this.fileUploadParam, this.filePostParamProp);
        if (this.fileUploadParam.optionData instanceof Object) {
            this.fileUploadParam.optionData = JSON.stringify(this.fileUploadParam.optionData);
        }
        (this.$refs[this.uploaderRefName] as any).submit();
    }

    private onFileChange(file: { raw: File }, fileList: Array<{ raw: File }>) {
        this.fileList = fileList;
        this.$emit(EventNames.Change);
    }

    private onFileRemove(file: { raw: File }, fileList: Array<{ raw: File }>) {
        this.fileList = fileList;
        this.$emit(EventNames.Change);
    }

    private onFileCountExceed(files: { raw: File }, fileList: Array<{ raw: File }>) {
        this.$message.warning(`每次只能上传一个文件`);
    }
    private onFileUploadDone(apiResult: ApiResult, file: { raw: File }, fileList: Array<{ raw: File }>) {
        this.isSubmitting = false;
        if (apiResult.code === ApiResultCode.Success) {
            this.$emit(EventNames.Success, apiResult);
        } else {
            this.$message.error(`提交失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
            this.$emit(EventNames.Failure);
        }
        this.reset();
    }
    private onFileUploadError(err: Error, file: { raw: File }, fileList: Array<{ raw: File }>) {
        this.$message.error(msgConnectionIssue);
        LoggerManager.error('Error:', err);
        this.$emit(EventNames.Failure);
    }
    // #endregion

    // #region -- vue life-circle methods
    private mounted(): void {
        if (this.fileTypesProp != null && this.fileTypesProp.length > 0) {
            this.acceptFileTypes = this.fileTypesProp.join(',');
        }
    }
    // #endregion
}
