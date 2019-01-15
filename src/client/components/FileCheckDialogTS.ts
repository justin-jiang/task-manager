import { IStoreState } from 'client/VuexOperations/IStoreState';
import { UserCheckParam } from 'common/requestParams/UserCheckParam';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Store } from 'vuex';
import { CheckState } from 'common/CheckState';

enum EventNames {
    accepted = 'accepted',
    denied = 'denied',
    canceled = 'canceled',
    download = 'download',

}


const compToBeRegistered: any = {
};



@Component({
    components: compToBeRegistered,
})
export class FileCheckDialogTS extends Vue {
    // #region -- component props and methods
    @Prop() public titleProp!: string;
    @Prop() public visibleProp!: boolean;
    @Prop() public logoUrlProp!: string;
    // #endregion

    // #region -- referred props and methods for uploader
    private reasonOfDeny: string = '';
    private onCheckAccepted(): void {
        this.$emit(EventNames.accepted, { qualitificationState: CheckState.Checked } as UserCheckParam);
    }
    private onCheckDenied(): void {
        this.$emit(EventNames.denied, {
            qualitificationState: CheckState.FailedToCheck,
            noteForQualification: this.reasonOfDeny,
        } as UserCheckParam);
    }
    onCheckCanceled(): void {
        this.$emit(EventNames.canceled);
    }
    onDownload(): void {
        this.$emit(EventNames.download);
    }
    // #endregion

    // #region -- vue life-circle methods
    private mounted(): void {
    }
    // #endregion

    // #region -- internal variables and methods
    private readonly store = (this.$store as Store<IStoreState>);
    private readonly storeState = (this.$store.state as IStoreState);
    // #endregion
}
