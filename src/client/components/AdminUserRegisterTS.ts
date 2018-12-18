import { UserRole } from '@/common/CommonTypes';
import { CommonUtils } from '@/common/CommonUtils';
import { API_PATH_API, API_PATH_FILE, UPLOAD_TYPE_FILE } from '@/common/Constants';
import { IFilePostParam } from '@/common/requestParams/IFilePostParam';
import { IUserPostParam } from '@/common/requestParams/IUserPostParam';
import { ApiResultCode } from '@/common/responseResults/ApiResultCode';
import { IAPIResult } from '@/common/responseResults/IAPIResult';
import VueCropper from 'vue-cropperjs';
import { Component, Vue } from 'vue-property-decorator';
import { Store } from 'vuex';
import { LoggerManager } from '../LoggerManager';
import { IStoreActionArgs } from '../VuexOperations/IStoreActionArgs';
import { IAdminStoreState } from '../VuexOperations/IStoreState';
import { StoreActionNames } from '../VuexOperations/StoreActionNames';


// data format for the Form
interface IFormData {
    name?: string;
    password?: string;
    confirmPassword?: string;
    email?: string;
    telephone?: string;
    logoBlob?: Blob;
}

const compToBeRegistered: any = {
    VueCropper,
};

@Component({
    components: compToBeRegistered,
})
export class AdminUserRegisterTS extends Vue {
    // #region -- referred props and methods by Vue Page
    private readonly formRefName: string = 'registerForm';
    private readonly uploaderRefName: string = 'logoUploader';
    private readonly keyNameOfuploadedFile: string = UPLOAD_TYPE_FILE;
    // the model of form
    private readonly formDatas: IFormData = {};

    private readonly filePostParam: IFilePostParam = {
        entryId: CommonUtils.getUUIDForMongoDB(),
        version: 0,
    };

    // logoUrl used to show log in client
    private logoUrl?: string = '';
    private cropDialogVisible: boolean = false;
    private isSubmitting: boolean = false;

    private readonly uploadURL = `${API_PATH_API}/${API_PATH_FILE}`;

    private readonly formRules: any = {
        name: [
            { validator: this.checkName, trigger: 'blur' },
        ],
        password: [
            { validator: this.validatePassword, trigger: 'blur' },
        ],

        confirmPassword: [
            { validator: this.validateConfirmPassword, trigger: 'blur' },
        ],
        email: [
            { validator: this.checkEmail, trigger: 'blur' },
        ],
    };
    /**
     * 1, firstly upload logo image
     * 2, if step 1 succeeds, create the admin user
     */
    private onSubmitForm() {
        (this.$refs[this.formRefName] as any).validate((valid: boolean) => {
            if (this.formDatas.logoBlob == null) {
                this.$message.warning('请选择头像');
                return false;
            }
            if (valid) {
                this.isSubmitting = true;
                (this.$refs[this.uploaderRefName] as any).submit();
                return true;
            } else {
                this.$message.warning('提交内容不合格，请检测表单是否填写正确');
                return false;
            }
        });
    }
    private resetForm() {
        this.cropDialogVisible = false;
        this.logoUrl = undefined;
        (this.$refs[this.formRefName] as any).resetFields();
    }
    private onLogoCropDone() {
        this.logoUrl = (this.$refs.cropper as any).getCroppedCanvas().toDataURL();
        const canvas: HTMLCanvasElement = (this.$refs.cropper as any).getCroppedCanvas();
        canvas.toBlob((blob: Blob) => {
            if (blob != null) {
                this.formDatas.logoBlob = blob;
            } else {
                this.$message.error('获取切图区域失败，请重试');
            }

            this.cropDialogVisible = false;
        });

    }
    private onLogoChange(file: any, fileList: any) {
        this.logoUrl = URL.createObjectURL(file.raw);
        if (this.formDatas.logoBlob == null) {
            this.cropDialogVisible = true;
        }
    }
    private beforeLogoUpload(file: File) {
        const isJPG = file.type === 'image/jpeg';
        const isLt2M = file.size / 1024 / 1024 < 2;

        if (!isJPG) {
            this.$message.error('上传头像图片只能是 JPG 格式!');
        }
        if (!isLt2M) {
            this.$message.error('上传头像图片大小不能超过 2MB!');
        }
        return isJPG && isLt2M;
    }
    private onLogoFileUploadDone(response: IAPIResult, file: { raw: File }, fileList: Array<{ raw: File }>) {
        if (response.code !== ApiResultCode.Success) {
            this.$message.error(`上传头像失败，失败代码：${response.code}`);
            return;
        }

        // after uploading logo, creating the admin user
        const store = (this.$store as Store<IAdminStoreState>);
        (async () => {
            const userPostParam: IUserPostParam = {
                name: this.formDatas.name as string,
                password: this.formDatas.password as string,
                email: this.formDatas.email as string,
                telephone: this.formDatas.telephone as string,
                logoId: this.filePostParam.entryId as string,
                roles: [UserRole.Admin],
            };
            const apiResult: IAPIResult = await store.dispatch(
                StoreActionNames.createUser, { data: userPostParam } as IStoreActionArgs);
            if (apiResult != null && apiResult.code === ApiResultCode.Success) {
                this.$message.success('管理员注册成功');
                this.$emit('success', userPostParam);
            } else {
                const errStr: string = `注册失败（失败代码:${apiResult.code}）`;
                this.$message.error(errStr);
                LoggerManager.error(errStr);
            }
        })().catch((ex) => {
            this.$message.error('注册失败');
        }).finally(() => {
            this.isSubmitting = false;
        });
    }
    private onLogoFileUploadError(err: Error, file: { raw: File }, fileList: Array<{ raw: File }>) {
        this.$message.error('上传头像失败，请查看网络是否正常');
        LoggerManager.error('template upload error', err);
    }
    // #endregion


    private validatePassword(rule: any, value: string, callback: any) {
        if (value === '') {
            callback(new Error('请输入密码'));
        } else {
            if (this.formDatas.confirmPassword != null && this.formDatas.confirmPassword !== '') {
                (this.$refs[this.formRefName] as any).validateField('confirmPassword');
            }
            callback();
        }
    }

    private validateConfirmPassword(rule: any, value: string, callback: any) {
        if (value === '') {
            callback(new Error('请再次输入密码'));
        } else if (value !== this.formDatas.password) {
            callback(new Error('两次输入密码不一致!'));
        } else {
            callback();
        }
    }

    private checkEmail(rule: any, value: string, callback: any) {
        if (!value) {
            return callback(new Error('电子邮箱不能为空'));
        } else {
            // tslint:disable-next-line:max-line-length
            const emailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (emailPattern.test(value)) {
                callback();
            } else {
                callback(new Error('电子邮箱格式不正确'));
            }
        }
    }
    private checkName(rule: any, value: string, callback: any) {
        if (!value) {
            return callback(new Error('账号名称不能为空'));
        } else {
            callback();
        }
    }

    private checkLogo(rule: any, value: string, callback: any) {
        if (value == null) {
            return callback(new Error('获取头像信息失败'));
        } else {
            callback();
        }
    }
}
