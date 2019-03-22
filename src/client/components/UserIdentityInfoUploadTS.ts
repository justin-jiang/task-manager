import { ApiErrorHandler } from 'client/common/ApiErrorHandler';
import SingleImageUploaderVue from 'client/components/SingleImageUploaderVue.vue';
import { LoggerManager } from 'client/LoggerManager';
import { IStoreActionArgs } from 'client/VuexOperations/IStoreActionArgs';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { StoreActionNames } from 'client/VuexOperations/StoreActionNames';
import { StoreMutationNames } from 'client/VuexOperations/StoreMutationNames';
import { CommonUtils } from 'common/CommonUtils';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { locations } from 'common/Locations';
import { FileUploadParam } from 'common/requestParams/FileUploadParam';
import { UserBasicInfoEditParam } from 'common/requestParams/UserBasicInfoEditParam';
import { ApiResult } from 'common/responseResults/APIResult';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { UserView } from 'common/responseResults/UserView';
import { UserType } from 'common/UserTypes';
import { Component, Vue, Watch } from 'vue-property-decorator';
import { Store } from 'vuex';
import { ISingleImageUploaderTS } from './SingleImageUploaderTS';
/**
 * data structure for Form
 */
interface IFormData {
    // user location
    address: string;
    bankAccountName: string;
    bankAccountNumber: string;
    bankName: string;
    city: string;
    district: string;
    // the indivial id number or corp crdential number
    identityNumber: string;

    linkBankAccountNumber?: string;

    // the principal name of corp
    principalName?: string;
    province: string;
    // individual real name or corp name
    realName: string;
    sex?: number;

    // the following props are only used to do validation
    area?: boolean;
    backIdUploader?: string;
    frontIdUploader?: string;
    licenseUploader?: string;
    licenseWithPersionUploader?: string;
    authLetterUploader?: string;
}
enum EventNames {
    UploadSuccess = 'success',
}

const compToBeRegistered: any = {
    SingleImageUploaderVue,
};

@Component({
    components: compToBeRegistered,
})
export class UserIdentityInfoUploadTS extends Vue {
    // #region -- props of this component
    // #endregion

    // #region -- referrence by template
    private readonly formRefName: string = 'uploadForm';

    private readonly frontUploaderRefName: string = 'frontUploader';
    private readonly frontUploaderItemRefName: string = 'frontUploaderItem';

    private readonly backUploaderRefName: string = 'backUploader';
    private readonly backUploaderItemRefName: string = 'backUploaderItem';

    private readonly licenseUploaderRefName: string = 'licenseloader';
    private readonly licenseUploaderItemRefName: string = 'licenseloaderItem';
    private readonly licenseWithPersonUploaderRefName: string = 'licenseWithPersonloader';
    private readonly licenseWithPersonUploaderItemRefName: string = 'licenseWithPersonloaderItem';

    private readonly logoUploaderRefName: string = 'logoUploader';
    private readonly logoUploaderItemRefName: string = 'logoUploaderItem';
    private readonly authLetterUploaderRefName: string = 'authLetterloader';
    private readonly authLetterUploaderItemRefName: string = 'authLetterUploaderItem';

    private readonly formData: IFormData = {
        // the following props map to props in UserView
        address: '',
        bankAccountName: '',
        bankAccountNumber: '',
        bankName: '',
        city: '',
        district: '',
        identityNumber: '',
        linkBankAccountNumber: '',
        principalName: '',
        province: '',
        realName: '',
        sex: 0,

        // the following props are only for formRule
        area: false,
        backIdUploader: 'backIdUploader',
        frontIdUploader: 'frontIdUploader',
        licenseUploader: 'licenseUploader',
        licenseWithPersionUploader: 'licenseWithPersionUploader',
        authLetterUploader: 'authLetterUploader',
    };
    private readonly logoUploadParam: FileUploadParam = {
        scenario: FileAPIScenario.UploadUserLogo,
    } as FileUploadParam;

    private readonly frontUploadParam: FileUploadParam = {
        scenario: FileAPIScenario.UploadUserFrontId,
    } as FileUploadParam;

    private readonly backUploadParam: FileUploadParam = {
        scenario: FileAPIScenario.UploadUserBackId,
    } as FileUploadParam;
    private readonly licenseUploadParam: FileUploadParam = {
        scenario: FileAPIScenario.UploadLicense,
    } as FileUploadParam;
    private readonly licenseWithPersonUploadParam: FileUploadParam = {
        scenario: FileAPIScenario.UploadLicenseWithPerson,
    } as FileUploadParam;
    private readonly authLetterUploadParam: FileUploadParam = {
        scenario: FileAPIScenario.UploadAuthLetter,
    } as FileUploadParam;

    private isCorpUser: boolean = false;
    private isSubmitting: boolean = false;
    private isFrontIdImageChanged: boolean = false;
    private isBackIdImageChanged: boolean = false;
    private isLicenseImageChanged: boolean = false;
    private isLicenseWithPersonImageChanged: boolean = false;
    private isAuthLetterImageChanged: boolean = false;

    private isLogoImageChanged: boolean = false;
    private hasSubmitError: boolean = false;


    private get labelOfRealName(): string {
        return this.isCorpUser ? '公司名称' : '真实姓名';
    }
    private get labelOfIdNumber(): string {
        return this.isCorpUser ? '社会信用代码' : '身份证号码';
    }
    private get labelOfAddress(): string {
        return this.isCorpUser ? '公司地址' : '家庭或单位地址';
    }
    private get labelOfArea(): string {
        return this.isCorpUser ? '公司所在区域' : '家庭或单位所在区域';
    }

    private get labelOfFrontIdUploader(): string {
        return this.isCorpUser ? '负责人身份证正面照' : '手持身份证正面照';
    }
    private get labelOfBackIdUploader(): string {
        return this.isCorpUser ? '负责人身份证背面照' : '身份证背面照';
    }
    private get logoUid(): string {
        return this.storeState.sessionInfo.logoUid as string;
    }
    private get frontIdUid(): string {
        return this.storeState.sessionInfo.frontIdUid as string;
    }
    private get backIdUid(): string {
        return this.storeState.sessionInfo.backIdUid as string;
    }
    private get licenseUid(): string {
        return this.storeState.sessionInfo.licenseUid as string;
    }
    private get licenseWithPersonUid(): string {
        return this.storeState.sessionInfo.licenseWithPersonUid as string;
    }
    private get authLetterUid(): string {
        return this.storeState.sessionInfo.authLetterUid as string;
    }
    private get isIdBasicInfoChanged(): boolean {
        const updatedProps = this.getUpdatedIdInfoProps();
        return Object.keys(updatedProps).length > 0;
    }
    private readonly formRules: any = {
        address: [
            { required: true, message: '此处不能为空', trigger: 'blur' },
        ],
        bankName: [
            { required: true, message: '此处不能为空', trigger: 'blur' },
        ],
        bankAccountName: [
            { required: true, message: '此处不能为空', trigger: 'blur' },
        ],
        bankAccountNumber: [
            { required: true, message: '此处不能为空', trigger: 'blur' },
        ],

        identityNumber: [
            { required: true, message: '此处不能为空', trigger: 'blur' },
        ],
        principalName: [
            { required: true, message: '请输入负责人名称', trigger: 'blur' },
            { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' },
        ],
        realName: [
            { required: true, message: '请输入名称', trigger: 'blur' },
            { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' },
        ],
        sex: [{ required: true }],

        // rules for combined props
        area: [{ required: true }, {
            validator: (rule: any, value: string, callback: any) => {
                if (CommonUtils.isNullOrEmpty(this.formData.province)) {
                    callback('省份不能为空');
                    return;
                }
                if (CommonUtils.isNullOrEmpty(this.formData.city)) {
                    callback('市不能为空');
                    return;
                }
                if (CommonUtils.isNullOrEmpty(this.formData.district)) {
                    callback('区不能为空');
                    return;
                }
                callback();
            },
        }],
        backIdUploader: [{ required: true }, {
            validator: this.backIdValidation.bind(this),
        }],
        frontIdUploader: [{ required: true }, {
            validator: this.frontIdValidation.bind(this),
        }],
        licenseUploader: [{ required: true }, {
            validator: this.licenseValidation.bind(this),
        }],
        licenseWithPersionUploader: [{ required: true }, {
            validator: this.licenseWithPersonValidation.bind(this),
        }],
    };

    private get provinces(): string[] {
        const provinces: string[] = [];
        for (const item of locations) {
            provinces.push(item.name);
        }
        return provinces;
    }

    private get cities(): string[] {
        const cities: string[] = [];
        for (const pItem of locations) {
            if (this.formData.province === pItem.name) {
                for (const cItem of pItem.cities) {
                    cities.push(cItem.name);
                }
                break;
            }
        }
        return cities;
    }

    private get districts(): string[] {
        const districts: string[] = [];
        for (const pItem of locations) {
            if (this.formData.province === pItem.name) {
                for (const cItem of pItem.cities) {
                    if (cItem.name === this.formData.city) {
                        for (const dItem of cItem.districts) {
                            districts.push(dItem.name);
                        }
                        break;
                    }
                }
                break;
            }
        }
        return districts;
    }

    private onProvinceChanged(): void {
        this.formData.city = this.cities[0];
    }
    private onCityChanged(): void {
        this.formData.district = this.districts[0];
    }

    private isReadyToSubmit(): boolean {
        return !this.isSubmitting &&
            (this.isIdBasicInfoChanged ||
                this.isBackIdImageChanged ||
                this.isFrontIdImageChanged ||
                this.isAuthLetterImageChanged ||
                this.isLicenseImageChanged ||
                this.isLicenseWithPersonImageChanged ||
                this.isLogoImageChanged);
    }
    /**
     *  upload logo image with new user info
     */
    private onSubmitForm(): void {
        this.isSubmitting = true;
        this.hasSubmitError = false;
        (this.$refs[this.formRefName] as any).validate((valid: boolean) => {
            if (!valid) {
                this.isSubmitting = false;
                this.$message.warning('表单中包含不合格的内容');
                return;
            }

            const updatedProps = this.getUpdatedIdInfoProps();

            // update basic info
            if (Object.keys(updatedProps).length > 0) {
                (async () => {
                    const apiResult: ApiResult = await this.store.dispatch(
                        StoreActionNames.userBasicInfoEdit,
                        {
                            data: updatedProps,
                        } as IStoreActionArgs);

                    if (apiResult.code === ApiResultCode.Success) {
                        const userView = apiResult.data as UserView;
                        this.store.commit(StoreMutationNames.sessionInfoPropUpdate,
                            Object.assign({}, updatedProps, { idState: userView.idState } as UserView));
                    } else {
                        this.hasSubmitError = false;
                        this.$message.error(`提交失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
                    }
                    this.checkUploadState();
                })();
            }
            // update frontId
            if (this.isFrontIdImageChanged) {
                (this.$refs[this.frontUploaderRefName] as any as ISingleImageUploaderTS).submit();
            }

            // update backId
            if (this.isBackIdImageChanged) {
                (this.$refs[this.backUploaderRefName] as any as ISingleImageUploaderTS).submit();
            }
            // update auth letter
            if (this.isAuthLetterImageChanged) {
                (this.$refs[this.authLetterUploaderRefName] as any as ISingleImageUploaderTS).submit();
            }

            // update license
            if (this.isLicenseImageChanged) {
                (this.$refs[this.licenseUploaderRefName] as any as ISingleImageUploaderTS).submit();
            }
            // update licenseWithPerson
            if (this.isLicenseWithPersonImageChanged) {
                (this.$refs[this.licenseWithPersonUploaderRefName] as any as ISingleImageUploaderTS).submit();
            }

            // update logo
            if (this.isLogoImageChanged) {
                (this.$refs[this.logoUploaderRefName] as any as ISingleImageUploaderTS).submit();
            }
        });
    }
    private resetForm() {
        const confirm = this.$confirm(
            '确认清空所有填写的所有数据吗？',
            '提示', {
                confirmButtonText: '确定',
                type: 'warning',
                center: true,
                closeOnClickModal: false,
            });
        confirm.then(() => {
            (this.$refs[this.formRefName] as any).resetFields();
            this.formData.province = '';
            this.formData.city = '';
            this.formData.district = '';
            let uploaderRef: ISingleImageUploaderTS =
                this.$refs[this.frontUploaderRefName] as any as ISingleImageUploaderTS;
            if (uploaderRef != null) {
                uploaderRef.reset();
            }

            uploaderRef =
                this.$refs[this.backUploaderRefName] as any as ISingleImageUploaderTS;
            if (uploaderRef != null) {
                uploaderRef.reset();
            }

            uploaderRef =
                this.$refs[this.logoUploaderRefName] as any as ISingleImageUploaderTS;
            if (uploaderRef != null) {
                uploaderRef.reset();
            }

            uploaderRef =
                this.$refs[this.licenseUploaderRefName] as any as ISingleImageUploaderTS;
            if (uploaderRef != null) {
                uploaderRef.reset();
            }

            uploaderRef =
                this.$refs[this.licenseWithPersonUploaderRefName] as any as ISingleImageUploaderTS;
            if (uploaderRef != null) {
                uploaderRef.reset();
            }

            uploaderRef =
                this.$refs[this.authLetterUploaderRefName] as any as ISingleImageUploaderTS;
            if (uploaderRef != null) {
                uploaderRef.reset();
            }
        }).catch(() => {
            // do nothing for cancel
        });

    }
    private onLogoImageChanged(): void {
        const uploader: ISingleImageUploaderTS = (this.$refs[this.logoUploaderRefName] as any);
        this.isLogoImageChanged = uploader.isChanged();
        (this.$refs[this.logoUploaderItemRefName] as any).clearValidate();
    }
    private onLogoImageReset(): void {
        this.isLogoImageChanged = false;
    }
    private onLogoUploadSuccess(apiResult: ApiResult) {
        // do nothing
    }
    private onLogoUploadFailure(apiResult: ApiResult): void {
        this.hasSubmitError = true;
        this.isLogoImageChanged = false;
        this.$message.error(`Logo上传失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
    }
    private onFrontIdImageChanged(): void {
        const uploader: ISingleImageUploaderTS = (this.$refs[this.frontUploaderRefName] as any);
        this.isFrontIdImageChanged = uploader.isChanged();
        (this.$refs[this.frontUploaderItemRefName] as any).clearValidate();
    }
    private onFrontIdImageReset(): void {
        this.isFrontIdImageChanged = false;
        (this.$refs[this.frontUploaderItemRefName] as any).clearValidate();
    }
    private onFrontIdUploadSuccess(apiResult: ApiResult) {
        // do nothing
    }
    private onFrontIdUploadFailure(apiResult: ApiResult): void {
        this.hasSubmitError = true;
        this.isFrontIdImageChanged = false;
        this.$message.error(`身份证正面上传失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
    }
    private onBackIdImageChanged(): void {
        const uploader: ISingleImageUploaderTS = this.$refs[this.backUploaderRefName] as any;
        this.isBackIdImageChanged = uploader.isChanged();
        (this.$refs[this.backUploaderItemRefName] as any).clearValidate();
    }
    private onBackIdImageReset(): void {
        this.isBackIdImageChanged = false;
        (this.$refs[this.backUploaderItemRefName] as any).clearValidate();
    }
    private onBackIdUploadSuccess(apiResult: ApiResult) {
        // do nothing
    }
    private onBackIdUploadFailure(apiResult: ApiResult): void {
        this.hasSubmitError = true;
        this.isBackIdImageChanged = false;
        this.$message.error(`身份证背面上传失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
    }
    private onLicenseImageChanged(): void {
        const uploader: ISingleImageUploaderTS = this.$refs[this.licenseUploaderRefName] as any;
        this.isLicenseImageChanged = uploader.isChanged();
        (this.$refs[this.licenseUploaderItemRefName] as any).clearValidate();
    }
    private onLicenseImageReset(): void {
        this.isLicenseImageChanged = false;
        (this.$refs[this.licenseUploaderItemRefName] as any).clearValidate();
    }
    private onLicenseUploadSuccess(apiResult: ApiResult) {
        // do nothing
    }
    private onLicenseUploadFailure(apiResult: ApiResult): void {
        this.hasSubmitError = true;
        this.isLicenseImageChanged = false;
        this.$message.error(`营业执照上传失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
    }
    private onLicenseWithPersonImageChanged(): void {
        const uploader: ISingleImageUploaderTS = this.$refs[this.licenseWithPersonUploaderRefName] as any;
        this.isLicenseWithPersonImageChanged = uploader.isChanged();
        (this.$refs[this.licenseWithPersonUploaderItemRefName] as any as any).clearValidate();
    }
    private onLicenseWithPersonImageReset(): void {
        this.isLicenseWithPersonImageChanged = false;
        (this.$refs[this.licenseWithPersonUploaderItemRefName] as any).clearValidate();
    }
    private onLicenseWithPersonUploadSuccess(apiResult: ApiResult) {
        // do nothing
    }
    private onLicenseWithPersonUploadFailure(apiResult: ApiResult): void {
        this.hasSubmitError = true;
        this.isLicenseWithPersonImageChanged = false;
        this.$message.error(`负责人手持营业执照上传失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
    }
    private onAuthLetterImageChanged(): void {
        const uploader: ISingleImageUploaderTS = this.$refs[this.authLetterUploaderRefName] as any;
        this.isAuthLetterImageChanged = uploader.isChanged();
        (this.$refs[this.authLetterUploaderItemRefName] as any).clearValidate();
    }
    private onAuthLetterImageReset(): void {
        this.isAuthLetterImageChanged = false;
    }
    private onAuthLetterUploadSuccess(apiResult: ApiResult) {
        // do nothing
    }
    private onAuthLetterUploadFailure(apiResult: ApiResult): void {
        this.hasSubmitError = true;
        this.isAuthLetterImageChanged = false;
        this.$message.error(`授权文件上传失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
    }
    // #endregion


    // #region -- vue life-circle methods
    private mounted(): void {
        this.initialize();
    }
    // #endregion

    // region -- internal variables and methods
    private readonly store = (this.$store as Store<IStoreState>);
    private readonly storeState = (this.$store.state as IStoreState);
    @Watch('$store.state.sessionInfo', { immediate: true })
    private onSessionInfoChanged(currentValue: UserView, previousValue: UserView) {
        this.initialize();
    }
    @Watch('formData.city', { immediate: true })
    private onCityValueChanged(currentValue: string, previousValue: string) {
        this.formData.district = this.districts[0];
    }
    private initialize(): void {
        const sessionInfo = this.storeState.sessionInfo;
        if (sessionInfo.roles != null) {
            if (sessionInfo.type === UserType.Corp) {
                this.isCorpUser = true;
            } else {
                this.isCorpUser = false;
            }
            Object.keys(this.formData).forEach((item) => {
                if (sessionInfo[item] != null) {
                    (this.formData as any)[item] = sessionInfo[item];
                }
            });
        }
    }
    private getUpdatedIdInfoProps(): UserBasicInfoEditParam {
        const updatedProps: UserBasicInfoEditParam = {};
        const userViewKeys = Object.keys(new UserView(true));
        Object.keys(this.formData).forEach((item) => {
            if (userViewKeys.includes(item)) {
                if ((this.formData as any)[item] !== this.storeState.sessionInfo[item]) {
                    (updatedProps as any)[item] = (this.formData as any)[item];
                }
            } else {
                LoggerManager.warn(`Unknown Form Prop:${item} which is not in UserView`);
            }
        });

        return updatedProps;
    }
    private checkUploadState(): void {
        const sessionInfo = this.storeState.sessionInfo;
        if (
            this.isIdBasicInfoChanged === false &&
            this.isAuthLetterImageChanged === false &&
            this.isBackIdImageChanged === false &&
            this.isFrontIdImageChanged === false &&
            this.isLicenseImageChanged === false &&
            this.isLicenseWithPersonImageChanged === false &&
            this.isLogoImageChanged === false
        ) {
            this.isSubmitting = false;
            if (this.hasSubmitError === false) {
                this.$message.success('提交成功');
                this.$emit(EventNames.UploadSuccess);
            }
        }
    }

    private backIdValidation(rule: any, value: string, callback: any): void {
        if (CommonUtils.isNullOrEmpty(this.storeState.sessionInfo.backIdUid) &&
            !this.isBackIdImageChanged) {
            callback(`${this.labelOfBackIdUploader}不能为空`);
            return;
        }

        callback();
    }

    private frontIdValidation(rule: any, value: string, callback: any): void {
        if (CommonUtils.isNullOrEmpty(this.storeState.sessionInfo.frontIdUid) &&
            !this.isFrontIdImageChanged) {
            callback(`${this.labelOfFrontIdUploader}不能为空`);
            return;
        }

        callback();
    }
    private licenseValidation(rule: any, value: string, callback: any): void {
        if (CommonUtils.isNullOrEmpty(this.storeState.sessionInfo.licenseUid) &&
            !this.isLicenseImageChanged) {
            callback('营业执照不能为空');
            return;
        }

        callback();
    }
    private licenseWithPersonValidation(rule: any, value: string, callback: any): void {
        if (CommonUtils.isNullOrEmpty(this.storeState.sessionInfo.licenseWithPersonUid) &&
            !this.isLicenseWithPersonImageChanged) {
            callback('负责人手持营业执照不能为空');
            return;
        }

        callback();
    }
    // #endregion
}
