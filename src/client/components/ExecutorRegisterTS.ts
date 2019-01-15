import { msgConnectionIssue } from 'client/common/Constants';
import { RouterUtils } from 'client/common/RouterUtils';
import BasicUserRegisterVue from 'client/components/BasicUserRegisterVue.vue';
import { ComponentUtils } from 'client/components/ComponentUtils';
import SingleFileUploadVue from 'client/components/SingleFileUploadVue.vue';
import UserIdentityInfoUploadVue from 'client/components/UserIdentityInfoUploadVue.vue';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { StoreMutationNames } from 'client/VuexOperations/StoreMutationNames';
import { CheckState } from 'common/CheckState';
import { CommonUtils } from 'common/CommonUtils';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { NotificationType } from 'common/NotificationType';
import { FileUploadParam } from 'common/requestParams/FileUploadParam';
import { ApiResult } from 'common/responseResults/APIResult';
import { UserView } from 'common/responseResults/UserView';
import { UserRole } from 'common/UserRole';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Store } from 'vuex';

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
            user.logoUrl = await ComponentUtils.$$getImageUrl(
                this, user.logoUid as string, FileAPIScenario.DownloadUserLogo) || '';
            this.store.commit(StoreMutationNames.sessionInfoUpdate, user);
            this.caculateRegisterStep();
            this.$message.success('用户基本信息创建成功');
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
        if (sessionInfo.logoState === CheckState.Missed) {
            return StepStatus.wait;
        }

        if (sessionInfo.logoState === CheckState.ToBeChecked ||
            sessionInfo.logoState === CheckState.Checked) {
            return StepStatus.success;
        }
        if (sessionInfo.logoState === CheckState.FailedToCheck) {
            return StepStatus.error;
        }
        return StepStatus.wait;
    }
    private get basicInfoTitle(): string {
        let desc: string = '';
        const sessionInfo = this.storeState.sessionInfo;
        const notifications = this.storeState.notificationObjs;
        if (sessionInfo.logoState === CheckState.FailedToCheck) {
            for (const item of notifications) {
                if (item.type === NotificationType.UserLogoCheckFailure) {
                    desc = item.title || '';
                    break;
                }
            }
        }
        return desc;
    }
    private get basicInfoDetails(): string {
        let desc: string = '';
        const sessionInfo = this.storeState.sessionInfo;
        const notifications = this.storeState.notificationObjs;
        if (sessionInfo.logoState === CheckState.FailedToCheck) {
            for (const item of notifications) {
                if (item.type === NotificationType.UserLogoCheckFailure) {
                    desc = item.content || '';
                    break;
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
        if (sessionInfo.frontIdState === CheckState.Missed ||
            sessionInfo.backIdState === CheckState.Missed) {
            return StepStatus.wait;
        }
        if (sessionInfo.frontIdState === CheckState.FailedToCheck ||
            sessionInfo.backIdState === CheckState.FailedToCheck) {
            return StepStatus.error;
        }

        if ((sessionInfo.frontIdState === CheckState.Checked || sessionInfo.frontIdState === CheckState.ToBeChecked) &&
            (sessionInfo.backIdState === CheckState.Checked || sessionInfo.backIdState === CheckState.ToBeChecked)) {
            return StepStatus.success;
        }

        return StepStatus.wait;
    }
    private get idInfoTitle(): string {
        const desc: string[] = [];
        const sessionInfo = this.storeState.sessionInfo;
        const notifications = this.storeState.notificationObjs;
        if (sessionInfo.frontIdState === CheckState.FailedToCheck ||
            sessionInfo.backIdState === CheckState.FailedToCheck) {
            for (const item of notifications) {
                if (item.type === NotificationType.FrontIdCheckFailure ||
                    item.type === NotificationType.BackIdCheckFailure) {
                    desc.push(item.title || '');
                    break;
                }
            }
        }
        return desc.join(',');
    }
    private get idInfoDetails(): string {
        const desc: string[] = [];
        const sessionInfo = this.storeState.sessionInfo;
        const notifications = this.storeState.notificationObjs;
        if (sessionInfo.frontIdState === CheckState.FailedToCheck) {
            for (const item of notifications) {
                if (item.type === NotificationType.FrontIdCheckFailure) {
                    desc.push(item.content || '');
                    break;
                }
            }
        }
        if (sessionInfo.backIdState === CheckState.FailedToCheck) {
            for (const item of notifications) {
                if (item.type === NotificationType.BackIdCheckFailure) {
                    desc.push(item.content || '');
                    break;
                }
            }
        }
        return desc.join(',');
    }
    private get qualificationStatus(): string {
        const sessionInfo = this.storeState.sessionInfo;
        if (this.currentStep === RegisterStep.QualificationUpload) {
            return StepStatus.process;
        }
        if (sessionInfo.qualificationState === CheckState.Missed) {
            return StepStatus.wait;
        }
        if (sessionInfo.qualificationState === CheckState.FailedToCheck) {
            return StepStatus.error;
        }

        if (sessionInfo.qualificationState === CheckState.Checked ||
            sessionInfo.qualificationState === CheckState.ToBeChecked) {
            return StepStatus.success;
        }
        return StepStatus.wait;
    }
    private get qualificationTitle(): string {
        let desc: string = '';
        const sessionInfo = this.storeState.sessionInfo;
        const notifications = this.storeState.notificationObjs;
        if (sessionInfo.qualificationState === CheckState.FailedToCheck) {
            for (const item of notifications) {
                if (item.type === NotificationType.UserQualificationCheckFailure) {
                    desc = item.title as string || '';
                }
            }
        }
        return desc;
    }
    private get qualificationDetails(): string {
        let desc: string = '';
        const sessionInfo = this.storeState.sessionInfo;
        const notifications = this.storeState.notificationObjs;
        if (sessionInfo.qualificationState === CheckState.FailedToCheck) {
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
        if (sessionInfo.qualificationState === CheckState.Checked &&
            sessionInfo.logoState === CheckState.Checked &&
            sessionInfo.backIdState === CheckState.Checked &&
            sessionInfo.frontIdState === CheckState.Checked) {
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
    private get userRole(): UserRole {
        if (this.userRoleProp != null) {
            return this.userRoleProp;
        }
        const sessionInfo = this.storeState.sessionInfo;
        const roles = sessionInfo.roles as UserRole[] || [];
        if (roles.includes(UserRole.PersonalExecutor)) {
            return UserRole.PersonalExecutor;
        } else if (roles.includes(UserRole.CorpExecutor)) {
            return UserRole.CorpExecutor;
        } else if (roles.includes(UserRole.PersonalPublisher)) {
            return UserRole.PersonalPublisher;
        } else if (roles.includes(UserRole.CorpPublisher)) {
            return UserRole.CorpPublisher;
        } else {
            return UserRole.None;
        }
    }
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
        this.caculateRegisterStep();
    }

    private caculateRegisterStep(): void {
        const sessionInfo = this.storeState.sessionInfo;
        // check logo state
        if (sessionInfo.logoState == null ||
            sessionInfo.logoState === CheckState.Missed ||
            sessionInfo.logoState === CheckState.FailedToCheck) {
            this.currentStep = RegisterStep.BasicInfo;
            return;
        }

        if (sessionInfo.frontIdState == null ||
            sessionInfo.frontIdState === CheckState.Missed ||
            sessionInfo.frontIdState === CheckState.FailedToCheck ||
            sessionInfo.backIdState == null ||
            sessionInfo.backIdState === CheckState.Missed ||
            sessionInfo.backIdState === CheckState.FailedToCheck) {
            this.currentStep = RegisterStep.IdentityInfo;
            return;
        }


        if (sessionInfo.qualificationState == null ||
            sessionInfo.qualificationState === CheckState.Missed ||
            sessionInfo.qualificationState === CheckState.FailedToCheck) {
            this.currentStep = RegisterStep.QualificationUpload;
            return;
        }
        if (sessionInfo.qualificationState !== CheckState.Checked ||
            sessionInfo.logoState !== CheckState.Checked ||
            sessionInfo.frontIdState !== CheckState.Checked ||
            sessionInfo.backIdState !== CheckState.Checked) {
            this.currentStep = RegisterStep.Checking;
            return;
        }

        this.currentStep = RegisterStep.Done;
    }
    // #endregion
}
