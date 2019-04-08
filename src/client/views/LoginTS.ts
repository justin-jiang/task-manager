import { ApiErrorHandler } from 'client/common/ApiErrorHandler';
import { RouterUtils } from 'client/common/RouterUtils';
import { ComponentUtils } from 'client/components/ComponentUtils';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { StoreActionNames } from 'client/VuexOperations/StoreActionNames';
import { StoreMutationNames } from 'client/VuexOperations/StoreMutationNames';
import { CommonUtils } from 'common/CommonUtils';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { FileDownloadParam } from 'common/requestParams/FileDownloadParam';
import { SessionCreateParam } from 'common/requestParams/SessionCreateParam';
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
        const confirm = this.$confirm(
            `忘记密码，请用账户注册邮箱，向public@khoodys.com发送邮件，申请重置密码，平台运营会在一个工作日内处理并邮件回复。`,
            '提示', {
                confirmButtonText: '复制邮箱地址到剪切板',
                cancelButtonText: '关闭',
                type: 'warning',
                center: true,
                closeOnClickModal: false,
            });
        confirm.then(() => {
            ComponentUtils.copyEmailAddressToClipboard('public@khoodys.com');
            this.$message.success('复制成功');
        }).catch(() => { });
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
