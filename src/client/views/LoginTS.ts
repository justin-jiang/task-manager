import { ApiErrorHandler } from 'client/common/ApiErrorHandler';
import { RouterUtils } from 'client/common/RouterUtils';
import { ComponentUtils } from 'client/components/ComponentUtils';
import { IStoreActionArgs } from 'client/VuexOperations/IStoreActionArgs';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { StoreActionNames } from 'client/VuexOperations/StoreActionNames';
import { StoreMutationNames } from 'client/VuexOperations/StoreMutationNames';
import { CommonUtils } from 'common/CommonUtils';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { FileDownloadParam } from 'common/requestParams/FileDownloadParam';
import { SessionCreateParam } from 'common/requestParams/SessionCreateParam';
import { UserPasswordRecoverParam } from 'common/requestParams/UserPasswordRecoverParam';
import { ApiResult } from 'common/responseResults/APIResult';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { UserView } from 'common/responseResults/UserView';
import { UserRole } from 'common/UserRole';
import { Component, Vue } from 'vue-property-decorator';
import { Store } from 'vuex';
interface IFormData {
    name?: string;
    password?: string;
}

const compToBeRegistered: any = {
};

@Component({
    components: compToBeRegistered,
})
export class LoginTS extends Vue {
    // #region -- referred props and methods by Vue Page
    private isSubmitting: boolean = false;
    private isLogin: boolean = true;
    // #endregion

    //#region -- reference by login
    private readonly loginFormRefName = 'registerForm';
    private readonly loginFormDatas: IFormData = {
        name: '',
        password: '',
    };
    private readonly loginFormRules: any = {
        name: [
            { required: true, message: '请输入账号名称', trigger: 'change' },
            { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'change' },
        ],
        password: [
            { required: true, message: '请输入密码', trigger: 'change' },
        ],
    };
    private login() {
        (this.$refs[this.loginFormRefName] as any).validate((valid: boolean) => {
            if (valid) {
                this.isSubmitting = true;
                const store = (this.$store as Store<IStoreState>);
                const storeState = store.state;
                (async () => {
                    const reqParam: SessionCreateParam = {
                        name: this.loginFormDatas.name,
                        password: this.loginFormDatas.password,
                    } as SessionCreateParam;

                    const apiResult: ApiResult = await store.dispatch(
                        StoreActionNames.sessionCreate, { data: reqParam });
                    if (apiResult.code === ApiResultCode.Success) {
                        const user: UserView = apiResult.data;
                        if (!CommonUtils.isNullOrEmpty(user.logoUid)) {
                            user.logoUrl = await ComponentUtils.$$getImageUrl(
                                this, user.logoUid as string, FileAPIScenario.DownloadUserLogo);
                            this.store.commit(StoreMutationNames.sessionInfoPropUpdate,
                                { logoUrl: user.logoUrl } as UserView);
                        }
                        if (!CommonUtils.isNullOrEmpty(storeState.redirectURLAfterLogin)) {
                            window.location.assign(storeState.redirectURLAfterLogin);
                        } else {
                            RouterUtils.goToUserHomePage(this.$router, (storeState.sessionInfo as UserView));
                        }
                    } else if (apiResult.code === ApiResultCode.AuthUnauthorized) {
                        this.$message.error('用户名或密码错误，请重新输入');
                    } else {
                        this.$message.error(`登录失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
                    }
                })().finally(() => {
                    this.isSubmitting = false;
                });
            } else {
                this.$message({
                    message: '表单中包含不合格的内容',
                    type: 'warning',
                });
                return false;
            }
        });
    }
    private switchToRegister(): void {
        this.isLogin = false;
    }
    private resetPassword(): void {
        if (CommonUtils.isNullOrEmpty(this.loginFormDatas.name)) {
            this.$message.warning('请先输入账号，之后再点击忘记密码');
            return;
        }

        const confirm = this.$confirm(
            `此操作会发送密码重置的请求给平台管理员，确认要通知吗？`,
            '提示', {
                confirmButtonText: '确定',
                type: 'warning',
                center: true,
                closeOnClickModal: false,
            });
        confirm.then(() => {
            (async () => {
                this.isSubmitting = true;
                const store = (this.$store as Store<IStoreState>);
                const apiResult: ApiResult = await store.dispatch(
                    StoreActionNames.userPasswordRecover,
                    {
                        data: { name: this.loginFormDatas.name } as UserPasswordRecoverParam,
                    } as IStoreActionArgs);
                if (apiResult.code === ApiResultCode.Success) {
                    this.$message.success(`提交申请成功，等待密码重置，新密码会发送到您注册邮箱中`);
                } else {
                    this.$message.error(`提交失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
                }
            })().finally(() => {
                this.isSubmitting = false;
            });
        }).catch(() => {
            // do nothing for cancel
        });

    }
    //#endregion

    //#region -- reference by register
    private readonly LABEL_EXECUTOR: number = 0;
    private readonly LABEL_PUBLISHER: number = 1;
    private registerType: number = this.LABEL_PUBLISHER;
    private downloadProtocol(): void {
        ComponentUtils.downloadFile(this,
            {
                scenario: FileAPIScenario.DownloadRegisterProtocol,
            } as FileDownloadParam,
            'RegisterProtocol.zip');
    }
    private register(): void {
        if (this.registerType === this.LABEL_EXECUTOR) {
            this.goToExecutorRegister();
        } else {
            this.goToPublisherRegister();
        }
    }
    private switchToLogin(): void {
        this.isLogin = true;
    }
    //#endregion

    // #region internal prop and methods
    private readonly store = (this.$store as Store<IStoreState>);
    private readonly storeState = (this.$store.state as IStoreState);
    private goToExecutorRegister(): void {
        RouterUtils.goToUserRegisterView(this.$router, UserRole.PersonalExecutor);
    }
    private goToPublisherRegister(): void {
        RouterUtils.goToUserRegisterView(this.$router, UserRole.PersonalPublisher);
    }
    // #endregion
}
