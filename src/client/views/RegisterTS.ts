import { CommonUtils } from '@/common/CommonUtils';
import { IFilePostParam } from '@/common/requestParams/IFilePostParam';
import { IUserPostParam } from '@/common/requestParams/IUserPostParam';
import { ApiResultCode } from '@/common/responseResults/ApiResultCode';
import { IAPIResult } from '@/common/responseResults/IAPIResult';
import VueCropper from 'vue-cropperjs';
import { Component, Vue } from 'vue-property-decorator';
import { Store } from 'vuex';
import { IStoreActionArgs } from '../VuexOperations/IStoreActionArgs';
import { IAdminStoreState } from '../VuexOperations/IStoreState';
import { StoreActionNames } from '../VuexOperations/StoreActionNames';
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
export class RegisterTS extends Vue {
    // #region -- referred props and methods by Vue Page
    private readonly formRefName = 'registerForm';
    private readonly formDatas: IFormData = {};

    private logoUrl: string = '';
    private dialogVisible: boolean = false;
    private submitting: boolean = false;

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
        logoBlob: [
            { validator: this.checkLogo, trigger: 'blur' },
        ],
    };
    private submitForm() {
        (this.$refs[this.formRefName] as any).validate((valid: boolean) => {
            if (valid) {
                this.submitting = true;
                const store = (this.$store as Store<IAdminStoreState>);
                (async () => {

                    const filePostParam: IFilePostParam = {
                        entryId: CommonUtils.getUUIDForMongoDB(),
                        version: 0,
                    };

                    let apiResult: IAPIResult = await store.dispatch(
                        StoreActionNames.uploadFile, { data: filePostParam });
                    if (apiResult != null && apiResult.code === ApiResultCode.Success) {
                        const userPostParam: IUserPostParam = {
                            name: this.formDatas.name as string,
                            password: this.formDatas.password as string,
                            email: this.formDatas.email as string,
                            telephone: this.formDatas.telephone as string,
                            logoId: filePostParam.entryId as string,
                            roles: [],
                        };
                        apiResult = await store.dispatch(
                            StoreActionNames.createUser, { data: userPostParam } as IStoreActionArgs);
                        if (apiResult != null && apiResult.code === ApiResultCode.Success) {
                            this.$message({
                                message: '注册成功',
                                type: 'success',
                            });
                        } else {
                            this.$message({
                                message: `注册失败（失败代码:${apiResult.code}）`,
                                type: 'error',
                            });
                        }
                    }

                })().catch((ex) => {
                    this.$message({
                        message: '提交失败',
                        type: 'error',
                    });
                }).finally(() => {
                    this.submitting = false;
                });

            } else {
                this.$message({
                    message: '提交前，请检测表单是否填写正确',
                    type: 'warning',
                });
                return false;
            }
        });
    }
    private resetForm() {
        this.dialogVisible = false;
        // this.logoUrl = (this.$refs.cropper as any).getCroppedCanvas().toDataURL();
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

            this.dialogVisible = false;
        });

    }
    private onLogoChange(file: any, fileList: any) {
        this.logoUrl = URL.createObjectURL(file.raw);
        this.dialogVisible = true;
    }
    private beforeAvatarUpload(file: any) {
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
