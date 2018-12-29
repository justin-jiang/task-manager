import ExecutorRegisterVue from 'client/components/ExecutorRegisterVue.vue';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { CommonUtils } from 'common/CommonUtils';
import { UserRole } from 'common/UserRole';
import { Component, Vue } from 'vue-property-decorator';
import { Store } from 'vuex';
import { RouterUtils } from '../common/RouterUtils';
const compToBeRegistered: any = {
    ExecutorRegisterVue,
};

@Component({
    components: compToBeRegistered,
})
export class UserRegisterTS extends Vue {
    // #region -- referred props and methods by Vue Page
    private userRole: UserRole = UserRole.PersonalExecutor;

    // #endregion
    // #region -- vue life-circle methods
    private mounted(): void {
        if (CommonUtils.isNullOrEmpty(this.$route.query.role)) {
            RouterUtils.goToLoginView(this.$router);
            return;
        }
        this.userRole = Number.parseInt(this.$route.query.role as string, 10);
    }
    // #enderegion
    // region -- internal props and methods
    private readonly store = (this.$store as Store<IStoreState>);
    private readonly storeState = (this.$store.state as IStoreState);
    // #endregion
}
