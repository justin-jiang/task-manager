import BasicUserRegisterVue from 'client/components/BasicUserRegisterVue.vue';
import { UserRole } from 'common/UserRole';
import { Component, Vue } from 'vue-property-decorator';
import { RouterUtils } from './RouterUtils';

const compToBeRegistered: any = {
    BasicUserRegisterVue,
};

@Component({
    components: compToBeRegistered,
})
export class AdminUserRegisterTS extends Vue {
    // #region -- referred props and methods by Vue Page
    private userRole: UserRole = UserRole.Admin;
    private registerTitle: string = '管理员注册';

    private onSuccess(): void {
        RouterUtils.goToAdminView(this.$router);
    }
    // #endregion
}
