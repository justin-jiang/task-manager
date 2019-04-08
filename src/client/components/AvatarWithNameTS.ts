import { IStoreState } from 'client/VuexOperations/IStoreState';
import { CommonUtils } from 'common/CommonUtils';
import avatar from 'vue-avatar-component';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Store } from 'vuex';
const compToBeRegistered: any = {
    avatar,
};

@Component({
    components: compToBeRegistered,
})
export class AvatarWithNameTS extends Vue {
    // #region -- component props and methods
    @Prop() public nameProp!: string;
    @Prop() public logoUrlProp!: string;
    @Prop() public qualificationStarProp!: number;
    @Prop() public qualificationScoreProp!: number;
    // #endregion

    // #region -- refered by this Vue Template
    // copy of qualificationStarProp
    private qualificationStar: number = 0;
    private get qualificationScore(): number {
        return this.qualificationScoreProp as number;
    }

    private get isLogoUidReady(): boolean {
        return !CommonUtils.isNullOrEmpty(this.storeState.sessionInfo.logoUid);
    }
    private get hasQualificationInfo(): boolean {
        return this.qualificationStarProp != null && this.qualificationScoreProp != null;
    }
    // #endregion

    // #region Vue life-circle method
    private mounted(): void {
        this.qualificationStar = this.qualificationStarProp;
    }
    // #endregion
    // region -- internal props and methods
    private readonly store = (this.$store as Store<IStoreState>);
    private readonly storeState = (this.$store.state as IStoreState);

    // #endregion

}
