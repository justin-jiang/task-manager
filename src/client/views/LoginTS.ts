import { RouterUtils } from 'client/common/RouterUtils';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { StoreActionNames } from 'client/VuexOperations/StoreActionNames';
import { SessionCreateParam } from 'common/requestParams/SessionCreateParam';
import { ApiResult } from 'common/responseResults/APIResult';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { UserView } from 'common/responseResults/UserView';
import { UserRole } from 'common/UserRole';
import { Component, Vue } from 'vue-property-decorator';
import { Store } from 'vuex';
import { ApiErrorHandler } from 'client/common/ApiErrorHandler';
import { CommonUtils } from 'common/CommonUtils';
import { ComponentUtils } from 'client/components/ComponentUtils';
import { StoreMutationNames } from 'client/VuexOperations/StoreMutationNames';
import { FileAPIScenario } from 'common/FileAPIScenario';
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
    private readonly formRefName = 'registerForm';
    private readonly formDatas: IFormData = {
        name: undefined,
        password: undefined,
    };
    private isSubmitting: boolean = false;

    private readonly formRules: any = {
        name: [
            { required: true, message: '请输入账号名称', trigger: 'blur' },
            { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' },
        ],
        password: [
            { required: true, message: '请输入密码', trigger: 'blur' },
        ],
    };
    private submitForm() {
        (this.$refs[this.formRefName] as any).validate((valid: boolean) => {
            if (valid) {
                this.isSubmitting = true;
                const store = (this.$store as Store<IStoreState>);
                const storeState = store.state;
                (async () => {
                    const reqParam: SessionCreateParam = {
                        name: this.formDatas.name,
                        password: this.formDatas.password,
                    } as SessionCreateParam;

                    const apiResult: ApiResult = await store.dispatch(
                        StoreActionNames.sessionCreate, { data: reqParam });
                    if (apiResult.code === ApiResultCode.Success) {
                        const user: UserView = apiResult.data;
                        user.logoUrl = await ComponentUtils.$$getImageUrl(
                            this, this.storeState.sessionInfo.logoUid as string, FileAPIScenario.DownloadUserLogo);
                        this.store.commit(StoreMutationNames.sessionInfoPropUpdate,
                            { logoUrl: user.logoUrl } as UserView);
                        if (!CommonUtils.isNullOrEmpty(storeState.redirectURLAfterLogin)) {
                            window.location.assign(storeState.redirectURLAfterLogin);
                        } else {
                            RouterUtils.goToUserHomePage(this.$router, (storeState.sessionInfo as UserView));
                        }
                    } else if (apiResult.code === ApiResultCode.AuthUnauthorized) {
                        this.$message.error('用户名或密码错误，请重新输入');
                        Vue.set(this.formDatas, 'password', undefined);
                    } else {
                        this.$message.error(`登录失败：${ApiErrorHandler.getTextByCode(apiResult.code)}`);
                    }
                })().catch((ex) => {
                    this.$message({
                        message: '登录失败，请确认网络连接是否正常',
                        type: 'error',
                    });
                }).finally(() => {
                    this.isSubmitting = false;
                });

            } else {
                this.$message({
                    message: '提交前，请检测表单是否填写正确',
                    type: 'warning',
                });
                return false;
            }
        });
    }
    private goToExecutorRegister(): void {
        RouterUtils.goToUserRegisterView(this.$router, UserRole.PersonalExecutor);
    }
    private goToPublisherRegister(): void {
        RouterUtils.goToUserRegisterView(this.$router, UserRole.PersonalPublisher);
    }
    // #endregion
    // #region internal prop and methods
    private readonly store = (this.$store as Store<IStoreState>);
    private readonly storeState = (this.$store.state as IStoreState);
    // #endregion
}
