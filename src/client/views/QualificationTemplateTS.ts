import SingleFileUploadVue from 'client/components/SingleFileUploadVue.vue';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { StoreMutationNames } from 'client/VuexOperations/StoreMutationNames';
import { LIMIT_FILE_SIZE_M, ACCEPTED_UPLOAD_FILE_TYPES } from 'common/Constants';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { FileUploadParam } from 'common/requestParams/FileUploadParam';
import { ApiResult } from 'common/responseResults/APIResult';
import { Component, Vue } from 'vue-property-decorator';
import { Store } from 'vuex';
const compToBeRegistered: any = {
    SingleFileUploadVue,
};

@Component({
    components: compToBeRegistered,
})
export class QualificationTemplateTS extends Vue {
    // #region -- referred props and methods by this page
    private readonly filePostParam: FileUploadParam = new FileUploadParam();
    private qualificationFileTypes: string[] = ACCEPTED_UPLOAD_FILE_TYPES;
    private qualificationFileSizeMLimit: number = LIMIT_FILE_SIZE_M;
    private onSuccess(apiResult: ApiResult): void {
        this.store.commit(StoreMutationNames.sessionInfoPropUpdate, apiResult.data);
        this.$message.success('提交成功');
    }

    // #endregion


    // #region -- vue life-circle methods
    private mounted(): void {
        this.filePostParam.scenario = FileAPIScenario.UploadQualificationTemplate;
    }
    // #endregion

    // #region -- internal variables and methods
    private readonly store = (this.$store as Store<IStoreState>);
    private readonly storeState = (this.$store.state as IStoreState);

    // #endregion
}
