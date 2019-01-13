import { msgConnectionIssue } from 'client/common/Constants';
import { RouterUtils } from 'client/common/RouterUtils';
import BasicUserRegisterVue from 'client/components/BasicUserRegisterVue.vue';
import { ComponentUtils } from 'client/components/ComponentUtils';
import SingleFileUploadVue from 'client/components/SingleFileUploadVue.vue';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { StoreMutationNames } from 'client/VuexOperations/StoreMutationNames';
import { CommonUtils } from 'common/CommonUtils';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { FileUploadParam } from 'common/requestParams/FileUploadParam';
import { LogoState } from 'common/responseResults/LogoState';
import { QualificationState } from 'common/responseResults/QualificationState';
import { UserView } from 'common/responseResults/UserView';
import { UserRole } from 'common/UserRole';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Store } from 'vuex';
import { IdentityState } from 'common/responseResults/IdentityState';
import { NotificationType } from 'common/NotificationType';
import UserIdentityInfoUploadVue from 'client/components/UserIdentityInfoUploadVue.vue';
import { UserType } from 'common/UserTypes';
import { ApiResult } from 'common/responseResults/APIResult';

enum RegisterStep {
    BasicInfo = 0,
    IdentityInfo = 1,
    QualificationUpload = 2,
    Checking = 3,
    Done = 4,
}
enum StepStatus {
    wait = 'wait',
    process = 'process',
    finish = 'finish',
    error = 'error',
    success = 'success',
}

const compToBeRegistered: any = {
    BasicUserRegisterVue,
    SingleFileUploadVue,
    UserIdentityInfoUploadVue,
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
    private currentStep: RegisterStep = RegisterStep.BasicInfo;


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

    private isIdUpload(): boolean {
        return this.currentStep === RegisterStep.IdentityInfo;
    }
    private isQualificationUpload(): boolean {
        return this.currentStep === RegisterStep.QualificationUpload;
    }
    private isQualificationChecking(): boolean {
        return this.currentStep === RegisterStep.Checking;
    }
    private isDone() {
        return this.currentStep === RegisterStep.Done;
    }
    private onBasicUserSuccess(user: UserView): void {
        (async () => {
            user.logoUrl = await ComponentUtils.$$getImageUrl(this, user.logoUid as string, FileAPIScenario.DownloadUserLogo) || '';
            this.store.commit(StoreMutationNames.sessionInfoUpdate, user)
            this.caculateRegisterStep();
        })().catch((ex) => {
            RouterUtils.goToErrorView(this.$router, this.storeState, msgConnectionIssue, ex);
        });
    }
    private onIdUploadSuccess(): void {
        this.caculateRegisterStep();
    }
    // #endregion

    // #region -- props and methods for step process
    private get basicInfoStatus(): string {
        const sessionInfo = this.storeState.sessionInfo;
        if (this.currentStep === RegisterStep.BasicInfo) {
            return StepStatus.process;
        }
        if (sessionInfo.logoState === LogoState.Missed) {
            return StepStatus.wait;
        }

        if (sessionInfo.logoState === LogoState.Checked) {
            return StepStatus.success;
        }
        if (sessionInfo.logoState === LogoState.FailedToCheck) {
            return StepStatus.error;
        }
        return StepStatus.wait;
    }
    private get basicInfoDesc(): string {
        let desc: string = '';
        const sessionInfo = this.storeState.sessionInfo;
        const notifications = this.storeState.notificationObjs;
        if (sessionInfo.logoState === LogoState.FailedToCheck) {
            for (const item of notifications) {
                if (item.type === NotificationType.UserLogoCheckFailure) {
                    desc = `${item.title}:${item.content}`;
                }
            }
        }
        return desc;
    }
    private get idInfoStatus(): string {
        const sessionInfo = this.storeState.sessionInfo;
        if (this.currentStep === RegisterStep.IdentityInfo) {
            return StepStatus.process;
        }
        if (sessionInfo.frontIdState === IdentityState.Missed ||
            sessionInfo.backIdState === IdentityState.Missed) {
            return StepStatus.wait;
        }
        if (sessionInfo.frontIdState === IdentityState.FailedToCheck ||
            sessionInfo.backIdState === IdentityState.FailedToCheck) {
            return StepStatus.error;
        }

        if (sessionInfo.frontIdState === IdentityState.Checked &&
            sessionInfo.backIdState === IdentityState.Checked) {
            return StepStatus.success;
        }

        return StepStatus.wait;
    }
    private get idInfoDesc(): string {
        let desc: string = '';
        const sessionInfo = this.storeState.sessionInfo;
        const notifications = this.storeState.notificationObjs;
        if (sessionInfo.frontIdState === IdentityState.FailedToCheck ||
            sessionInfo.backIdState === IdentityState.FailedToCheck) {
            for (const item of notifications) {
                if (item.type === NotificationType.UserIdCheckFailure) {
                    desc = `${item.title}:${item.content}`;
                }
            }
        }
        return desc;
    }
    private get qualificationStatus(): string {
        const sessionInfo = this.storeState.sessionInfo;
        if (this.currentStep === RegisterStep.QualificationUpload) {
            return StepStatus.process;
        }
        if (sessionInfo.qualificationState === QualificationState.Missed) {
            return StepStatus.wait;
        }
        if (sessionInfo.qualificationState === QualificationState.FailedToCheck) {
            return StepStatus.error;
        }

        if (sessionInfo.qualificationState === QualificationState.Checked) {
            return StepStatus.success;
        }
        return StepStatus.wait;
    }
    private get qualificationDesc(): string {
        let desc: string = '';
        const sessionInfo = this.storeState.sessionInfo;
        const notifications = this.storeState.notificationObjs;
        if (sessionInfo.qualificationState === QualificationState.FailedToCheck) {
            for (const item of notifications) {
                if (item.type === NotificationType.UserQualificationCheckFailure) {
                    desc = item.content as string || '';
                }
            }
        }
        return desc;
    }
    private get checkStatus(): string {
        const sessionInfo = this.storeState.sessionInfo;
        if (this.currentStep === RegisterStep.Checking) {
            return StepStatus.process;
        }
        if (sessionInfo.qualificationState === QualificationState.Checked &&
            sessionInfo.logoState === LogoState.Checked &&
            sessionInfo.backIdState === IdentityState.Checked &&
            sessionInfo.frontIdState === IdentityState.Checked) {
            return StepStatus.success;
        } else {
            return StepStatus.wait;
        }
    }
    private get checkDesc(): string {
        return '';
    }
    private get doneStatus(): string {
        if (this.currentStep === RegisterStep.Done) {
            return StepStatus.success;
        }
        return StepStatus.wait;
    }
    private get doneDesc(): string {
        return '';
    }
    // #endregion

    // #region -- referred props and methods for basicUserRegister
    private userRole: UserRole = UserRole.PersonalExecutor;
    // #endregion

    // #region -- referred props and methods for qualification uploader
    private readonly filePostParam: FileUploadParam = new FileUploadParam();
    private qualificationFileTypes: string[] = ['application/zip', 'application/x-rar'];
    private qualificationFileSizeMLimit: number = 200;

    private onQualificationSuccess(apiResult: ApiResult): void {
        this.store.commit(StoreMutationNames.sessionInfoPropUpdate, apiResult.data);
        this.caculateRegisterStep();
    }
    // #endregion

    // #region -- vue life-circle methods
    private mounted(): void {
        this.filePostParam.scenario = FileAPIScenario.UpdateQualificationFile;
        if (this.userRoleProp != null) {
            this.userRole = this.userRoleProp;
        }
        this.initialize();
    }
    // #endregion

    // region -- internal props and methods
    private readonly store = (this.$store as Store<IStoreState>);
    private readonly storeState = (this.$store.state as IStoreState);
    private initialize() {
        const sessionInfo = this.storeState.sessionInfo;
        if (CommonUtils.isAdmin(sessionInfo.roles)) {
            RouterUtils.goToAdminView(this.$router);
            return;
        }
        const roles = sessionInfo.roles as UserRole[] || [];
        if (roles.includes(UserRole.PersonalExecutor)) {
            this.userRole = UserRole.PersonalExecutor;
        } else if (roles.includes(UserRole.CorpExecutor)) {
            this.userRole = UserRole.CorpExecutor;
        } else if (roles.includes(UserRole.PersonalPublisher)) {
            this.userRole = UserRole.PersonalPublisher;
        } else if (roles.includes(UserRole.CorpPublisher)) {
            this.userRole = UserRole.CorpPublisher;
        }
        this.caculateRegisterStep();
    }

    private caculateRegisterStep(): void {
        const sessionInfo = this.storeState.sessionInfo;
        // check logo state
        if (sessionInfo.logoState == null ||
            sessionInfo.logoState === LogoState.Missed ||
            sessionInfo.logoState === LogoState.FailedToCheck) {
            this.currentStep = RegisterStep.BasicInfo;
            return;
        }

        if (sessionInfo.frontIdState == null ||
            sessionInfo.frontIdState === IdentityState.Missed ||
            sessionInfo.frontIdState === IdentityState.FailedToCheck ||
            sessionInfo.backIdState == null ||
            sessionInfo.backIdState === IdentityState.Missed ||
            sessionInfo.backIdState === IdentityState.FailedToCheck) {
            this.currentStep = RegisterStep.IdentityInfo;
            return;
        }


        if (sessionInfo.qualificationState == null ||
            sessionInfo.qualificationState === QualificationState.Missed ||
            sessionInfo.qualificationState === QualificationState.FailedToCheck) {
            this.currentStep = RegisterStep.QualificationUpload;
            return;
        }
        if (sessionInfo.qualificationState !== QualificationState.Checked ||
            sessionInfo.logoState !== LogoState.Checked ||
            sessionInfo.frontIdState !== IdentityState.Checked ||
            sessionInfo.backIdState !== IdentityState.Checked) {
            this.currentStep = RegisterStep.Checking;
            return;
        }

        this.currentStep = RegisterStep.Done;
    }
    // #endregion
}
