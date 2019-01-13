import { InputValidator } from 'client/common/InputValidator';
import SingleImageUploaderVue from 'client/components/SingleImageUploaderVue.vue';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { FileUploadParam } from 'common/requestParams/FileUploadParam';
import { UserCreateParam } from 'common/requestParams/UserCreateParam';
import { ApiResult } from 'common/responseResults/APIResult';
import { UserRole } from 'common/UserRole';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { ISingleImageUploaderTS } from './SingleImageUploaderTS';
import { UserType } from 'common/UserTypes';
import { Store } from 'vuex';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { CommonUtils } from 'common/CommonUtils';
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
    SingleImageUploaderVue,
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

    private get isNewUser(): boolean {
        return CommonUtils.isNullOrEmpty(this.storeState.sessionInfo.uid);
    }

    // the model of form
    private readonly formDatas: IFormData = {
        name: '',
        password: '',
        confirmPassword: '',
        email: '',
        telephone: '',
    };

    private readonly fileUploadParam: FileUploadParam = {
        optionData: '',
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

                // NOTE: to serialize the metadata, otherwize the el-upload will
                // invoke toString which cannot transfer the data to server correctly
                if (this.isNewUser) {
                    const metadataParam: UserCreateParam = {
                        name: this.formDatas.name as string,
                        password: this.formDatas.password as string,
                        email: this.formDatas.email as string,
                        telephone: this.formDatas.telephone as string,
                        roles: [finalUserRole],
                        type: this.isCorpUser ? UserType.Corp : UserType.Individual,
                    };
                    this.fileUploadParam.scenario = FileAPIScenario.UploadUser;
                    this.fileUploadParam.optionData = JSON.stringify(metadataParam);
                } else {
                    this.fileUploadParam.scenario = FileAPIScenario.UpdateUserLogo;
                }

                (this.$refs[this.uploaderRefName] as any as ISingleImageUploaderTS).submit();
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
        (this.$refs[this.uploaderRefName] as any as ISingleImageUploaderTS).reset();
    }

    private onLogoChanged(): void {
        this.isLogoChanged = true;
    }
    private onLogoUploadSuccess(apiResult: ApiResult) {
        this.$message.success('用户基本信息注册成功');
        this.$emit(EventNames.RegisterSuccess, apiResult.data);
        this.isSubmitting = false;
        this.isLogoChanged = false;
    }
    private onLogoUploadFailure(apiResult: ApiResult): void {
        this.isLogoChanged = false;
        this.isSubmitting = false;
    }
    // #endregion


    // #region -- vue life-circle methods
    private mounted(): void {
        if (this.roleProp === UserRole.CorpExecutor ||
            this.roleProp === UserRole.CorpPublisher) {
            this.isCorpUser = true;
        } else {
            this.isCorpUser = false;
        }
    }
    // #endregion

    // #region -- inner props and methods
    private readonly store = (this.$store as Store<IStoreState>);
    private readonly storeState = (this.$store.state as IStoreState);
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
