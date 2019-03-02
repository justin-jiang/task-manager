import { ApiErrorHandler } from 'client/common/ApiErrorHandler';
import { msgConnectionIssue } from 'client/common/Constants';
import { InputValidator } from 'client/common/InputValidator';
import { RouterUtils } from 'client/common/RouterUtils';
import SingleImageUploaderVue from 'client/components/SingleImageUploaderVue.vue';
import UserIdentityInfoUploadVue from 'client/components/UserIdentityInfoUploadVue.vue';
import { IStoreActionArgs } from 'client/VuexOperations/IStoreActionArgs';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { StoreActionNames } from 'client/VuexOperations/StoreActionNames';
import { StoreMutationNames } from 'client/VuexOperations/StoreMutationNames';
import { CommonUtils } from 'common/CommonUtils';
import { UserAccountInfoEditParam } from 'common/requestParams/UserAccountInfoEditParam';
import { UserPasswordEditParam } from 'common/requestParams/UserPasswordEditParam';
import { ApiResult } from 'common/responseResults/APIResult';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { UserRole } from 'common/UserRole';
import { UserType } from 'common/UserTypes';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Store } from 'vuex';

const compToBeRegistered: any = {
    SingleImageUploaderVue,
    UserIdentityInfoUploadVue,
};
interface IAccountInfoFormDatas {
    name?: string;
    email?: string;
    telephone?: string;
    type?: UserType;
}

interface IPasswordFormDatas {
    oldPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
}

@Component({
    components: compToBeRegistered,
})
export class UserInfoTS extends Vue {
    // #region -- props of this component
    // temporary prop to share code with publisher register
    @Prop() public userRoleProp!: UserRole;
    // #endregion

    // #region -- referred props and methods by this component
    private readonly activeCollapseNames: string[] = [];
    private readonly accountInfoCollapseName: string = 'accountInfoCollapse';
    private readonly basicInfoCollapseName: string = 'basicInfoCollapse';
    private readonly passwordCollapseName: string = 'passwordCollapse';
    private isSubmitting: boolean = false;
    private qualificationStar: number = 0;
    private get qualificationScore(): number {
        return this.storeState.sessionInfo.qualificationScore as number;
    }
    // #endregion

    // #region -- referred props and methods by account info update
    private readonly accountInfoFormRefName: string = 'accountInfoForm';
    private readonly switchActiveValue: UserType = UserType.Corp;
    private readonly switchInactiveValue: UserType = UserType.Individual;
    private readonly accountInfoFormRules: any = {
        email: [
            { required: true, message: '请输入邮箱地址', trigger: 'blur' },
            { validator: InputValidator.checkEmail, trigger: 'blur' },
        ],
        telephone: [
            { required: true, message: '请输入电话号码', trigger: 'blur' },
            { validator: InputValidator.checkTelephone, trigger: 'blur' },
        ],
    };
    private accountInfoFormDatas: IAccountInfoFormDatas = {
        name: '',
        email: '',
        telephone: '',
        type: UserType.None,
    };
    private isAccountInfoChanged(): boolean {
        let isChanged: boolean = false;
        Object.keys(this.accountInfoFormDatas).forEach((item) => {
            if (this.storeState.sessionInfo[item] != null &&
                this.storeState.sessionInfo[item] !== (this.accountInfoFormDatas as any)[item]) {
                isChanged = true;
            }
        });
        return isChanged;
    }
    private onAccountInfoSubmit(): void {
        (async () => {
            const updatedProps: UserAccountInfoEditParam = {};
            Object.keys(this.accountInfoFormDatas).forEach((item) => {
                if (this.storeState.sessionInfo[item] != null &&
                    this.storeState.sessionInfo[item] !== (this.accountInfoFormDatas as any)[item]) {
                    (updatedProps as any)[item] = (this.accountInfoFormDatas as any)[item];
                }
            });
            const apiResult: ApiResult = await this.store.dispatch(
                StoreActionNames.userAccountInfoEdit,
                {
                    data: updatedProps,
                } as IStoreActionArgs);

            if (apiResult.code === ApiResultCode.Success) {
                this.$message.success('提交成功');
                this.store.commit(StoreMutationNames.sessionInfoPropUpdate, apiResult.data);
                this.accountInfoFormDatas = apiResult.data;
            } else {
                this.$message.error(`提交失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
            }
        })();
    }
    // #endregion

    // #region -- referred props and methods by i uploader

    private onIdUploadSuccess(apiResult: ApiResult): void {
        this.$message.success('提交成功');
    }

    // #endregion

    // #region -- referred props and methods password change 
    private readonly passwordFormRefName: string = 'passwordForm';
    private readonly passwordFormRules: any = {
        oldPassword: [
            { required: true, message: '请输入密码', trigger: 'blur' },
        ],
        newPassword: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { validator: InputValidator.passwordCheck, trigger: 'blur' },
        ],

        confirmPassword: [
            { required: true, message: '请再次输入密码', trigger: 'blur' },
            { validator: this.validateConfirmPassword, trigger: 'blur' },
        ],
    };
    private passwordFormDatas: IPasswordFormDatas = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    };
    private isPasswordEditReady(): boolean {
        return !CommonUtils.isNullOrEmpty(this.passwordFormDatas.oldPassword) && this.isSubmitting === false;
    }
    private onPasswordSubmit(): void {
        this.isSubmitting = true;
        (async () => {
            const apiResult: ApiResult = await this.store.dispatch(
                StoreActionNames.userPasswordEdit,
                {
                    data: {
                        oldPassword: this.passwordFormDatas.oldPassword,
                        newPassword: this.passwordFormDatas.newPassword,
                    } as UserPasswordEditParam,
                } as IStoreActionArgs);
            if (apiResult.code === ApiResultCode.Success) {
                this.$message.success('密码修改成功');
            } else {
                this.$message.error(`密码修改失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
            }
        })().catch((ex) => {
            RouterUtils.goToErrorView(this.$router, this.storeState, msgConnectionIssue, ex);
        }).finally(() => {
            (this.$refs[this.passwordFormRefName] as any).resetFields();
            this.isSubmitting = false;
        });
    }
    // #endregion

    // #region -- vue life-circle methods
    private mounted(): void {
        this.accountInfoFormDatas = Object.assign({}, this.storeState.sessionInfo);
        this.activeCollapseNames.push(this.accountInfoCollapseName);
        this.qualificationStar = this.storeState.sessionInfo.qualificationStar as number;
    }
    // #endregion

    // #region -- internal variables and methods
    private readonly store = (this.$store as Store<IStoreState>);
    private readonly storeState = (this.$store.state as IStoreState);
    private validateConfirmPassword(rule: any, value: string, callback: any) {
        if (value === '') {
            callback(new Error('请再次输入密码'));
        } else if (value !== this.passwordFormDatas.newPassword) {
            callback(new Error('两次输入密码不一致!'));
        } else {
            callback();
        }
    }
    // #endregion
}
