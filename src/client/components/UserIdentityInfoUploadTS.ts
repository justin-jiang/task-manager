import { ApiErrorHandler } from 'client/common/ApiErrorHandler';
import SingleImageUploaderVue from 'client/components/SingleImageUploaderVue.vue';
import { LoggerManager } from 'client/LoggerManager';
import { IStoreActionArgs } from 'client/VuexOperations/IStoreActionArgs';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { StoreActionNames } from 'client/VuexOperations/StoreActionNames';
import { StoreMutationNames } from 'client/VuexOperations/StoreMutationNames';
import { CheckState } from 'common/CheckState';
import { CommonUtils } from 'common/CommonUtils';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { FileType } from 'common/FileType';
import { locations } from 'common/locations';
import { FileUploadParam } from 'common/requestParams/FileUploadParam';
import { UserBasicInfoEditParam } from 'common/requestParams/UserBasicInfoEditParam';
import { ApiResult } from 'common/responseResults/APIResult';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { UserView } from 'common/responseResults/UserView';
import { UserType } from 'common/UserTypes';
import { Component, Vue, Watch } from 'vue-property-decorator';
import { Store } from 'vuex';
import { ComponentUtils } from './ComponentUtils';
import { ISingleImageUploaderTS } from './SingleImageUploaderTS';
interface IFormData {
    realName?: string;
    sex?: number;
    idNumber?: string;
    address?: string;
    province?: string;
    city?: string;
    district?: string;
    area?: boolean;
    authLetterUrl?: string;
    backIdUrl?: string;
    frontIdUrl?: string;
    licenseUrl?: string;
    licenseWithUrl?: string;
    backIdUploader?: string;
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

    // #region -- referred props and methods by Vue Page
    private readonly formRefName: string = 'uploadForm';
    private readonly frontUploaderRefName: string = 'frontUploader';

    private readonly backUploaderRefName: string = 'backUploader';

    private readonly licenseUploaderRefName: string = 'licenseloader';
    private readonly licenseWithPersonUploaderRefName: string = 'licenseWithPersonloader';
    private readonly authLetterUploaderRefName: string = 'authLetterloader';

    private isInitialized: boolean = false;


    private readonly formDatas: IFormData = {
        realName: '',
        sex: -1,
        idNumber: '',
        address: '',
        province: '',
        city: '',
        district: '',
        area: false,
        backIdUrl: '',
        authLetterUrl: '',
        frontIdUrl: '',
        licenseUrl: '',
        licenseWithUrl: '',
    };
    private readonly frontUploadParam: FileUploadParam = {
        scenario: FileAPIScenario.UpdateUserFrontId,
    } as FileUploadParam;

    private readonly backUploadParam: FileUploadParam = {
        scenario: FileAPIScenario.UpdateUserBackId,
    } as FileUploadParam;
    private readonly licenseUploadParam: FileUploadParam = {
        scenario: FileAPIScenario.UpdateLicense,
    } as FileUploadParam;
    private readonly licenseWithPersonUploadParam: FileUploadParam = {
        scenario: FileAPIScenario.UpdateLicenseWithPersion,
    } as FileUploadParam;
    private readonly authLetterUploadParam: FileUploadParam = {
        scenario: FileAPIScenario.UpdateAuthLetter,
    } as FileUploadParam;

    private isCorpUser: boolean = false;
    private isSubmitting: boolean = false;
    private isFrontIdImageChanged: boolean = false;
    private isBackIdImageChanged: boolean = false;
    private isLicenseImageChanged: boolean = false;
    private isLicenseWithPersonImageChanged: boolean = false;
    private isAuthLetterImageChanged: boolean = false;


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
    private get isIdInfoChanged(): boolean {
        const updatedProps = this.getUpdatedIdInfoProps();
        return Object.keys(updatedProps).length > 0;
    }
    private readonly formRules: any = {
        realName: [
            { required: true, message: '请输入名称', trigger: 'blur' },
            { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' },
        ],
        idNumber: [
            { required: true, message: '请输入身份证号码', trigger: 'blur' },

        ],
        address: [
            { required: true, message: '请输入地址', trigger: 'blur' },

        ],
        sex: [{ required: true }],
        area: [{ required: true }, {
            validator: (rule: any, value: string, callback: any) => {
                if (CommonUtils.isNullOrEmpty(this.formDatas.province)) {
                    callback('省份不能为空');
                    return;
                }
                if (CommonUtils.isNullOrEmpty(this.formDatas.city)) {
                    callback('市不能为空');
                    return;
                }
                if (CommonUtils.isNullOrEmpty(this.formDatas.district)) {
                    callback('区不能为空');
                    return;
                }
                callback();
            },
        }],
        backIdUploader: [{ required: true }, {
            validator: this.backIdUrlValidation.bind(this),
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
            if (this.formDatas.province === pItem.name) {
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
            if (this.formDatas.province === pItem.name) {
                for (const cItem of pItem.cities) {
                    if (cItem.name === this.formDatas.city) {
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

    private isReadyToSubmit(): boolean {
        return !this.isSubmitting &&
            (this.isIdInfoChanged ||
                this.isBackIdImageChanged ||
                this.isFrontIdImageChanged ||
                this.isAuthLetterImageChanged ||
                this.isLicenseImageChanged ||
                this.isLicenseWithPersonImageChanged);
    }
    /**
     *  upload logo image with new user info
     */
    private onSubmitForm(): void {
        this.isSubmitting = true;
        (this.$refs[this.formRefName] as any).validate((valid: boolean) => {
            if (!valid) {
                this.isSubmitting = false;
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
                        this.store.commit(StoreMutationNames.sessionInfoPropUpdate, updatedProps);
                    } else {
                        this.$message.error(`身份信息更新失败：${ApiErrorHandler.getTextByCode(apiResult.code)}`);
                    }
                    this.isSubmitting = false;
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
        });
    }
    private resetForm() {
        (this.$refs[this.formRefName] as any).resetFields();
        if (this.$refs[this.frontUploaderRefName] != null) {
            (this.$refs[this.frontUploaderRefName] as any as ISingleImageUploaderTS).reset();
        }
        if (this.$refs[this.backUploaderRefName] != null) {
            (this.$refs[this.backUploaderRefName] as any as ISingleImageUploaderTS).reset();
        }
    }

    private onFrontIdImageChanged(): void {
        this.isFrontIdImageChanged = true;
    }
    private onFrontIdUploadSuccess(apiResult: ApiResult) {
        this.handleImageUploadSucess(FileType.FrontId, apiResult);
    }
    private onFrontIdUploadFailure(apiResult: ApiResult): void {
        this.isSubmitting = false;
    }
    private onBackIdImageChanged(): void {
        this.isBackIdImageChanged = true;
    }
    private onBackIdUploadSuccess(apiResult: ApiResult) {
        this.handleImageUploadSucess(FileType.BackId, apiResult);
    }
    private onBackIdUploadFailure(apiResult: ApiResult): void {
        this.isSubmitting = false;
    }
    private onLicenseImageChanged(): void {
        this.isLicenseImageChanged = true;
    }
    private onLicenseUploadSuccess(apiResult: ApiResult) {
        this.handleImageUploadSucess(FileType.License, apiResult);
    }
    private onLicenseUploadFailure(apiResult: ApiResult): void {
        this.isSubmitting = false;
    }
    private onLicenseWithPersonImageChanged(): void {
        this.isLicenseWithPersonImageChanged = true;
    }
    private onLicenseWithPersonUploadSuccess(apiResult: ApiResult) {
        this.handleImageUploadSucess(FileType.LicenseWithPerson, apiResult);
    }
    private onLicenseWithPersonUploadFailure(apiResult: ApiResult): void {
        this.isSubmitting = false;
    }
    private onAuthLetterImageChanged(): void {
        this.isAuthLetterImageChanged = true;
    }
    private onAuthLetterUploadSuccess(apiResult: ApiResult) {
        this.handleImageUploadSucess(FileType.AuthLetter, apiResult);
    }
    private onAuthLetterUploadFailure(apiResult: ApiResult): void {
        this.isSubmitting = false;
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
        if (this.isInitialized === false) {
            this.initialize();
        }
    }
    private initialize(): void {
        const sessionInfo = this.storeState.sessionInfo;
        if (sessionInfo.roles != null) {
            if (sessionInfo.type === UserType.Corp) {
                this.isCorpUser = true;
            } else {
                this.isCorpUser = false;
            }

            this.formDatas.address = sessionInfo.address;
            this.formDatas.idNumber = sessionInfo.identityNumber;
            this.formDatas.realName = sessionInfo.realName;
            this.formDatas.province = sessionInfo.province;
            this.formDatas.city = sessionInfo.city;
            this.formDatas.district = sessionInfo.district;
            if (!this.isCorpUser) {
                this.formDatas.sex = sessionInfo.sex;
                if (this.formDatas.sex == null) {
                    this.formDatas.sex = 0;
                }
            }

            this.isInitialized = true;
        }
    }
    private getUpdatedIdInfoProps(): UserBasicInfoEditParam {
        const updatedProps: UserBasicInfoEditParam = {};
        if (this.formDatas.realName !== this.storeState.sessionInfo.realName) {
            updatedProps.realName = this.formDatas.realName;
        }
        if (this.formDatas.address !== this.storeState.sessionInfo.address) {
            updatedProps.address = this.formDatas.address;
        }
        if (this.formDatas.idNumber !== this.storeState.sessionInfo.identityNumber) {
            updatedProps.identityNumber = this.formDatas.idNumber;
        }
        if (this.formDatas.province !== this.storeState.sessionInfo.province) {
            updatedProps.province = this.formDatas.province;
        }
        if (this.formDatas.city !== this.storeState.sessionInfo.city) {
            updatedProps.city = this.formDatas.city;
        }
        if (this.formDatas.district !== this.storeState.sessionInfo.district) {
            updatedProps.district = this.formDatas.district;
        }

        if (!this.isCorpUser) {
            if (this.formDatas.sex !== this.storeState.sessionInfo.sex) {
                updatedProps.sex = this.formDatas.sex;
            }
        }
        return updatedProps;
    }
    private checkUploadState(): void {
        const sessionInfo = this.storeState.sessionInfo;
        if (
            (sessionInfo.frontIdState === CheckState.ToBeChecked ||
                sessionInfo.frontIdState === CheckState.Checked) &&
            (sessionInfo.backIdState === CheckState.ToBeChecked ||
                sessionInfo.backIdState === CheckState.Checked)
        ) {
            this.$message.success('身份信息更新成功');
            this.$emit(EventNames.UploadSuccess);
        }
    }
    private handleImageUploadSucess(fileType: FileType, apiResult: ApiResult) {
        (async () => {
            const userView: UserView = apiResult.data;
            let imageId: string;
            let scenario: FileAPIScenario;
            const updatedProps: UserView = {};
            switch (fileType) {
                case FileType.AuthLetter:
                    imageId = userView.authLetterUid as string;
                    scenario = FileAPIScenario.DownloadAuthLetter;
                    updatedProps.authLetterUrl = await ComponentUtils.$$getImageUrl(
                        this, imageId, scenario);
                    this.isAuthLetterImageChanged = false;
                    break;
                case FileType.BackId:
                    imageId = userView.backIdUid as string;
                    scenario = FileAPIScenario.DownloadBackId;
                    updatedProps.backIdUrl = await ComponentUtils.$$getImageUrl(
                        this, imageId, scenario);
                    this.isBackIdImageChanged = false;
                    break;
                case FileType.FrontId:
                    imageId = userView.frontIdUid as string;
                    scenario = FileAPIScenario.DownloadFrontId;
                    updatedProps.frondIdUrl = await ComponentUtils.$$getImageUrl(
                        this, imageId, scenario);
                    this.isFrontIdImageChanged = false;
                    break;
                case FileType.License:
                    imageId = userView.licenseUid as string;
                    scenario = FileAPIScenario.DownloadLicense;
                    updatedProps.licenseUrl = await ComponentUtils.$$getImageUrl(
                        this, imageId, scenario);
                    this.isLicenseImageChanged = false;
                    break;
                case FileType.LicenseWithPerson:
                    imageId = userView.licenseWithPersonUid as string;
                    scenario = FileAPIScenario.DownloadLinceWithPerson;
                    updatedProps.licenseWithPersonUrl = await ComponentUtils.$$getImageUrl(
                        this, imageId, scenario);
                    this.isLicenseWithPersonImageChanged = false;
                    break;
                default:
                    LoggerManager.error(`unsupported filetype:${fileType}`);
                    return;
            }

            this.store.commit(StoreMutationNames.sessionInfoPropUpdate, updatedProps);
            this.isSubmitting = false;
            this.checkUploadState();
        })();
    }

    private backIdUrlValidation(rule: any, value: string, callback: any): void {
        if (CommonUtils.isNullOrEmpty(this.storeState.sessionInfo.backIdUid) &&
            !this.isBackIdImageChanged) {
            callback(`${this.labelOfBackIdUploader}不能为空`);
            return;
        }

        callback();
    }
    // #endregion
}
