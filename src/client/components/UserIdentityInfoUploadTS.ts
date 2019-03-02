import { ApiErrorHandler } from 'client/common/ApiErrorHandler';
import SingleImageUploaderVue from 'client/components/SingleImageUploaderVue.vue';
import { LoggerManager } from 'client/LoggerManager';
import { IStoreActionArgs } from 'client/VuexOperations/IStoreActionArgs';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { StoreActionNames } from 'client/VuexOperations/StoreActionNames';
import { StoreMutationNames } from 'client/VuexOperations/StoreMutationNames';
import { CommonUtils } from 'common/CommonUtils';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { FileType } from 'common/FileType';
import { locations } from 'common/Locations';
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
    // individual real name or corp name
    realName?: string;
    // the principal name of corp
    principalName?: string;
    sex?: number;
    // the indivial id number or corp crdential number
    identityNumber?: string;
    address?: string;
    province?: string;
    city?: string;
    district?: string;
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

    // #region -- referred props and methods by Vue Page
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
    private readonly authLetterUploaderRefName: string = 'authLetterloader';

    private readonly formDatas: IFormData = {
        realName: '',
        sex: 0,
        identityNumber: '',
        address: '',
        province: '',
        city: '',
        district: '',
        area: false,
        principalName: '',
        backIdUploader: 'backIdUploader',
        frontIdUploader: 'frontIdUploader',
        licenseUploader: 'licenseUploader',
        licenseWithPersionUploader: 'licenseWithPersionUploader',
        authLetterUploader: 'authLetterUploader',
    };
    private readonly logoUploadParam: FileUploadParam = {
        scenario: FileAPIScenario.UpdateUserLogo,
    } as FileUploadParam;

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
        realName: [
            { required: true, message: '请输入名称', trigger: 'blur' },
            { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' },
        ],
        principalName: [
            { required: true, message: '请输入负责人名称', trigger: 'blur' },
            { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' },
        ],
        identityNumber: [
            { required: true, message: '此处不能为空', trigger: 'blur' },
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
            this.formDatas.province = '';
            this.formDatas.city = '';
            this.formDatas.district = '';
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
        this.isLogoImageChanged = true;
    }
    private onLogoImageReset(): void {
        this.isLogoImageChanged = false;
    }
    private onLogoUploadSuccess(apiResult: ApiResult) {
        this.handleImageUploadSucess(FileType.UserLogo, apiResult);
    }
    private onLogoUploadFailure(apiResult: ApiResult): void {
        this.hasSubmitError = true;
        this.isLogoImageChanged = false;
        this.$message.error(`Logo上传失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
    }
    private onFrontIdImageChanged(): void {
        this.isFrontIdImageChanged = true;
        (this.$refs[this.frontUploaderItemRefName] as any).clearValidate();
    }
    private onFrontIdImageReset(): void {
        this.isFrontIdImageChanged = false;
        (this.$refs[this.frontUploaderItemRefName] as any).clearValidate();
    }
    private onFrontIdUploadSuccess(apiResult: ApiResult) {
        this.handleImageUploadSucess(FileType.FrontId, apiResult);
    }
    private onFrontIdUploadFailure(apiResult: ApiResult): void {
        this.hasSubmitError = true;
        this.isFrontIdImageChanged = false;
        this.$message.error(`身份证正面上传失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
    }
    private onBackIdImageChanged(): void {
        this.isBackIdImageChanged = true;
        (this.$refs[this.backUploaderItemRefName] as any).clearValidate();
    }
    private onBackIdImageReset(): void {
        this.isBackIdImageChanged = false;
        (this.$refs[this.backUploaderItemRefName] as any).clearValidate();
    }
    private onBackIdUploadSuccess(apiResult: ApiResult) {
        this.handleImageUploadSucess(FileType.BackId, apiResult);
    }
    private onBackIdUploadFailure(apiResult: ApiResult): void {
        this.hasSubmitError = true;
        this.isBackIdImageChanged = false;
        this.$message.error(`身份证背面上传失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
    }
    private onLicenseImageChanged(): void {
        this.isLicenseImageChanged = true;
        (this.$refs[this.licenseUploaderItemRefName] as any).clearValidate();
    }
    private onLicenseImageReset(): void {
        this.isLicenseImageChanged = false;
        (this.$refs[this.licenseUploaderItemRefName] as any).clearValidate();
    }
    private onLicenseUploadSuccess(apiResult: ApiResult) {
        this.handleImageUploadSucess(FileType.License, apiResult);
    }
    private onLicenseUploadFailure(apiResult: ApiResult): void {
        this.hasSubmitError = true;
        this.isLicenseImageChanged = false;
        this.$message.error(`营业执照上传失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
    }
    private onLicenseWithPersonImageChanged(): void {
        this.isLicenseWithPersonImageChanged = true;
        (this.$refs[this.licenseWithPersonUploaderItemRefName] as any).clearValidate();
    }
    private onLicenseWithPersonImageReset(): void {
        this.isLicenseWithPersonImageChanged = false;
        (this.$refs[this.licenseWithPersonUploaderItemRefName] as any).clearValidate();
    }
    private onLicenseWithPersonUploadSuccess(apiResult: ApiResult) {
        this.handleImageUploadSucess(FileType.LicenseWithPerson, apiResult);
    }
    private onLicenseWithPersonUploadFailure(apiResult: ApiResult): void {
        this.hasSubmitError = true;
        this.isLicenseWithPersonImageChanged = false;
        this.$message.error(`负责人手持营业执照上传失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
    }
    private onAuthLetterImageChanged(): void {
        this.isAuthLetterImageChanged = true;
    }
    private onAuthLetterImageReset(): void {
        this.isAuthLetterImageChanged = false;
    }
    private onAuthLetterUploadSuccess(apiResult: ApiResult) {
        this.handleImageUploadSucess(FileType.AuthLetter, apiResult);
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
    private initialize(): void {
        const sessionInfo = this.storeState.sessionInfo;
        if (sessionInfo.roles != null) {
            if (sessionInfo.type === UserType.Corp) {
                this.isCorpUser = true;
            } else {
                this.isCorpUser = false;
            }
            Object.keys(this.formDatas).forEach((item) => {
                if (sessionInfo[item] != null) {
                    (this.formDatas as any)[item] = sessionInfo[item];
                }
            });
        }
    }
    private getUpdatedIdInfoProps(): UserBasicInfoEditParam {
        const updatedProps: UserBasicInfoEditParam = {};
        const userViewKeys = Object.keys(new UserView(true));
        Object.keys(this.formDatas).forEach((item) => {
            if (userViewKeys.includes(item)) {
                if ((this.formDatas as any)[item] !== this.storeState.sessionInfo[item]) {
                    (updatedProps as any)[item] = (this.formDatas as any)[item];
                }
            } else {
                LoggerManager.debug(`Unknown Form Prop:${item} which is not in UserView`);
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
    private handleImageUploadSucess(fileType: FileType, apiResult: ApiResult) {
        (async () => {
            const userView: UserView = apiResult.data;
            let imageUid: string;
            let scenario: FileAPIScenario;
            const updatedProps: UserView = {};
            updatedProps.idState = userView.idState;
            switch (fileType) {
                case FileType.AuthLetter:
                    imageUid = userView.authLetterUid as string;
                    scenario = FileAPIScenario.DownloadAuthLetter;
                    updatedProps.authLetterUrl = await ComponentUtils.$$getImageUrl(
                        this, imageUid, scenario);
                    this.isAuthLetterImageChanged = false;
                    break;
                case FileType.BackId:
                    imageUid = userView.backIdUid as string;
                    scenario = FileAPIScenario.DownloadBackId;
                    updatedProps.backIdUrl = await ComponentUtils.$$getImageUrl(
                        this, imageUid, scenario);
                    this.isBackIdImageChanged = false;
                    break;
                case FileType.FrontId:
                    imageUid = userView.frontIdUid as string;
                    scenario = FileAPIScenario.DownloadFrontId;
                    updatedProps.frondIdUrl = await ComponentUtils.$$getImageUrl(
                        this, imageUid, scenario);
                    this.isFrontIdImageChanged = false;
                    break;
                case FileType.License:
                    imageUid = userView.licenseUid as string;
                    scenario = FileAPIScenario.DownloadLicense;
                    updatedProps.licenseUrl = await ComponentUtils.$$getImageUrl(
                        this, imageUid, scenario);
                    this.isLicenseImageChanged = false;
                    break;
                case FileType.LicenseWithPerson:
                    imageUid = userView.licenseWithPersonUid as string;
                    scenario = FileAPIScenario.DownloadLinceWithPerson;
                    updatedProps.licenseWithPersonUrl = await ComponentUtils.$$getImageUrl(
                        this, imageUid, scenario);
                    this.isLicenseWithPersonImageChanged = false;
                    break;
                case FileType.UserLogo:
                    imageUid = userView.logoUid as string;
                    scenario = FileAPIScenario.DownloadUserLogo;
                    updatedProps.logoUrl = await ComponentUtils.$$getImageUrl(
                        this, imageUid, scenario);
                    this.isLogoImageChanged = false;
                    break;
                default:
                    LoggerManager.error(`unsupported filetype:${fileType}`);
                    return;
            }
            Object.assign(userView, updatedProps);
            this.store.commit(StoreMutationNames.sessionInfoPropUpdate, userView);
            this.checkUploadState();
        })();
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
