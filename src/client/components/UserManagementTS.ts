import { Component, Vue } from 'vue-property-decorator';
import { UserView } from 'common/responseResults/UserView';
import { LoggerManager } from 'client/LoggerManager';
import { Store } from 'vuex';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { APIResult } from 'common/responseResults/APIResult';
import { IStoreActionArgs } from 'client/VuexOperations/IStoreActionArgs';
import { StoreActionNames } from 'client/VuexOperations/StoreActionNames';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';

const compToBeRegistered: any = {

};

@Component({
    components: compToBeRegistered,
})
export class UserManagementTS extends Vue {
    // #region -- referred props and methods by this component
    private search: string = ''; // used for table search
    private userObjs: UserView[] = []; // used as the table data
    // #endregion

    // #region -- vue life-circle methods
    private mounted(): void {
        (async () => {
            this.$$pullUserObjs();

        })().catch((ex) => {
            this.$message.error('链接服务器失败，请检查网络连接是否正常');
            LoggerManager.error(ex);
        });
    }
    // #endregion

    // #region -- internal variables and methods
    private readonly store = (this.$store as Store<IStoreState>);
    private async $$pullUserObjs(): Promise<void> {
        const result: APIResult = await this.store.dispatch(
            StoreActionNames.userQuery, { data: {} } as IStoreActionArgs);
        if (result.code === ApiResultCode.Success) {
            this.userObjs = result.data;
        } else {
            this.$message.error(`获取用户信息失败，失败代码${result.code}`);
        }
    }
    // #endregion
}
