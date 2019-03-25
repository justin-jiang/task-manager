import { ApiErrorHandler } from 'client/common/ApiErrorHandler';
import { RouteQuery } from 'client/common/RouteQuery';
import { RouterUtils } from 'client/common/RouterUtils';
import BasicUserRegisterVue from 'client/components/BasicUserRegisterVue.vue';
import { ComponentUtils } from 'client/components/ComponentUtils';
import SingleFileUploadVue from 'client/components/SingleFileUploadVue.vue';
import UserIdentityInfoUploadVue from 'client/components/UserIdentityInfoUploadVue.vue';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { StoreMutationNames } from 'client/VuexOperations/StoreMutationNames';
import { CheckState } from 'common/CheckState';
import { CommonUtils } from 'common/CommonUtils';
import { LIMIT_FILE_SIZE_M } from 'common/Constants';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { NotificationType } from 'common/NotificationType';
import { FileDownloadParam } from 'common/requestParams/FileDownloadParam';
import { FileUploadParam } from 'common/requestParams/FileUploadParam';
import { ApiResult } from 'common/responseResults/APIResult';
import { UserView } from 'common/responseResults/UserView';
import { UserRole } from 'common/UserRole';
import { Component, Vue, Watch } from 'vue-property-decorator';
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
export class UserRegisterTS extends Vue {
    // #region -- props of this component
    // temporary prop to share code with publisher register
    // #endregion


    // #region -- referred props and methods for this page
    private isInitialized: boolean = false;
    private currentStep: RegisterStep = RegisterStep.BasicInfo;
    private targetRole: UserRole = UserRole.None;
    private countdown: number = 5;

    private title(): string {
        if (this.userRole === UserRole.CorpExecutor ||
            this.userRole === UserRole.PersonalExecutor) {
            return '雇员注册';
        } else {
            return '雇主注册';
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
        this.store.commit(StoreMutationNames.sessionInfoUpdate, user);
        this.calculateRegisterStep();
        this.$message.success('提交成功');
    }
    private onBasicUserFailure(apiResult: ApiResult): void {
        this.$message.error(`提交失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
    }
    private onIdUploadSuccess(): void {
        this.calculateRegisterStep();
    }
    // #endregion

    // #region -- props and methods for step process
    private checkAlertTitle: string = '';
    private checkAlertDesc: string = '';
    private get hasCheckAlert(): boolean {
        return !CommonUtils.isNullOrEmpty(this.checkAlertTitle);
    }
    private get basicInfoStatus(): string {
        const sessionInfo = this.storeState.sessionInfo;
        if (!CommonUtils.isNullOrEmpty(sessionInfo.uid)) {
            return StepStatus.success;
        }
        return StepStatus.process;
    }
    private get idInfoStatus(): string {
        const sessionInfo = this.storeState.sessionInfo;
        if (this.currentStep === RegisterStep.IdentityInfo) {
            return StepStatus.process;
        }
        if (sessionInfo.idState === CheckState.FailedToCheck) {
            return StepStatus.error;
        }
        if (sessionInfo.idState === CheckState.Checked || sessionInfo.idState === CheckState.ToBeChecked) {
            return StepStatus.success;
        }

        return StepStatus.wait;
    }
    private get idCheckAlert(): string {
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
            sessionInfo.idState === CheckState.Checked) {
            return StepStatus.success;
        } else {
            return StepStatus.wait;
        }
    }

    private get doneStatus(): string {
        if (this.currentStep === RegisterStep.Done) {
            return StepStatus.success;
        }
        return StepStatus.wait;
    }
    // #endregion

    // #region -- referred props and methods for basicUserRegister
    private get userRole(): UserRole {
        const sessionInfo = this.storeState.sessionInfo;
        if (CommonUtils.isNullOrEmpty(sessionInfo.uid)) {
            return this.targetRole;
        } else {
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
    }
    // #endregion

    // #region -- referred props and methods for qualification uploader
    private readonly filePostParam: FileUploadParam = new FileUploadParam();
    private qualificationFileTypes: string[] = ['application/zip', 'application/x-rar'];
    private qualificationFileSizeMLimit: number = LIMIT_FILE_SIZE_M;

    private onQualificationSuccess(apiResult: ApiResult): void {
        this.store.commit(StoreMutationNames.sessionInfoPropUpdate, apiResult.data);
        this.calculateRegisterStep();
        this.$message.success('提交成功');
    }
    private onQaulificationTemplateDownload(): void {
        ComponentUtils.downloadFile(this,
            {
                scenario: FileAPIScenario.DownloadQualificationTemplate,
            } as FileDownloadParam,
            '资质模板.zip');

    }
    // #endregion

    // #region -- vue life-circle methods
    private mounted(): void {
        this.filePostParam.scenario = FileAPIScenario.UploadQualification;
        const query = this.$route.query as RouteQuery;
        if (query != null && !CommonUtils.isNullOrEmpty(query.role)) {
            this.targetRole = Number.parseInt(query.role as string, 10) as UserRole;
        }
        this.initialize();
    }
    // #endregion

    // region -- internal props and methods
    private readonly store = (this.$store as Store<IStoreState>);
    private readonly storeState = (this.$store.state as IStoreState);
    @Watch('$store.state.sessionInfo', { immediate: true })
    private onSessionInfoChanged(currentValue: UserView, previousValue: UserView) {
        const sessionInfo = currentValue;
        this.initialize();
    }
    private initialize() {
        if (CommonUtils.isAdmin(this.storeState.sessionInfo)) {
            RouterUtils.goToAdminView(this.$router);
        } else {
            this.calculateRegisterStep();
        }
        this.isInitialized = true;
    }

    private calculateRegisterStep(): void {
        this.checkAlertTitle = '';
        const sessionInfo = this.storeState.sessionInfo;
        // check basic info state
        if (CommonUtils.isNullOrEmpty(sessionInfo.uid)) {
            this.currentStep = RegisterStep.BasicInfo;
            return;
        }

        if (sessionInfo.idState == null ||
            sessionInfo.idState === CheckState.NONE ||
            sessionInfo.idState === CheckState.Missed) {
            this.currentStep = RegisterStep.IdentityInfo;
            return;
        }
        if (sessionInfo.idState === CheckState.FailedToCheck) {
            this.currentStep = RegisterStep.IdentityInfo;
            this.checkAlertTitle = '主体审核失败';
            this.checkAlertDesc = sessionInfo.idCheckNote as string;
            return;
        }


        if (sessionInfo.qualificationState == null ||
            sessionInfo.qualificationState === CheckState.NONE ||
            sessionInfo.qualificationState === CheckState.Missed) {
            this.currentStep = RegisterStep.QualificationUpload;
            return;
        }
        if (sessionInfo.qualificationState === CheckState.FailedToCheck) {
            this.currentStep = RegisterStep.QualificationUpload;
            this.checkAlertTitle = '资质审核失败';
            this.checkAlertDesc = sessionInfo.qualificationCheckNote as string;
            return;
        }

        if (sessionInfo.qualificationState === CheckState.ToBeChecked ||
            sessionInfo.idState === CheckState.ToBeChecked) {
            this.currentStep = RegisterStep.Checking;
            return;
        }

        this.currentStep = RegisterStep.Done;
        setTimeout(this.redirectCountdown.bind(this), 1 * 1000);
    }

    private redirectCountdown(): void {
        this.countdown--;
        if (this.countdown < 0) {
            RouterUtils.goToUserHomePage(this.$router, this.storeState.sessionInfo);
        } else {
            setTimeout(this.redirectCountdown.bind(this), 1 * 1000);
        }
    }
    // #endregion
}
