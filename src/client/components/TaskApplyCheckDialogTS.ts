import { IStoreState } from 'client/VuexOperations/IStoreState';
import { CheckState } from 'common/CheckState';
import Viewer from 'viewerjs';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Store } from 'vuex';
import AvatarWithNameVue from 'client/components/AvatarWithNameVue.vue';
import { UserView } from 'common/responseResults/UserView';
import { EventNames } from 'client/common/EventNames';
import { TaskAuditParam } from 'common/requestParams/TaskAuditParam';
import { TaskState } from 'common/TaskState';
import { CommonUtils } from 'common/CommonUtils';

const compToBeRegistered: any = {
    AvatarWithNameVue,
};



@Component({
    components: compToBeRegistered,
})
export class TaskApplyCheckDialogTS extends Vue {
    // #region -- component props and methods
    @Prop() public visibleProp!: boolean;
    @Prop() public executorProp!: UserView;
    @Prop() public marginImageUrlProp!: string;


    // #endregion

    // #region -- references by the template
    private readonly radioLabelAssigned: TaskState = TaskState.Assigned;
    private readonly radioLabelQualificationDenied: TaskState = TaskState.ApplyQualificationAuditDenied;
    private readonly radioLabelMarginDenied: TaskState = TaskState.MarginAuditDenied;
    private readonly auditParam: TaskAuditParam = new TaskAuditParam(true);

    private imagePreviewer: Viewer | null = null;

    private previewedImageUrl: string = '';
    private get isReadyToSubmit(): boolean {
        return this.auditParam.state === this.radioLabelAssigned ||
            !CommonUtils.isNullOrEmpty(this.auditParam.note);
    }
    private get isAccepted(): boolean {
        return this.auditParam.state === TaskState.Assigned;
    }

    private onPreview(imageUrl: string): void {
        if (this.imagePreviewer != null) {
            this.imagePreviewer.destroy();
            this.imagePreviewer = null;
        }

        this.previewedImageUrl = imageUrl as string;
        const image = new Image();
        image.src = this.previewedImageUrl;

        this.imagePreviewer = new Viewer(image, {
            inline: false,
            movable: true,
            zoomable: true,
            scalable: false,
            zoomRatio: 0,
            minZoomRatio: 0.2,
            maxZoomRatio: 1,
            keyboard: false,
            zIndex: 10000,
            toolbar: {
                next: false,
                prev: false,
                play: false,
                rotateLeft: true,
                rotateRight: true,
                reset: true,
            },

        });
        this.imagePreviewer.show();
    }

    private onCancel(): void {
        this.$emit(EventNames.Cancel);
    }
    private onSubmit(): void {
        if (this.auditParam.state === this.radioLabelAssigned) {
            this.auditParam.auditState = CheckState.Checked;
        } else {
            this.auditParam.auditState = CheckState.FailedToCheck;
        }
        this.$emit(EventNames.Submit, this.auditParam);
    }
    // #endregion

    // #region -- vue life-circle methods
    private mounted(): void {
    }
    // #endregion

    // #region -- internal variables and methods
    private readonly store = (this.$store as Store<IStoreState>);
    private readonly storeState = (this.$store.state as IStoreState);
    @Watch('executorProp', { immediate: true })
    private onExecutorChanged(currentValue: UserView, previousValue: UserView) {
        this.auditParam.auditState = CheckState.Checked;
        this.auditParam.state = TaskState.Assigned;
        this.auditParam.note = '';
    }
    // #endregion
}
