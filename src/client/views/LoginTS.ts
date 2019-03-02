import { ApiErrorHandler } from 'client/common/ApiErrorHandler';
import { RouterUtils } from 'client/common/RouterUtils';
import { ComponentUtils } from 'client/components/ComponentUtils';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { StoreActionNames } from 'client/VuexOperations/StoreActionNames';
import { StoreMutationNames } from 'client/VuexOperations/StoreMutationNames';
import { CommonUtils } from 'common/CommonUtils';
import { FileAPIScenario } from 'common/FileAPIScenario';
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
    private readonly formRefName = 'registerForm';
    private readonly formDatas: IFormData = {
        name: '',
        password: '',
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
