import { CommonUtils } from 'common/CommonUtils';
import { IQueryConditions } from 'common/IQueryConditions';
import { TemplateCreateParam } from 'common/requestParams/TemplateCreateParam';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { ITemplateView, keysOfITemplateView, TemplateView } from 'common/responseResults/TemplateView';
import { ApiError } from 'server/common/ApiError';
import { TemplateObject } from 'server/dataObjects/TemplateObject';
import { LoggerManager } from 'server/libsWrapper/LoggerManager';
import { TemplateModelWrapper } from '../dataModels/TemplateModelWrapper';
import { TemplateEditParam } from 'common/requestParams/TemplateEditParam';

export class TemplateRequestHandler {
    public static async $$create(reqParam: TemplateCreateParam): Promise<TemplateView> {
        let dbObj: TemplateObject = new TemplateObject();
        dbObj.assembleFromReqParam(reqParam);
        if (CommonUtils.isNullOrEmpty(dbObj.name)) {
            throw new ApiError(ApiResultCode.INPUT_VALIDATE_INVALID_PARAM,
                'template name should not be null or empty on template creation');
        }
        dbObj.version = 0;
        dbObj.templateFileId = CommonUtils.getUUIDForMongoDB();

        dbObj = await TemplateModelWrapper.$$create(dbObj) as TemplateObject;
        const view: TemplateView = new TemplateView();
        view.assembleFromDBObject(dbObj);
        return view;
    }

    public static async $$find(conditions: IQueryConditions): Promise<ITemplateView[]> {
        const dbObjs: TemplateObject[] = await TemplateModelWrapper.$$find(conditions) as TemplateObject[];
        const views: ITemplateView[] = [];
        dbObjs.forEach((obj: TemplateObject) => {
            views.push(this.convertToTemplateView(obj));
        });
        return views;
    }

    public static async $$updateOne(reqParam: TemplateEditParam): Promise<void> {
        const dbObj: TemplateObject = {
            uid: reqParam.uid,
        } as TemplateObject;
        if (reqParam.name != null) {
            dbObj.name = reqParam.name;
        }
        if (reqParam.note != null) {
            dbObj.note = reqParam.note;
        }

        TemplateModelWrapper.$$updateOne(dbObj);
    }

    public static async $$deleteOne(uid: string): Promise<void> {
        await TemplateModelWrapper.$$deleteOne(uid);
    }

    private static convertToTemplateView(dbObj: TemplateObject): TemplateView {
        const view: TemplateView = new TemplateView();
        keysOfITemplateView.forEach((key: string) => {
            if (key in dbObj) {
                view[key] = dbObj[key];
            } else {
                LoggerManager.warn('missed Key in TemplateObject:', key);
            }

        });
        return view;
    }
}
