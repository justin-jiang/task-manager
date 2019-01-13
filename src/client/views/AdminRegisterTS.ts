import { msgConnectionIssue } from 'client/common/Constants';
import { RouterUtils } from 'client/common/RouterUtils';
import BasicUserRegisterVue from 'client/components/BasicUserRegisterVue.vue';
import { ComponentUtils } from 'client/components/ComponentUtils';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { StoreMutationNames } from 'client/VuexOperations/StoreMutationNames';
import { UserView } from 'common/responseResults/UserView';
import { UserRole } from 'common/UserRole';
import { Component, Vue } from 'vue-property-decorator';
import { Store } from 'vuex';
import { FileAPIScenario } from 'common/FileAPIScenario';
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
            admin.logoUrl = await ComponentUtils.$$getImageUrl(this, admin.logoUid as string, FileAPIScenario.DownloadUserLogo) || '';
            this.store.commit(StoreMutationNames.sessionInfoUpdate, admin);
            RouterUtils.goToAdminView(this.$router);
        })().catch((ex) => {
            RouterUtils.goToErrorView(this.$router, this.storeState, msgConnectionIssue, ex);
        });

    }
    // #endregion
    // region -- internal props and methods
    private readonly store = (this.$store as Store<IStoreState>);
    private readonly storeState = (this.$store.state as IStoreState);
    // #endregion
}
