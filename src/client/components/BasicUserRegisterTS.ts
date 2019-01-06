import { InputValidator } from 'client/common/InputValidator';
import LogoUploaderVue from 'client/components/LogoUploaderVue.vue';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { FileUploadParam } from 'common/requestParams/FileUploadParam';
import { UserCreateParam } from 'common/requestParams/UserCreateParam';
import { APIResult } from 'common/responseResults/APIResult';
import { UserRole } from 'common/UserRole';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { ILogoUploaderTS } from './LogoUploaderTS';
interface IFormData {
    name?: string;
    password?: string;
    confirmPassword?: string;
    email?: string;
    telephone?: string;
}
enum EventNames {
    RegisterSuccess = 'success',
}

const compToBeRegistered: any = {
    LogoUploaderVue,
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

    // the model of form
    private readonly formDatas: IFormData = {
        name: '',
        password: '',
        confirmPassword: '',
        email: '',
        telephone: '',
    };

    private readonly fileUploadParam: FileUploadParam = {
        metadata: '',
        scenario: FileAPIScenario.UploadUser,
    } as FileUploadParam;

    private isCorpUser: boolean = true;
    private isSubmitting: boolean = false;
    private isLogoChanged: boolean = false;
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
            { validator: InputValidator.checkEmail, trigger: 'blur' },
        ],
        telephone: [
            { required: true, message: '请输入手机号码', trigger: 'blur' },
            { validator: InputValidator.checkTelephone, trigger: 'blur' },
        ],
    };

    private isAdmin(): boolean {
        return this.roleProp === UserRole.Admin;
    }

    private isReadyToSubmit(): boolean {
        return !this.isSubmitting && this.isLogoChanged;
    }
    /**
     *  upload logo image with new user info
     */
    private onSubmitForm() {
        this.isSubmitting = true;
        (this.$refs[this.formRefName] as any).validate((valid: boolean) => {
            let result: boolean = true;
            if (valid) {
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
                const metadataParam: UserCreateParam = {
                    name: this.formDatas.name as string,
                    password: this.formDatas.password as string,
                    email: this.formDatas.email as string,
                    telephone: this.formDatas.telephone as string,
                    roles: [finalUserRole],
                };
                // NOTE: to serialize the metadata, otherwize the el-upload will
                // invoke toString which cannot transfer the data to server correctly
                this.fileUploadParam.metadata = JSON.stringify(metadataParam);
                (this.$refs[this.uploaderRefName] as any).submit();
            } else {
                this.$message.warning('提交内容不合格，请检测表单是否填写正确');
                result = false;
                this.isSubmitting = false;
            }
            return result;
        });
    }
    private resetForm() {
        (this.$refs[this.formRefName] as any).resetFields();
    }

    private onLogoChanged(): void {
        this.isLogoChanged = true;
    }
    private onLogoUploadSuccess(apiResult: APIResult) {
        this.isSubmitting = false;
        this.isLogoChanged = false;
        this.$message.success('用户基本信息注册成功');
        this.resetForm();
        this.$emit(EventNames.RegisterSuccess);
    }
    private onLogoUploadFailure(apiResult: APIResult): void {
        this.isLogoChanged = false;
        this.isSubmitting = false;
    }
    // #endregion


    // #region -- vue life-circle methods
    private mounted(): void {
        this.fileUploadParam.scenario = FileAPIScenario.UploadUser;
        if (this.roleProp === UserRole.CorpExecutor ||
            this.roleProp === UserRole.CorpPublisher) {
            this.isCorpUser = true;
        } else {
            this.isCorpUser = false;
        }
    }
    // #endregion

    // #region -- inner props and methods
    private validateConfirmPassword(rule: any, value: string, callback: any) {
        if (value === '') {
            callback(new Error('请再次输入密码'));
        } else if (value !== this.formDatas.password) {
            callback(new Error('两次输入密码不一致!'));
        } else {
            callback();
        }
    }
    // #endregion
}
