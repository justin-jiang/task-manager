import { msgConnectionIssue } from 'client/common/Constants';
import { InputValidator } from 'client/common/InputValidator';
import { RouterUtils } from 'client/common/RouterUtils';
import { ILogoUploaderTS } from 'client/components/LogoUploaderTS';
import LogoUploaderVue from 'client/components/LogoUploaderVue.vue';
import { IStoreActionArgs } from 'client/VuexOperations/IStoreActionArgs';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { StoreActionNames } from 'client/VuexOperations/StoreActionNames';
import { StoreMutationNames } from 'client/VuexOperations/StoreMutationNames';
import { CommonUtils } from 'common/CommonUtils';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { FileUploadParam } from 'common/requestParams/FileUploadParam';
import { UserBasicInfoEditParam } from 'common/requestParams/UserBasicInfoEditParam';
import { UserPasswordEditParam } from 'common/requestParams/UserPasswordEditParam';
import { APIResult } from 'common/responseResults/APIResult';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { UserRole } from 'common/UserRole';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Store } from 'vuex';
import { ApiErrorHandler } from 'client/common/ApiErrorHandler';
const compToBeRegistered: any = {
    LogoUploaderVue,
};
interface IBasicInfoFormDatas {
    name?: string;
    nickName?: string;
    email?: string;
    telephone?: string;
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
    private readonly basicInfoCollapseName: string = 'basicInfoCollapse';
    private readonly logoCollapseName: string = 'logoCollapse';
    private readonly passwordCollapseName: string = 'passwordCollapse';
    private isSubmitting: boolean = false;
    // #endregion

    // #region -- referred props and methods by basic info update
    private readonly basicInfoFormRefName: string = 'basicInfoForm';
    private readonly basicInfoFormRules: any = {
        name: [
            { required: true, message: '请输入账号名称', trigger: 'blur' },
            { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' },
        ],
        email: [
            { required: true, message: '请输入邮箱地址', trigger: 'blur' },
            { validator: InputValidator.checkEmail, trigger: 'blur' },
        ],
        telephone: [
            { required: true, message: '请输入电话号码', trigger: 'blur' },
            { validator: InputValidator.checkTelephone, trigger: 'blur' },
        ],
    };
    private basicInfoFormDatas: IBasicInfoFormDatas = {
        name: '',
        email: '',
        telephone: '',
        nickName: '',
    };
    private isBasicInfoChanged(): boolean {
        return this.basicInfoFormDatas.name !== this.storeState.sessionInfo.name ||
            this.basicInfoFormDatas.email !== this.storeState.sessionInfo.email ||
            this.basicInfoFormDatas.telephone !== this.storeState.sessionInfo.telephone ||
            this.basicInfoFormDatas.nickName !== this.storeState.sessionInfo.nickName;
    }
    private onBasicInfoSubmit(): void {
        (async () => {
            const updatedProps: UserBasicInfoEditParam = {};
            if (this.basicInfoFormDatas.email !== this.storeState.sessionInfo.email) {
                updatedProps.email = this.basicInfoFormDatas.email;
            }
            if (this.basicInfoFormDatas.name !== this.storeState.sessionInfo.name) {
                updatedProps.name = this.basicInfoFormDatas.name;
            }
            if (this.basicInfoFormDatas.nickName !== this.storeState.sessionInfo.nickName) {
                updatedProps.nickName = this.basicInfoFormDatas.nickName;
            }
            if (this.basicInfoFormDatas.telephone !== this.storeState.sessionInfo.telephone) {
                updatedProps.telephone = this.basicInfoFormDatas.telephone;
            }
            const apiResult: APIResult = await this.store.dispatch(
                StoreActionNames.userBasicInfoEdit,
                {
                    data: updatedProps,
                } as IStoreActionArgs);

            if (apiResult.code === ApiResultCode.Success) {
                this.$message.success('用户基础信息更新成功');
                this.store.commit(StoreMutationNames.sessionInfoUpdate, apiResult.data);
                this.basicInfoFormDatas = apiResult.data;
            } else {
                this.$message.error(`用户基础信息更新失败：${ApiErrorHandler.getTextByCode(apiResult.code)}`);
            }

        })().catch((ex) => {
            RouterUtils.goToErrorView(this.$router, this.storeState, msgConnectionIssue, ex);
        });
    }
    // #endregion

    // #region -- referred props and methods by logo uploader
    private readonly uploaderRefName: string = 'logoUploader';

    private fileUploadParam: FileUploadParam = {};
    private isLogoChanged: boolean = false;
    private getLogoUid(): string {
        if (this.storeState.sessionInfo != null) {
            return this.storeState.sessionInfo.logoId as string;
        } else {
            return '';
        }
    }
    private isReadyToSubmit(): boolean {
        return this.isLogoChanged && !this.isSubmitting;
    }
    private onLogoSubmit(): void {
        this.isSubmitting = true;
        (this.$refs[this.uploaderRefName] as any as ILogoUploaderTS).submit();
    }
    private onLogoChanged(): void {
        this.isSubmitting = false;
        this.isLogoChanged = true;
    }
    private onLogoUploadSuccess(apiResult: APIResult): void {
        this.isLogoChanged = false;
        this.isSubmitting = false;
        this.$message.success('头像上传成功');
    }
    private onLogoUploadFailure(apiResult: APIResult): void {
        this.isLogoChanged = false;
        this.isSubmitting = false;
    }
    // #endregion

    // #region -- referred props and methods password change 
    private readonly passwordFormRefName: string = 'passwordForm';
    private readonly passwordFormRules: any = {
        password: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { validator: InputValidator.passwordCheck, trigger: 'blur' },
        ],

        confirmPassword: [
            { required: true, message: '请再次输入密码', trigger: 'blur' },
            { validator: this.validateConfirmPassword, trigger: 'blur' },
        ],
    }
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
            const apiResult: APIResult = await this.store.dispatch(
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
                this.$message.error(`密码修改失败：${ApiErrorHandler.getTextByCode(apiResult.code)}`);
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
        this.fileUploadParam.scenario = FileAPIScenario.UpdateUserLogo;
        this.basicInfoFormDatas = Object.assign({}, this.storeState.sessionInfo);
        this.activeCollapseNames.push(this.basicInfoCollapseName);
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
