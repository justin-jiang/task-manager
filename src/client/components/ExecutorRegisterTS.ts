import BasicUserRegisterVue from 'client/components/BasicUserRegisterVue.vue';
import SingleFileUploadVue from 'client/components/SingleFileUploadVue.vue';
import { LoggerManager } from 'client/LoggerManager';
import { IStoreActionArgs } from 'client/VuexOperations/IStoreActionArgs';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { StoreActionNames } from 'client/VuexOperations/StoreActionNames';
import { CommonUtils } from 'common/CommonUtils';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { FileCreateParam } from 'common/requestParams/FileCreateParam';
import { UserRole } from 'common/UserRole';
import { UserState } from 'common/UserState';
import { Component, Vue, Prop } from 'vue-property-decorator';
import { Store } from 'vuex';

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
        // todo
        this.currentStep = RegisterStep.QualificationUpload;
    }
    // #endregion

    // #region -- referred props and methods for basicUserRegister
    private userRole: UserRole = UserRole.PersonalExecutor;
    // #endregion

    // #region -- referred props and methods for qualification uploader
    private readonly filePostParam: FileCreateParam = new FileCreateParam();
    private qualificationFileTypes: string[] = ['application/zip'];
    private qualificationFileSizeMLimit: number = 200;

    private onQualificationSuccess(): void {
        this.currentStep = RegisterStep.QualificationChecking;
    }
    // #endregion

    // #region -- vue life-circle methods
    private mounted(): void {
        this.filePostParam.scenario = FileAPIScenario.CreateQualification;
        if (this.userRoleProp != null) {
            this.userRole = this.userRoleProp;
        }
        (async () => {
            if (this.storeState.sessionInfo == null) {
                // consider async load, the sub page might be accessed before App.TS done,
                // so if there is no sessionInfo in store, try to read it from server
                await this.store.dispatch(
                    StoreActionNames.sessionQuery, { data: null } as IStoreActionArgs);
            }
            if (this.storeState.sessionInfo == null) {
                this.currentStep = RegisterStep.BasicInfo;
            } else if (CommonUtils.isNullOrEmpty(this.storeState.sessionInfo.qualificationId)) {
                this.currentStep = RegisterStep.QualificationUpload;
            } else if (this.storeState.sessionInfo.state === UserState.toBeChecked) {
                this.currentStep = RegisterStep.QualificationChecking;
            } else {
                this.currentStep = RegisterStep.Done;
            }

        })().catch((ex) => {
            this.$message.error('链接服务器失败，请检查网络连接是否正常');
            LoggerManager.error(ex);
        });
    }
    // #endregion

    // region -- internal props and methods
    private readonly store = (this.$store as Store<IStoreState>);
    private readonly storeState = (this.$store.state as IStoreState);
    // #endregion
}
