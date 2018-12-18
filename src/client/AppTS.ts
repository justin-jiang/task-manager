import { ApiResultCode } from '@/common/responseResults/ApiResultCode';
import { IAPIResult } from '@/common/responseResults/IAPIResult';
import { Component, Vue } from 'vue-property-decorator';
import { Store } from 'vuex';
import { IStoreActionArgs } from '@/client/VuexOperations/IStoreActionArgs';
import { IAdminStoreState } from '@/client/VuexOperations/IStoreState';
import { StoreActionNames } from '@/client/VuexOperations/StoreActionNames';
import { LoggerManager } from './LoggerManager';

const compToBeRegistered: any = {
};

@Component({
    components: compToBeRegistered,
})
export class AppTS extends Vue {
    // #region -- vue life-circle events
    private mounted(): void {
        const store = (this.$store as Store<IAdminStoreState>);
        (async () => {

            const apiResult: IAPIResult = await store.dispatch(
                StoreActionNames.createUser, { data: null } as IStoreActionArgs);
            if (apiResult != null && apiResult.code === ApiResultCode.Success) {
                this.$message.success('管理员注册成功');

            } else {
                const errStr: string = `注册失败（失败代码:${apiResult.code}）`;
                this.$message.error(errStr);
                LoggerManager.error(errStr);
            }
        })().catch((ex) => {
            this.$message.error('注册失败');
        }).finally(() => {
        });
    }
    // #endregion
}
