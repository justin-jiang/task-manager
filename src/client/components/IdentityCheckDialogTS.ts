import { IStoreState } from 'client/VuexOperations/IStoreState';
import { StoreMutationNames } from 'client/VuexOperations/StoreMutationNames';
import { CheckState } from 'common/CheckState';
import { CommonUtils } from 'common/CommonUtils';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { UserCheckParam } from 'common/requestParams/UserCheckParam';
import { UserView } from 'common/responseResults/UserView';
import { UserType } from 'common/UserTypes';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Store } from 'vuex';
import { ComponentUtils } from './ComponentUtils';

enum EventNames {
    submitted = 'submitted',
    cancelled = 'cancelled',

}


const compToBeRegistered: any = {
};



@Component({
    components: compToBeRegistered,
})
export class IdentityCheckDialogTS extends Vue {
    // #region -- component props and methods
    @Prop() public visibleProp!: boolean;
    @Prop() public userUidProp!: string;
    // #endregion

    // #region -- referred props and methods of the page template
    private readonly idSwitchActiveValue: CheckState = CheckState.Checked;
    private readonly idSwitchInactiveValue: CheckState = CheckState.FailedToCheck;

    private targetUser: UserView = {};
    private previewedImageUrl: string = '';
    private previewDialogVisible: boolean = false;

    private idCheckParam: UserCheckParam = {
        uid: this.userUidProp,
        idState: CheckState.Missed,
        idCheckNote: '',
    };

    private get userType(): string {
        if (this.targetUser.type === UserType.Individual) {
            return '个人';
        } else {
            return '企业';
        }
    }
    private get titleOfId(): string {
        if (this.targetUser.type === UserType.Individual) {
            return '身份证：';
        } else {
            return '社会信用代码：';
        }
    }
    private get isCorpUser(): boolean {
        return this.targetUser.type === UserType.Corp;
    }

    private get islogoIdReady(): boolean {
        return !CommonUtils.isNullOrEmpty(this.targetUser.logoUid);
    }
    private get isAuthLetterIdReady(): boolean {
        return this.isCorpUser && !CommonUtils.isNullOrEmpty(this.targetUser.authLetterUid);
    }

    private get titleOfFrontImage(): string {
        const sessionInfo = this.storeState.sessionInfo;
        if (sessionInfo.type === UserType.Corp) {
            return '手持营业执照照片';
        } else {
            return '手持身份证正面照片';
        }
    }
    private get titleOfBackImage(): string {
        const sessionInfo = this.storeState.sessionInfo;
        if (sessionInfo.type === UserType.Corp) {
            return '营业执照照片';
        } else {
            return '身份证背面照片';
        }
    }
    private get logoUrl(): string {
        return this.targetUser.logoUrl || '';
    }
    private get frontImageUrl(): string {
        return this.targetUser.frondIdUrl || '';
    }
    private get backImageUrl(): string {
        return this.targetUser.backIdUrl || '';
    }
    private get licenseImageUrl(): string {
        return this.targetUser.licenseUrl || '';
    }
    private get licenseWithPersonImageUrl(): string {
        return this.targetUser.licenseWithPersonUrl || '';
    }
    private get authLetterUrl(): string {
        return this.targetUser.authLetterUrl || '';
    }
    private get area(): string {
        return CommonUtils.isNullOrEmpty(this.targetUser.province) ? '' :
            `${this.targetUser.province} ${this.targetUser.city} ${this.targetUser.district}`;
    }
    private get isAccepted(): boolean {
        return this.idCheckParam.idState === CheckState.Checked;
    }
    private get isReadyToSubmit(): boolean {
        if (this.idCheckParam.idState === CheckState.FailedToCheck &&
            CommonUtils.isNullOrEmpty(this.idCheckParam.idCheckNote)) {
            return false;
        }
        return true;
    }
    private onCheckSubmit(): void {
        this.$emit(EventNames.submitted, this.idCheckParam);
    }
    private onCheckCancelled(): void {
        this.$emit(EventNames.cancelled);
    }

    private onPreview(imageUrl: string): void {
        this.previewedImageUrl = imageUrl as string;
        this.previewDialogVisible = true;
    }
    // #endregion

    // #region -- vue life-circle methods
    private mounted(): void {
    }
    // #endregion

    // #region -- internal variables and methods
    private readonly store = (this.$store as Store<IStoreState>);
    private readonly storeState = (this.$store.state as IStoreState);
    @Watch('userUidProp', { immediate: true })
    private onUserUidChanged(currentValue: string, previousValue: string) {
        const index = this.storeState.userObjs.findIndex((user: UserView) => {
            if (user.uid === this.userUidProp) {
                return true;
            } else {
                return false;
            }
        });
        if (index >= 0) {
            this.targetUser = this.storeState.userObjs[index];
            this.idCheckParam.uid = this.targetUser.uid;
            this.idCheckParam.idState = CheckState.Checked;
            this.idCheckParam.idCheckNote = '';
            this.getLogoUrl(this.targetUser);
            this.getBackImageUrl(this.targetUser);
            this.getFrontImageUrl(this.targetUser);
            this.getAuthLetterUrl(this.targetUser);
            this.getLicenseImageUrl(this.targetUser);
            this.getLicenseWithPersonImageUrl(this.targetUser);
        }
    }
    private getLogoUrl(user: UserView): void {
        if (!CommonUtils.isNullOrEmpty(user.logoUid) && CommonUtils.isNullOrEmpty(user.logoUrl)) {
            (async () => {
                user.logoUrl = await ComponentUtils.$$getImageUrl(
                    this, user.logoUid as string, FileAPIScenario.DownloadUserLogo);
                if (!CommonUtils.isNullOrEmpty(user.logoUrl)) {
                    this.store.commit(StoreMutationNames.userItemUpdate, {
                        uid: user.uid,
                        logoUrl: user.logoUrl,
                    } as UserView);
                    this.targetUser = Object.assign({}, user);
                } else {
                    this.$message.error('获取头像信息失败');
                }
            })();
        }
    }
    private getFrontImageUrl(user: UserView): void {
        if (!CommonUtils.isNullOrEmpty(user.frontIdUid) &&
            CommonUtils.isNullOrEmpty(user.frondIdUrl)) {
            (async () => {
                user.frondIdUrl = await ComponentUtils.$$getImageUrl(
                    this, user.frontIdUid as string, FileAPIScenario.DownloadFrontId);
                if (!CommonUtils.isNullOrEmpty(user.frondIdUrl)) {
                    this.store.commit(StoreMutationNames.userItemUpdate, {
                        uid: user.uid,
                        frondIdUrl: user.frondIdUrl,
                    } as UserView);
                    this.targetUser = Object.assign({}, user);
                } else {
                    this.$message.error('获取身份证正面照片失败');
                }
            })();
        }
    }
    private getBackImageUrl(user: UserView): void {
        if (!CommonUtils.isNullOrEmpty(user.backIdUid) && CommonUtils.isNullOrEmpty(user.backIdUrl)) {
            (async () => {
                user.backIdUrl = await ComponentUtils.$$getImageUrl(
                    this, user.backIdUid as string, FileAPIScenario.DownloadBackId);
                if (!CommonUtils.isNullOrEmpty(user.backIdUrl)) {
                    this.store.commit(StoreMutationNames.userItemUpdate,
                        { uid: user.uid, backIdUrl: user.backIdUrl } as UserView);
                    this.targetUser = Object.assign({}, user);
                } else {
                    this.$message.error('获取身份证背面照片失败');
                }
            })();
        }
    }
    private getLicenseImageUrl(user: UserView): void {
        if (!CommonUtils.isNullOrEmpty(user.licenseUid) && CommonUtils.isNullOrEmpty(user.licenseUrl)) {
            (async () => {
                user.licenseUrl = await ComponentUtils.$$getImageUrl(
                    this, user.licenseUid as string, FileAPIScenario.DownloadLicense);
                if (!CommonUtils.isNullOrEmpty(user.licenseUrl)) {
                    this.store.commit(StoreMutationNames.userItemUpdate,
                        { uid: user.uid, licenseUrl: user.licenseUrl } as UserView);
                    this.targetUser = Object.assign({}, user);
                } else {
                    this.$message.error('获取营业执照照片失败');
                }
            })();
        }
    }

    private getLicenseWithPersonImageUrl(user: UserView): void {
        if (!CommonUtils.isNullOrEmpty(user.licenseWithPersonUid) &&
            CommonUtils.isNullOrEmpty(user.licenseWithPersonUrl)) {
            (async () => {
                user.licenseWithPersonUrl = await ComponentUtils.$$getImageUrl(
                    this, user.licenseWithPersonUid as string, FileAPIScenario.DownloadLinceWithPerson);
                if (!CommonUtils.isNullOrEmpty(user.licenseWithPersonUrl)) {
                    this.store.commit(StoreMutationNames.userItemUpdate,
                        { uid: user.uid, licenseWithPersonUrl: user.licenseWithPersonUrl } as UserView);
                    this.targetUser = Object.assign({}, user);
                } else {
                    this.$message.error('获取手持营业执照照片失败');
                }
            })();
        }
    }
    private getAuthLetterUrl(user: UserView): void {
        if (!CommonUtils.isNullOrEmpty(user.authLetterUid) && CommonUtils.isNullOrEmpty(user.authLetterUrl)) {
            (async () => {
                user.authLetterUrl = await ComponentUtils.$$getImageUrl(
                    this, user.authLetterUid as string, FileAPIScenario.DownloadAuthLetter);
                if (!CommonUtils.isNullOrEmpty(user.authLetterUrl)) {
                    this.store.commit(StoreMutationNames.userItemUpdate, {
                        uid: user.uid,
                        authLetterUrl: user.authLetterUrl,
                    } as UserView);
                    this.targetUser = Object.assign({}, user);
                } else {
                    this.$message.error('获取法人授权书图片失败');
                }
            })();
        }
    }

    // #endregion
}
