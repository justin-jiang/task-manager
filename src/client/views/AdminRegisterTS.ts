import { RouterUtils } from 'client/common/RouterUtils';
import BasicUserRegisterVue from 'client/components/BasicUserRegisterVue.vue';
import { UserRole } from 'common/UserRole';
import { Component, Vue } from 'vue-property-decorator';
import { Store } from 'vuex';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import store from 'client/store';
import { UserView } from 'common/responseResults/UserView';
import { StoreMutationNames } from 'client/VuexOperations/StoreMutationNames';
const compToBeRegistered: any = {
    BasicUserRegisterVue,
};

@Component({
    components: compToBeRegistered,
})
export class AdminRegisterTS extends Vue {
    // #region -- referred props and methods by Vue Page
    private userRole: UserRole = UserRole.Admin;
    private registerTitle: string = '管理员注册';

    private onSuccess(admin: UserView): void {
        store.commit(StoreMutationNames.sessionInfoUpdate, admin);
        RouterUtils.goToAdminView(this.$router);
    }
    // #endregion
    // region -- internal props and methods
    private readonly store = (this.$store as Store<IStoreState>);
    private readonly storeState = (this.$store.state as IStoreState);
    // #endregion
}
