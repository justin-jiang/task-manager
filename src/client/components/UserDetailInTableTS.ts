import { IStoreState } from 'client/VuexOperations/IStoreState';
import { CommonUtils } from 'common/CommonUtils';
import { UserView } from 'common/responseResults/UserView';
import { UserType } from 'common/UserTypes';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Store } from 'vuex';

const compToBeRegistered: any = {
};

@Component({
    components: compToBeRegistered,
})
export class UserDetailInTableTS extends Vue {
    // #region -- component props and methods
    @Prop() public dataProp!: UserView;
    // #endregion

    // #region -- props and methods refered by vue page
    private get userType(): string {
        return this.dataProp.type === UserType.Corp ? '企业' : '个人';
    }
    private get idTitle(): string {
        return this.dataProp.type === UserType.Corp ? '社会信用代码:' : '身份证:';
    }
    private get isCorp(): boolean {
        return this.dataProp.type === UserType.Corp;
    }
    private get area(): string {
        return `${this.dataProp.province} - ${this.dataProp.city} - ${this.dataProp.district}`;
    }
    private get timestampToText(): string {
        return CommonUtils.convertTimeStampToText(this.dataProp.createTime as number);
    }
    // #endregion

    // #region Vue life-circle method
    private mounted(): void {
        if (this.dataProp == null) {
            this.dataProp = {};
        }
    }
    // #endregion
    // region -- internal props and methods
    private readonly store = (this.$store as Store<IStoreState>);
    private readonly storeState = (this.$store.state as IStoreState);
    // #endregion

}
