import { ApiErrorHandler } from 'client/common/ApiErrorHandler';
import { InputValidator } from 'client/common/InputValidator';
import { IStoreActionArgs } from 'client/VuexOperations/IStoreActionArgs';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { StoreActionNames } from 'client/VuexOperations/StoreActionNames';
import { CommonUtils } from 'common/CommonUtils';
import { UserCreateParam } from 'common/requestParams/UserCreateParam';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { UserRole } from 'common/UserRole';
import { UserType } from 'common/UserTypes';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Store } from 'vuex';
import { EventNames } from 'client/common/EventNames';
interface IFormData {
    name?: string;
    password?: string;
    confirmPassword?: string;
    email?: string;
    telephone?: string;
    type: UserType;
}

const compToBeRegistered: any = {
};

@Component({
    components: compToBeRegistered,
})
export class BasicUserRegisterTS extends Vue {
    // #region -- props of this component
    @Prop() public roleProp!: UserRole;
    // #endregion

    // #region -- referred props and methods by the page template
    private readonly formRefName: string = 'registerForm';
    private readonly switchActiveValue: UserType = UserType.Corp;
    private readonly switchInactiveValue: UserType = UserType.Individual;

    // the binding data of form
    private readonly formDatas: IFormData = {
        name: '',
        password: '',
        confirmPassword: '',
        email: '',
        telephone: '',
        type: UserType.Corp,
    };

    private isSubmitting: boolean = false;

    private readonly formRules: any = {
        name: [
            { required: true, message: '请输入账号名称', trigger: 'blur' },
            { validator: InputValidator.checkAccountName, trigger: 'blur' },
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
        type: [
            { required: true, trigger: 'blur' },
        ],
    };

    private get isAdmin(): boolean {
        return this.roleProp === UserRole.Admin;
    }

    private get isReadyToSubmit(): boolean {
        return !this.isSubmitting;
    }

    /**
     *  create new user with account info
     */
    private onSubmitForm() {
        this.isSubmitting = true;
        (this.$refs[this.formRefName] as any).validate((valid: boolean) => {
            let result: boolean = true;
            if (valid) {
                let finalUserRole: UserRole = UserRole.CorpExecutor;
                if (this.roleProp === UserRole.Admin) {
                    finalUserRole = UserRole.Admin;
                } else if (CommonUtils.isPublisherRole([this.roleProp])) {
                    finalUserRole = this.roleProp;
                } else if (CommonUtils.isExecutorRole([this.roleProp])) {
                    finalUserRole = this.roleProp;
                }

                if (this.formDatas.type === UserType.Corp) {
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

                const reqParam: UserCreateParam = {
                    name: this.formDatas.name as string,
                    password: this.formDatas.password as string,
                    email: this.formDatas.email as string,
                    telephone: this.formDatas.telephone as string,
                    roles: [finalUserRole],
                    type: this.formDatas.type,
                };
                (async () => {
                    const apiResult = await this.store.dispatch(StoreActionNames.userCreate,
                        {
                            data: reqParam,
                        } as IStoreActionArgs);
                    if (apiResult.code !== ApiResultCode.Success) {
                        this.$message.error(`提交失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
                    } else {
                        this.$emit(EventNames.Success, apiResult.data);
                    }
                    this.isSubmitting = false;
                })();

            } else {
                this.$message.warning('表单中包含不合格的内容');
                result = false;
                this.isSubmitting = false;
            }
            return result;
        });
    }
    private resetForm() {
        (this.$refs[this.formRefName] as any).resetFields();
    }
    // #endregion


    // #region -- vue life-circle methods
    private mounted(): void {
        if (this.roleProp === UserRole.CorpExecutor ||
            this.roleProp === UserRole.CorpPublisher) {
            this.formDatas.type = UserType.Corp;
        } else {
            this.formDatas.type = UserType.Individual;
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
