import { IStoreState } from 'client/VuexOperations/IStoreState';
import { CheckState } from 'common/CheckState';
import { CommonUtils } from 'common/CommonUtils';
import { UserType } from 'common/UserTypes';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Store } from 'vuex';
import { GeneralAuditParam } from 'common/requestParams/GeneralAuditParam';
enum EventNames {
    submitted = 'submitted',
    cancelled = 'cancelled',

}
const compToBeRegistered: any = {
};

@Component({
    components: compToBeRegistered,
})
export class AuditDialogTS extends Vue {
    // #region -- component props and methods
    @Prop() public titleProp!: string;
    @Prop() public visibleProp!: string;
    @Prop() public widthProp!: string;
    // #endregion

    // #region -- refered by this Vue Template
    private readonly switchActiveValue: CheckState = CheckState.Checked;
    private readonly switchInactiveValue: CheckState = CheckState.FailedToCheck;
    private auditState: CheckState = this.switchActiveValue;
    private auditNote: string = '';
    private get isResultAuditDenied(): boolean {
        return this.auditState === CheckState.FailedToCheck;
    }

    private get width(): string {
        return CommonUtils.isNullOrEmpty(this.widthProp) ? '30%' : this.widthProp;
    }
    private get isReadySubmit(): boolean {
        return this.auditState === CheckState.Checked ||
            (this.auditState === CheckState.FailedToCheck && !CommonUtils.isNullOrEmpty(this.auditNote));
    }
    private onSubmitted(): void {
        this.$emit(EventNames.submitted,
            { note: this.auditNote, state: this.auditState } as GeneralAuditParam);
    }
    private onCancelled(): void {
        this.$emit(EventNames.cancelled);
    }
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
