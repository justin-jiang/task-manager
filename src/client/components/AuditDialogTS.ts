import { EventNames } from 'client/common/EventNames';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { CheckState } from 'common/CheckState';
import { CommonUtils } from 'common/CommonUtils';
import { GeneralAuditParam } from 'common/requestParams/GeneralAuditParam';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Store } from 'vuex';

export enum UsageScenario {
    NONE = 0,
    Fund = 1,
}

const compToBeRegistered: any = {
};

@Component({
    components: compToBeRegistered,
})
export class AuditDialogTS extends Vue {    // #region -- component props and methods
    @Prop() public titleProp!: string;
    @Prop() public visibleProp!: string;
    @Prop() public widthProp!: string;
    @Prop() public usageScenarioProp!: UsageScenario;
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
    private get isFundAudit(): boolean {
        return this.usageScenarioProp === UsageScenario.Fund;
    }
    private onSubmit(): void {
        this.$emit(EventNames.Submit,
            { note: this.auditNote, state: this.auditState } as GeneralAuditParam);
    }
    private onCancel(): void {
        this.$emit(EventNames.Cancel);
    }
    private onRefund(): void {
        this.$emit(EventNames.Refund);
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
