import { CommonUtils } from 'common/CommonUtils';
import { IQueryConditions } from 'common/IQueryConditions';
import { TemplateCreateParam } from 'common/requestParams/TemplateCreateParam';
import { TemplateEditParam } from 'common/requestParams/TemplateEditParam';
import { TemplateRemoveParam } from 'common/requestParams/TemplateRemoveParam';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { keysOfITemplateView, TemplateView } from 'common/responseResults/TemplateView';
import { ApiError } from 'server/common/ApiError';
import { TemplateModelWrapper } from 'server/dataModels/TemplateModelWrapper';
import { TemplateObject } from 'server/dataObjects/TemplateObject';
import { UserObject } from 'server/dataObjects/UserObject';
import { FileStorage } from 'server/dbDrivers/mongoDB/FileStorage';
import { LoggerManager } from 'server/libsWrapper/LoggerManager';

export class TemplateRequestHandler {
    public static async $$create(reqParam: TemplateCreateParam): Promise<TemplateView> {
        if (CommonUtils.isNullOrEmpty(reqParam.name)) {
            throw new ApiError(ApiResultCode.INPUT_VALIDATE_INVALID_PARAM,
                'TemplateCreateParam.name should not be null');
        }
        let dbObj: TemplateObject = new TemplateObject();
        dbObj.uid = CommonUtils.getUUIDForMongoDB();
        dbObj.name = reqParam.name;
        if (reqParam.note !== undefined) {
            dbObj.note = reqParam.note;
        }
        dbObj.version = 0;
        dbObj.templateFileId = CommonUtils.getUUIDForMongoDB();

        dbObj = await TemplateModelWrapper.$$create(dbObj) as TemplateObject;
        const view: TemplateView = new TemplateView();
        view.assembleFromDBObject(dbObj);
        return view;
    }

    public static async $$find(conditions: IQueryConditions): Promise<TemplateView[]> {
        const dbObjs: TemplateObject[] = await TemplateModelWrapper.$$find(conditions) as TemplateObject[];
        const views: TemplateView[] = [];
        dbObjs.forEach((obj: TemplateObject) => {
            views.push(this.convertToDBView(obj));
        });
        return views;
    }
    public static async $$edit(reqParam: TemplateEditParam): Promise<TemplateView | null> {
        if (reqParam == null || CommonUtils.isNullOrEmpty(reqParam.uid)) {
            throw new ApiError(ApiResultCode.INPUT_VALIDATE_INVALID_PARAM,
                'TemplateEditParam or TemplateEditParam.uid should not be null');
        }
        const dbObjParam: TemplateObject = {
        } as TemplateObject;
        if (reqParam.name != null) {
            dbObjParam.name = reqParam.name;
        }
        if (reqParam.note != null) {
            dbObjParam.note = reqParam.note;
        }

        const updatedObj: TemplateObject | null = await TemplateModelWrapper.$$findOneAndUpdate(
            { uid: reqParam.uid } as TemplateObject, dbObjParam) as TemplateObject;
        if (updatedObj != null) {
            return this.convertToDBView(updatedObj);
        } else {
            return null;
        }
    }

    public static async $$remove(reqParam: TemplateRemoveParam, currentUser: UserObject): Promise<TemplateView | null> {
        // only admin can remove template
        if (!CommonUtils.isAdmin(currentUser.roles)) {
            throw new ApiError(ApiResultCode.Auth_Forbidden);
        }
        const deletedDBObj: TemplateObject | null = await TemplateModelWrapper.$$findeOneAndDelete(
            { uid: reqParam.uid } as TemplateObject) as TemplateObject;
        if (deletedDBObj != null) {
            if (!CommonUtils.isNullOrEmpty(deletedDBObj.templateFileId)) {
                // delete all template file
                await FileStorage.$$deleteEntry(deletedDBObj.templateFileId as string);
                // TODO: remove related tasks
            }
            return this.convertToDBView(deletedDBObj);

        } else {
            return null;
        }
    }

    public static convertToDBView(dbObj: TemplateObject): TemplateView {
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
