import { IStoreState } from 'client/VuexOperations/IStoreState';
import { StoreMutationNames } from 'client/VuexOperations/StoreMutationNames';
import { CommonUtils } from 'common/CommonUtils';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { UserCheckParam } from 'common/requestParams/UserCheckParam';
import { CheckState } from 'common/CheckState';
import { UserView } from 'common/responseResults/UserView';
import { UserType } from 'common/UserTypes';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Store } from 'vuex';
import { ComponentUtils } from './ComponentUtils';

enum EventNames {
    submit = 'submit',
    canceled = 'canceled',

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

    // #region -- referred props and methods of the page
    private readonly logoSwitchActiveValue: CheckState = CheckState.Checked;
    private readonly logoSwitchInactiveValue: CheckState = CheckState.FailedToCheck;

    private readonly idSwitchActiveValue: CheckState = CheckState.Checked;
    private readonly idSwitchInactiveValue: CheckState = CheckState.FailedToCheck;

    private targetUser: UserView = {};

    private get isLogoToBeChecked(): boolean {
        return this.targetUser.logoState === CheckState.ToBeChecked;
    }
    private get isFrontIdToBeChecked(): boolean {
        return this.targetUser.frontIdState === CheckState.ToBeChecked;
    }
    private get isBackIdToBeChecked(): boolean {
        return this.targetUser.backIdState === CheckState.ToBeChecked;
    }
    private reasonOfDeny: string = '';
    private idCheckParam: UserCheckParam = {
        uid: this.userUidProp,
        logoState: CheckState.Checked,
        noteForLogo: '',
        frontIdState: CheckState.Checked,
        noteForFrontId: '',
        backIdState: CheckState.Checked,
        noteForBackId: '',
    };
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
        const index = this.storeState.userObjs.findIndex((item) => {
            if (item.uid === this.userUidProp) {
                return true;
            } else {
                return false;
            }
        });
        if (index >= 0) {
            this.getLogoUrl(this.storeState.userObjs[index]);
            return this.storeState.userObjs[index].logoUrl as string || '';
        } else {
            return '';
        }
    }
    private get frontImageUrl(): string {
        const index = this.storeState.userObjs.findIndex((item) => {
            if (item.uid === this.userUidProp) {
                return true;
            } else {
                return false;
            }
        });
        if (index >= 0) {
            this.getFrontImageUrl(this.storeState.userObjs[index]);
            return this.storeState.userObjs[index].frondIdUrl as string || '';
        } else {
            return '';
        }
    }
    private get backImageUrl(): string {
        const index = this.storeState.userObjs.findIndex((item) => {
            if (item.uid === this.userUidProp) {
                return true;
            } else {
                return false;
            }
        });
        if (index >= 0) {
            this.getBackImageUrl(this.storeState.userObjs[index]);
            return this.storeState.userObjs[index].backIdUrl as string || '';
        } else {
            return '';
        }
    }
    onCheckSubmit(): void {
        this.$emit(EventNames.submit, this.idCheckParam);
    }
    onCheckCanceled(): void {
        this.$emit(EventNames.canceled);
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
        const index = this.storeState.userObjs.findIndex((currentValue) => {
            if (currentValue.uid === this.userUidProp) {
                return true;
            } else {
                return false;
            }
        });
        if (index >= 0) {
            this.targetUser = this.storeState.userObjs[index];
            this.idCheckParam.uid = this.targetUser.uid;
            this.idCheckParam.backIdState = this.targetUser.backIdState;
            this.idCheckParam.logoState = this.targetUser.logoState;
            this.idCheckParam.frontIdState = this.targetUser.frontIdState;
        }
    }
    private getLogoUrl(user: UserView): void {
        if (CommonUtils.isNullOrEmpty(user.logoUrl)) {
            (async () => {
                user.logoUrl = await ComponentUtils.$$getImageUrl(
                    this, user.logoUid as string, FileAPIScenario.DownloadUserLogo);
                if (!CommonUtils.isNullOrEmpty(user.logoUrl)) {
                    this.store.commit(StoreMutationNames.userItemUpdate, {
                        uid: user.uid,
                        logoUrl: user.logoUrl,
                    } as UserView);
                } else {
                    this.$message.error('获取头像信息失败');
                }
            })();
        }
    }
    private getFrontImageUrl(user: UserView): void {
        if (CommonUtils.isNullOrEmpty(user.frondIdUrl)) {
            (async () => {
                user.frondIdUrl = await ComponentUtils.$$getImageUrl(
                    this, user.frontIdUid as string, FileAPIScenario.DownloadFrontId);
                if (!CommonUtils.isNullOrEmpty(user.frondIdUrl)) {
                    this.store.commit(StoreMutationNames.userItemUpdate, {
                        uid: user.uid,
                        frondIdUrl: user.frondIdUrl,
                    } as UserView);
                } else {
                    if (user.type === UserType.Corp) {
                        this.$message.error('获取手持营业执照照片失败');
                    } else {
                        this.$message.error('获取手持身份证正面照片失败');
                    }
                }
            })();
        }
    }
    private getBackImageUrl(user: UserView): void {
        if (CommonUtils.isNullOrEmpty(user.backIdUrl)) {
            (async () => {
                user.backIdUrl = await ComponentUtils.$$getImageUrl(
                    this, user.backIdUid as string, FileAPIScenario.DownloadBackId);
                if (!CommonUtils.isNullOrEmpty(user.backIdUrl)) {
                    this.store.commit(StoreMutationNames.userItemUpdate,
                        { uid: user.uid, backIdUrl: user.backIdUrl } as UserView);
                } else {
                    if (user.type === UserType.Corp) {
                        this.$message.error('获取手持营业执照照片失败');
                    } else {
                        this.$message.error('获取手持身份证正面照片失败');
                    }
                }
            })();
        }
    }
    // #endregion
}
