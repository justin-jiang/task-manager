import { ITemplatePostParam } from 'common/requestParams/ITemplatePostParam';
import { ITemplateView } from 'common/responseResults/ITemplateView';
import { TemplateModelWrapper } from '../dataModels/TemplateModelWrapper';

export class TemplateRequestHandler {
    public static async $$createTemplate(postParam: ITemplatePostParam): Promise<ITemplateView> {
        const modelWrapper: TemplateModelWrapper = new TemplateModelWrapper();
        Object.keys(postParam).forEach((key: string) => {
            modelWrapper[key] = postParam[key];
        });
        await modelWrapper.$$save();
        const result: ITemplateView = {} as any;
        result.uid = modelWrapper.uid;
        result.name = modelWrapper.name;
        result.note = modelWrapper.note;
        result.templateFileId = modelWrapper.templateFileId;
        return result;
    }
}
