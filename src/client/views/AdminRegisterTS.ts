import { ApiErrorHandler } from 'client/common/ApiErrorHandler';
import { RouterUtils } from 'client/common/RouterUtils';
import BasicUserRegisterVue from 'client/components/BasicUserRegisterVue.vue';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { StoreMutationNames } from 'client/VuexOperations/StoreMutationNames';
import { ApiResult } from 'common/responseResults/APIResult';
import { UserView } from 'common/responseResults/UserView';
import { UserRole } from 'common/UserRole';
import { Component, Vue } from 'vue-property-decorator';
import { Store } from 'vuex';
const compToBeRegistered: any = {
    BasicUserRegisterVue,
};

@Component({
    components: compToBeRegistered,
})
export class AdminRegisterTS extends Vue {
    // #region -- referred props and methods by Vue Page
    private userRole: UserRole = UserRole.Admin;

    private onSuccess(admin: UserView): void {
        (async () => {
            this.store.commit(StoreMutationNames.sessionInfoUpdate, admin);
            this.$message.success('系统管理员注册成功');
            RouterUtils.goToAdminView(this.$router);
        })();
    }
    private onFailure(apiResult: ApiResult): void {
        this.$message.error(`注册失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
    }
    // #endregion
    // region -- internal props and methods
    private readonly store = (this.$store as Store<IStoreState>);
    private readonly storeState = (this.$store.state as IStoreState);
    // #endregion
}
