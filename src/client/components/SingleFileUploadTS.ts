import { LoggerManager } from 'client/LoggerManager';
import { CommonUtils } from 'common/CommonUtils';
import { HttpPathItem } from 'common/HttpPathItem';
import { FileUploadParam } from 'common/requestParams/FileUploadParam';
import { APIResult } from 'common/responseResults/APIResult';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { msgConnectionIssue } from 'client/common/Constants';
enum EventNames {
    UploadSuccess = 'success',
}


const compToBeRegistered: any = {
};

export interface ISingleFileUploadTS {
    reset(): void;
}

@Component({
    components: compToBeRegistered,
})
export class SingleFileUploadTS extends Vue implements ISingleFileUploadTS {
    // #region -- component props and methods
    @Prop() public filePostParamProp!: FileUploadParam | undefined;

    // the submit button text
    @Prop() public buttonTextProp!: | undefined;

    @Prop() public fileTypesProp!: string[] | undefined;
    @Prop() public fileSizeMProp!: number;

    public reset(): void {
        (this.$refs[this.uploaderRefName] as any).clearFiles();
    }

    // #endregion

    // #region -- referred props and methods for uploader
    private readonly uploaderRefName = 'fileUploader';
    private readonly uploadAPIURL = `${HttpPathItem.API}/${HttpPathItem.FILE}`;

    // defaut button text which will be overridden by buttonTextProp if it is not null
    private buttonText: string = '点击上传';
    private readonly countLimit = 1;
    private fileList: File[] = [];

    private isSubmitting: boolean = false;

    private uploadTip(): string {
        let fileTypes: string = '不限';
        let fileSizeLimit: string = '不限';
        if (this.fileTypesProp != null && this.fileTypesProp.length > 0) {
            const readableTypes: string[] = [];
            this.fileTypesProp.forEach((type) => {
                if (/^\w+\/\w+$/i.test(type)) {
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

    // used by el-uploader to upload the data with file together
    // which is used to create correponding DB object
    private uploadData: FileUploadParam = new FileUploadParam();

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
            this.$message.error(`上传头像图片大小不能超过 ${this.fileSizeMProp} Bytes.`);
        }
        return isTypeMatched && isSizeMatched;
    }

    private onSubmit() {
        this.isSubmitting = true;
        if (this.fileList.length === 0) {
            this.$message.warning('请先选择文件');
            return;
        }
        Object.assign(this.uploadData, this.filePostParamProp);
        if (this.uploadData.metadata instanceof Object) {
            this.uploadData.metadata = JSON.stringify(this.uploadData.metadata);
        }

        (this.$refs[this.uploaderRefName] as any).submit();
    }

    private onFileChange(file: { raw: File }, fileList: Array<{ raw: File }>) {
        this.fileList = [];
        this.fileList.push(file.raw);
    }
    private onFileCountExceed(files: { raw: File }, fileList: Array<{ raw: File }>) {
        this.$message.warning(`每次只能上传一个文件`);
    }
    private onFileUploadDone(response: APIResult, file: { raw: File }, fileList: Array<{ raw: File }>) {
        this.isSubmitting = false;
        if (response.code === ApiResultCode.Success) {
            this.$emit(EventNames.UploadSuccess);
        } else {
            if (response.code === ApiResultCode.DB_DUPLICATE_KEY) {
                this.$message.error(`所上传对象已存在，上传失败，错误代码：${response.code}`);
            } else {
                this.$message.error(`上传失败，错误代码：${response.code}`);
            }
            (this.$refs[this.uploaderRefName] as any).clearFiles();
        }
    }
    private onFileUploadError(err: Error, file: { raw: File }, fileList: Array<{ raw: File }>) {
        this.$message.error(msgConnectionIssue);
        LoggerManager.error('Error:', err);
    }
    // #endregion

    // #region -- vue life-circle methods
    private mounted(): void {
        if (!CommonUtils.isNullOrEmpty(this.buttonTextProp)) {
            this.buttonText = this.buttonTextProp as any as string;
        }
    }
    // #endregion
}
