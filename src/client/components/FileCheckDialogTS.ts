import { IStoreState } from 'client/VuexOperations/IStoreState';
import { CheckState } from 'common/CheckState';
import { CommonUtils } from 'common/CommonUtils';
import { FileCheckParam } from 'common/requestParams/FileCheckParam';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Store } from 'vuex';
import { EventNames } from 'client/common/EventNames';
export enum FileCheckScenario {
    None = 0,
    Qualification = 1,
    TaskResultAudit = 2,
    TaskResultCheck = 3,
}

const compToBeRegistered: any = {
};



@Component({
    components: compToBeRegistered,
})
/**
 * used to do all kinds of File Check or Audit
 */
export class FileCheckDialogTS extends Vue {
    // #region -- component props and methods
    @Prop() public titleProp!: string;
    @Prop() public visibleProp!: boolean;
    @Prop() public targetFileUidProp!: string;
    @Prop() public scenarioProp!: FileCheckScenario;
    // #endregion

    // #region -- referred props and methods by page template
    private readonly switchActiveValue: CheckState = CheckState.Checked;
    private readonly switchInactiveValue: CheckState = CheckState.FailedToCheck;

    private checkScenario: FileCheckScenario = FileCheckScenario.None;
    private checkNote: string = '';
    private checkState: CheckState = CheckState.Checked;
    private rateStar: number = 0;
    private rateScore: number = 0;

    private get isDenied(): boolean {
        return this.checkState === CheckState.FailedToCheck;
    }
    private get isReadySubmit(): boolean {
        return (this.checkState === CheckState.Checked && this.rateStar > 0) ||
            (this.checkState === CheckState.FailedToCheck && !CommonUtils.isNullOrEmpty(this.checkNote));
    }
    private get isQualificationCheck(): boolean {
        return this.checkScenario === FileCheckScenario.Qualification;
    }

    private get isTaskResultCheck(): boolean {
        return this.checkScenario === FileCheckScenario.TaskResultAudit ||
            this.checkScenario === FileCheckScenario.TaskResultCheck;
    }

    private onRateChange(rate: number): void {
        switch (rate) {
            case 0:
                this.rateScore = 0;
                break;
            case 1:
                this.rateScore = 20;
                break;
            case 2:
                this.rateScore = 40;
                break;
            case 3:
                this.rateScore = 60;
                break;
            case 4:
                this.rateScore = 80;
                break;
            case 5:
                this.rateScore = 100;
                break;
        }
    }

    private onSubmit(): void {
        if (this.checkState === CheckState.Checked) {
            this.$emit(EventNames.Submit, {
                state: CheckState.Checked,
                star: this.rateStar,
                score: this.rateScore,
            } as FileCheckParam);
        } else {
            this.$emit(EventNames.Submit, {
                state: CheckState.FailedToCheck,
                note: this.checkNote,
            } as FileCheckParam);
        }
    }
    private onCancel(): void {
        this.$emit(EventNames.Cancel);
    }
    private onDownload(): void {
        this.$emit(EventNames.Download);
    }
    // #endregion

    // #region -- vue life-circle methods
    private mounted(): void {
    }
    // #endregion

    // #region -- internal variables and methods
    private readonly store = (this.$store as Store<IStoreState>);
    private readonly storeState = (this.$store.state as IStoreState);
    @Watch('targetFileUidProp', { immediate: true })
    private onFileUidChanged(currentValue: string, previousValue: string) {
        this.checkState = CheckState.Checked;
        this.checkNote = '';
        this.rateStar = 0;
        this.rateScore = 0;
    }
    @Watch('scenarioProp', { immediate: true })
    private onScenarioChanged(currentValue: FileCheckScenario, previousValue: FileCheckScenario) {
        this.checkScenario = currentValue;
    }
    // #endregion
}
