import { msgConnectionIssue } from 'client/common/Constants';
import { RouterUtils } from 'client/common/RouterUtils';
import BasicUserRegisterVue from 'client/components/BasicUserRegisterVue.vue';
import SingleFileUploadVue from 'client/components/SingleFileUploadVue.vue';
import { LoggerManager } from 'client/LoggerManager';
import { IStoreActionArgs } from 'client/VuexOperations/IStoreActionArgs';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { StoreActionNames } from 'client/VuexOperations/StoreActionNames';
import { CommonUtils } from 'common/CommonUtils';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { FileUploadParam } from 'common/requestParams/FileUploadParam';
import { UserRole } from 'common/UserRole';
import { UserState } from 'common/UserState';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Store } from 'vuex';
import { UserView } from 'common/responseResults/UserView';

enum RegisterStep {
    NONE = 0,
    BasicInfo = 1,
    QualificationUpload = 2,
    QualificationChecking = 3,
    Done = 4,
}

const compToBeRegistered: any = {
    BasicUserRegisterVue,
    SingleFileUploadVue,
};

@Component({
    components: compToBeRegistered,
})
export class ExecutorRegisterTS extends Vue {
    // #region -- props of this component
    // temporary prop to share code with publisher register
    @Prop() public userRoleProp!: UserRole;
    // #endregion


    // #region -- referred props and methods for this page
    private currentStep: RegisterStep = RegisterStep.NONE;
    private title(): string {
        if (this.userRole === UserRole.CorpExecutor ||
            this.userRole === UserRole.PersonalExecutor) {
            return '执行人注册';
        } else {
            return '发布人注册';
        }
    }
    private isBasicUserRegister(): boolean {
        return this.currentStep === RegisterStep.BasicInfo;
    }
    private isQualificationUpload(): boolean {
        return this.currentStep === RegisterStep.QualificationUpload;
    }
    private isQualificationChecking(): boolean {
        return this.currentStep === RegisterStep.QualificationChecking;
    }
    private isDone() {
        return this.currentStep === RegisterStep.Done;
    }
    private onBasicUserSuccess(): void {
        this.currentStep = RegisterStep.QualificationUpload;
    }
    // #endregion

    // #region -- referred props and methods for basicUserRegister
    private userRole: UserRole = UserRole.PersonalExecutor;
    // #endregion

    // #region -- referred props and methods for qualification uploader
    private readonly filePostParam: FileUploadParam = new FileUploadParam();
    private qualificationFileTypes: string[] = ['application/zip'];
    private qualificationFileSizeMLimit: number = 200;

    private onQualificationSuccess(): void {
        this.currentStep = RegisterStep.QualificationChecking;
    }
    // #endregion

    // #region -- vue life-circle methods
    private mounted(): void {
        this.filePostParam.scenario = FileAPIScenario.UpdateQualificationFile;
        const sessionInfo = this.storeState.sessionInfo;
        if (this.userRoleProp != null &&
            (sessionInfo == null ||
                sessionInfo.roles == null ||
                sessionInfo.roles.length === 0)) {
            this.userRole = this.userRoleProp;
        }
        this.initialize();
    }
    @Watch('$store.state.sessionInfo', { immediate: true, deep: true })
    private onSessionInfoChanged(currentValue: UserView, previousValue: UserView) {
        this.initialize();
    }

    @Watch('userRoleProp', { immediate: true, deep: true })
    private onUserRolePropChanged(currentValue: UserRole, previousValue: UserRole) {
        const sessionInfo = this.storeState.sessionInfo;
        if (sessionInfo == null ||
            sessionInfo.roles == null ||
            sessionInfo.roles.length === 0) {
            this.userRole = currentValue;
        }

    }
    // #endregion

    // region -- internal props and methods
    private readonly store = (this.$store as Store<IStoreState>);
    private readonly storeState = (this.$store.state as IStoreState);
    private initialize() {
        const sessionInfo = this.storeState.sessionInfo;
        if (sessionInfo == null ||
            sessionInfo.roles == null ||
            sessionInfo.roles.length === 0) {
            this.currentStep = RegisterStep.BasicInfo;
        } else {
            if (CommonUtils.isAdmin(sessionInfo.roles)) {
                RouterUtils.goToAdminView(this.$router);
                return;
            }

            if (sessionInfo.roles.includes(UserRole.PersonalExecutor)) {
                this.userRole = UserRole.PersonalExecutor;
            } else if (sessionInfo.roles.includes(UserRole.CorpExecutor)) {
                this.userRole = UserRole.CorpExecutor;
            } else if (sessionInfo.roles.includes(UserRole.PersonalPublisher)) {
                this.userRole = UserRole.PersonalPublisher;
            } else if (sessionInfo.roles.includes(UserRole.CorpPublisher)) {
                this.userRole = UserRole.CorpPublisher;
            }
            if (CommonUtils.isNullOrEmpty(sessionInfo.qualificationId)) {
                this.currentStep = RegisterStep.QualificationUpload;
            } else if (sessionInfo.state === UserState.toBeChecked) {
                this.currentStep = RegisterStep.QualificationChecking;
            } else if (sessionInfo.state === UserState.failedToCheck) {
                this.$message.error(`资质审核失败，请重新上传资质文件`);
                this.currentStep = RegisterStep.QualificationUpload;
            } else {
                this.currentStep = RegisterStep.Done;
            }
        }
    }
    // #endregion
}
