import ExecutorRegisterVue from 'client/components/ExecutorRegisterVue.vue';
import { LoggerManager } from 'client/LoggerManager';
import { IStoreActionArgs } from 'client/VuexOperations/IStoreActionArgs';
import { StoreActionNames } from 'client/VuexOperations/StoreActionNames';
import { Component, Vue } from 'vue-property-decorator';
import { Store } from 'vuex';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { UserRole } from 'common/UserRole';
import { utils } from 'mocha';
import { RouterUtils } from './RouterUtils';
const compToBeRegistered: any = {
    ExecutorRegisterVue,
};

@Component({
    components: compToBeRegistered,
})
export class UserRegisterTS extends Vue {
    // #region -- referred props and methods by Vue Page
    private readonly executorRegisterTabName: string = 'executor';
    private readonly publisherRegisterTabName: string = 'publisher';

    private readonly personalPublisher: UserRole = UserRole.PersonalPublisher;
    private activeTabName: string = this.executorRegisterTabName;
    // #endregion
    // #region -- vue life-circle methods
    private mounted(): void {

        (async () => {
            if (this.storeState.sessionInfo == null) {
                // consider async load, the sub page might be accessed before App.TS done,
                // so if there is no sessionInfo in store, try to read it from server
                await this.store.dispatch(
                    StoreActionNames.sessionQuery, { data: null } as IStoreActionArgs);
            }
            if (this.storeState.sessionInfo != null) {
                if (this.isPublisher(this.storeState.sessionInfo.roles)) {
                    this.activeTabName = this.publisherRegisterTabName;
                } else if (this.isExecutor(this.storeState.sessionInfo.roles)) {
                    this.activeTabName = this.executorRegisterTabName;
                } else {
                    RouterUtils.goToUserHomePage(this.$router, this.storeState.sessionInfo.roles);
                }
            }
        })().catch((ex) => {
            this.$message.error('链接失败，请检查网络连接是否正常');
            LoggerManager.error(ex);
        });
    }
    // #enderegion
    // region -- internal props and methods
    private readonly store = (this.$store as Store<IStoreState>);
    private readonly storeState = (this.$store.state as IStoreState);
    private isPublisher(roles: UserRole[]): boolean {
        if (roles == null || roles.length === 0) {
            return false;
        }
        return roles.includes(UserRole.PersonalPublisher) || roles.includes(UserRole.CorpPublisher);
    }
    private isExecutor(roles: UserRole[]): boolean {
        if (roles == null || roles.length === 0) {
            return false;
        }
        return roles.includes(UserRole.PersonalExecutor) || roles.includes(UserRole.CorpExecutor);
    }
    // #endregion
}
