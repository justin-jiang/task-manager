import { LoggerManager } from 'client/LoggerManager';
import { InputValidator } from 'client/views/InputValidator';
import { LIMIT_LOGO_SIZE_M } from 'common/Config';
import { HttpPathItem } from 'common/HttpPathItem';
import { HttpUploadKey } from 'common/HttpUploadKey';
import { FileCreateParam } from 'common/requestParams/FileCreateParam';
import { UserCreateParam } from 'common/requestParams/UserCreateParam';
import { APIResult } from 'common/responseResults/APIResult';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { UserRole } from 'common/UserRole';
import VueCropper from 'vue-cropperjs';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { BasicUserRegisterFormData } from './BasicUserRegisterFormData';
import { FileAPIScenario } from 'common/FileAPIScenario';

enum EventNames {
    RegisterSuccess = 'success',
}

const compToBeRegistered: any = {
    VueCropper,
};

@Component({
    components: compToBeRegistered,
})
export class BasicUserRegisterTS extends Vue {
    // #region -- props of this component
    @Prop() public roleProp!: UserRole;
    // #endregion

    // #region -- referred props and methods by Vue Page
    private readonly formRefName: string = 'registerForm';
    private readonly uploaderRefName: string = 'logoUploader';
    private readonly keyNameOfuploadedFile: string = HttpUploadKey.File;
    // the model of form
    private readonly formDatas: BasicUserRegisterFormData = {
        name: 'test',
        password: '123456!',
        confirmPassword: '123456!',
        email: 'fdfdfd@ddfd.com',
    };

    private readonly filePostParam: FileCreateParam = new FileCreateParam();

    private isCorpUser: boolean = true;

    private isAdmin(): boolean {
        return this.roleProp === UserRole.Admin;
    }

    // logoUrl used to show log in client
    private logoUrl?: string = '';
    private cropDialogVisible: boolean = false;
    private isSubmitting: boolean = false;

    private readonly uploadURL = `${HttpPathItem.API}/${HttpPathItem.FILE}`;

    private readonly formRules: any = {
        name: [
            { required: true, message: '请输入账号名称', trigger: 'blur' },
            { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' },
        ],
        password: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { validator: InputValidator.passwordCheck, trigger: 'blur' },
        ],

        confirmPassword: [
            { required: true, message: '请再次输入密码', trigger: 'blur' },
            { validator: this.validateConfirmPassword, trigger: 'blur' },
        ],
        email: [
            { required: true, message: '请输入邮箱地址', trigger: 'blur' },
            { validator: this.checkEmail, trigger: 'blur' },
        ],
    };

    /**
     * 1, firstly upload logo image
     * 2, if step 1 succeeds, create the admin user
     */
    private onSubmitForm() {
        (this.$refs[this.formRefName] as any).validate((valid: boolean) => {
            if (this.formDatas.logoBlob == null) {
                this.$message.warning('请选择头像');
                return false;
            }
            if (valid) {
                this.isSubmitting = true;
                let finalUserRole: UserRole = this.roleProp;
                if (this.isCorpUser) {
                    if (finalUserRole === UserRole.PersonalExecutor) {
                        finalUserRole = UserRole.CorpExecutor;
                    } else if (finalUserRole === UserRole.PersonalPublisher) {
                        finalUserRole = UserRole.CorpPublisher;
                    }
                } else {
                    if (finalUserRole === UserRole.CorpExecutor) {
                        finalUserRole = UserRole.PersonalExecutor;
                    } else if (finalUserRole === UserRole.CorpPublisher) {
                        finalUserRole = UserRole.PersonalPublisher;
                    }
                }
                const userPostParam: UserCreateParam = {
                    name: this.formDatas.name as string,
                    password: this.formDatas.password as string,
                    email: this.formDatas.email as string,
                    telephone: this.formDatas.telephone as string,
                    roles: [this.roleProp],
                };
                this.filePostParam.metaData = JSON.stringify(userPostParam);
                (this.$refs[this.uploaderRefName] as any).submit();
                return true;
            } else {
                this.$message.warning('提交内容不合格，请检测表单是否填写正确');
                return false;
            }
        });
    }
    private resetForm() {
        this.cropDialogVisible = false;
        this.logoUrl = undefined;
        (this.$refs[this.formRefName] as any).resetFields();
        (this.$refs[this.uploaderRefName] as any).clearFiles();
    }
    private onLogoCropDone(): void {
        this.logoUrl = (this.$refs.cropper as any).getCroppedCanvas().toDataURL();
        const canvas: HTMLCanvasElement = (this.$refs.cropper as any).getCroppedCanvas();
        canvas.toBlob((blob: Blob) => {
            if (blob != null) {
                this.formDatas.logoBlob = blob;
            } else {
                this.$message.error('获取切图区域失败，请重试');
            }

            this.cropDialogVisible = false;
        });
    }
    private onLogoCropCancel(): void {
        this.logoUrl = undefined;
        this.formDatas.logoBlob = undefined;
        this.cropDialogVisible = false;
    }
    private onLogoChange(file: any, fileList: any) {
        if (fileList.length > 0) {
            this.logoUrl = URL.createObjectURL(file.raw);
            if (this.formDatas.logoBlob == null) {
                this.cropDialogVisible = true;
            }
        }

    }
    /**
     * check file size
     * @param file 
     */
    private beforeLogoUpload(file: File) {
        const isJPG = file.type === 'image/jpeg';
        const isLt2M = file.size / 1024 / 1024 < LIMIT_LOGO_SIZE_M;

        if (!isJPG) {
            this.$message.error('上传头像图片只能是 JPG 格式!');
        }
        if (!isLt2M) {
            this.$message.error('上传头像图片大小不能超过 2MB!');
        }
        return isJPG && isLt2M;
    }

    /**
     * upload done and then check the result
     * @param response 
     * @param file 
     * @param fileList 
     */
    private onLogoFileUploadDone(response: APIResult, file: { raw: File }, fileList: Array<{ raw: File }>) {
        this.isSubmitting = false;
        if (response.code !== ApiResultCode.Success) {
            this.$message.error(`注册失败，失败代码：${response.code}`);
            this.logoUrl = undefined;
            (this.$refs[this.uploaderRefName] as any).clearFiles();
            Vue.set(this.formDatas, 'logoBlob', undefined);
        } else {
            this.$emit(EventNames.RegisterSuccess);
        }
    }
    private onLogoFileUploadError(err: Error, file: { raw: File }, fileList: Array<{ raw: File }>) {
        this.isSubmitting = false;
        this.resetForm();
        this.$message.error('注册失败，请查看网络是否正常');
        LoggerManager.error('template upload error', err);
    }
    // #endregion

    // #region -- vue life-circle methods
    private mounted(): void {
        this.filePostParam.scenario = FileAPIScenario.CreateUser;
        if (this.roleProp === UserRole.CorpExecutor || this.roleProp === UserRole.CorpPublisher) {
            this.isCorpUser = true;
        } else {
            this.isCorpUser = false;
        }
    }
    // #endregion

    // #region -- private methods
    private validatePassword(rule: any, value: string, callback: any) {
        if (value === '') {
            callback(new Error('请输入密码'));
        } else {
            if (this.formDatas.confirmPassword != null && this.formDatas.confirmPassword !== '') {
                (this.$refs[this.formRefName] as any).validateField('confirmPassword');
            }
            callback();
        }
    }

    private validateConfirmPassword(rule: any, value: string, callback: any) {
        if (value === '') {
            callback(new Error('请再次输入密码'));
        } else if (value !== this.formDatas.password) {
            callback(new Error('两次输入密码不一致!'));
        } else {
            callback();
        }
    }

    private checkEmail(rule: any, value: string, callback: any) {
        if (!value) {
            return callback(new Error('电子邮箱不能为空'));
        } else {
            // tslint:disable-next-line:max-line-length
            const emailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (emailPattern.test(value)) {
                callback();
            } else {
                callback(new Error('电子邮箱格式不正确'));
            }
        }
    }
    private checkName(rule: any, value: string, callback: any) {
        if (!value) {
            return callback(new Error('账号名称不能为空'));
        } else {
            callback();
        }
    }
    // #endregion
}