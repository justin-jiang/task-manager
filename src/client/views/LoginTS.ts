import { SessionCreateParam } from 'common/requestParams/SessionCreateParam';
import { APIResult } from 'common/responseResults/APIResult';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { UserView } from 'common/responseResults/UserView';
import { Component, Vue } from 'vue-property-decorator';
import { Store } from 'vuex';
import { IStoreState } from '../VuexOperations/IStoreState';
import { StoreActionNames } from '../VuexOperations/StoreActionNames';
import { RouterUtils } from './RouterUtils';
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
    private submitting: boolean = false;

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
                this.submitting = true;
                const store = (this.$store as Store<IStoreState>);
                const storeState = store.state;
                (async () => {
                    const reqParam: SessionCreateParam = new SessionCreateParam(
                        this.formDatas.name as string,
                        this.formDatas.password as string);

                    const apiResult: APIResult = await store.dispatch(
                        StoreActionNames.sessionCreate, { data: reqParam });
                    if (apiResult.code === ApiResultCode.Success) {
                        if (storeState.redirectURLAfterLogin != null) {
                            window.location.assign(storeState.redirectURLAfterLogin);
                        } else {
                            RouterUtils.goToUserHomePage(this.$router,
                                (storeState.sessionInfo as UserView).roles);
                        }
                    } else if (apiResult.code === ApiResultCode.Unauthorized) {
                        this.$message.error('用户名或密码错误，请重新输入');
                        Vue.set(this.formDatas, 'password', undefined);
                    } else {
                        this.$message.error(`登录失败，错误代码：${apiResult.code}`);
                    }
                })().catch((ex) => {
                    this.$message({
                        message: '登录失败，请确认网络连接是否正常',
                        type: 'error',
                    });
                }).finally(() => {
                    this.submitting = false;
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
    private goToUserRegister() {
        RouterUtils.goToUserRegisterView(this.$router);
    }
    // #endregion

}
