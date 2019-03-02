import { Component, Vue } from 'vue-property-decorator';
import { Store } from 'vuex';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { CommonUtils } from 'common/CommonUtils';
import { RouterUtils } from 'client/common/RouterUtils';

const compToBeRegistered: any = {
};

@Component({
    components: compToBeRegistered,
})
export class ErrorTS extends Vue {
    private errorMessage(): string {
        if (!CommonUtils.isNullOrEmpty(this.storeState.errorMessage)) {
            return this.storeState.errorMessage;
        } else {
            return '服务出错了！';
        }
    }

    private onImageClick(): void {
        RouterUtils.goToUserHomePage(this.$router, this.storeState.sessionInfo);
    }

    // #region Vue life-circle method
    private mounted(): void {
    }
    // #endregion
    // region -- internal props and methods
    private readonly store = (this.$store as Store<IStoreState>);
    private readonly storeState = (this.$store.state as IStoreState);

    // #endregion

}
