import { IStoreState } from 'client/VuexOperations/IStoreState';
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
    // #endregion

    // #region Vue life-circle method
    private mounted(): void {
    }
    // #endregion
    // region -- internal props and methods
    private readonly store = (this.$store as Store<IStoreState>);
    private readonly storeState = (this.$store.state as IStoreState);
    // #endregion

}
