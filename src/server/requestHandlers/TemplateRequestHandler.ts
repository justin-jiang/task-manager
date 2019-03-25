import { CommonUtils } from 'common/CommonUtils';
import { IQueryConditions } from 'common/IQueryConditions';
import { TemplateEditParam } from 'common/requestParams/TemplateEditParam';
import { TemplateRemoveParam } from 'common/requestParams/TemplateRemoveParam';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { keysOfITemplateView, TemplateView } from 'common/responseResults/TemplateView';
import { ApiError } from 'server/common/ApiError';
import { TemplateModelWrapper } from 'server/dataModels/TemplateModelWrapper';
import { TemplateObject } from 'server/dataObjects/TemplateObject';
import { UserObject } from 'server/dataObjects/UserObject';
import { FileStorage } from 'server/dbDrivers/mongoDB/FileStorage';
import { RequestUtils } from './RequestUtils';

export class TemplateRequestHandler {

    public static async $$find(conditions: IQueryConditions): Promise<TemplateView[]> {
        const dbObjs: TemplateObject[] = await TemplateModelWrapper.$$find(conditions) as TemplateObject[];
        const views: TemplateView[] = [];
        if (dbObjs != null && dbObjs.length > 0) {
            for (const obj of dbObjs) {
                views.push(await this.$$convertToDBView(obj));
            }
        }
        return views;
    }
    public static async $$basicInfoEdit(
        reqParam: TemplateEditParam, currentUser: UserObject): Promise<TemplateView> {
        if (reqParam == null || CommonUtils.isNullOrEmpty(reqParam.uid)) {
            throw new ApiError(ApiResultCode.InputInvalidParam,
                'TemplateEditParam or TemplateEditParam.uid should not be null');
        }
        const dbObj: TemplateObject = await TemplateModelWrapper.$$findOne(
            { uid: reqParam.uid } as TemplateObject) as TemplateObject;
        if (dbObj == null) {
            throw new ApiError(ApiResultCode.DbNotFound);
        }
        if (dbObj.publisherUid !== currentUser.uid) {
            throw new ApiError(ApiResultCode.AuthForbidden);
        }

        const updatedProps: TemplateObject = RequestUtils.pickUpPropsByModel(
            reqParam, new TemplateEditParam(true), true);
        const updatedKeys = Object.keys(updatedProps);
        if (updatedKeys.length > 1) {
            await TemplateModelWrapper.$$updateOne({ uid: updatedProps.uid } as TemplateObject, updatedProps);
            Object.assign(dbObj, updatedProps);
        }
        return await this.$$convertToDBView(dbObj);
    }

    public static async $$remove(reqParam: TemplateRemoveParam, currentUser: UserObject): Promise<TemplateView> {
        if (reqParam == null || CommonUtils.isNullOrEmpty(reqParam.uid)) {
            throw new ApiError(ApiResultCode.InputInvalidParam,
                'TemplateRemoveParam or TemplateRemoveParam.uid should not be null');
        }
        const dbObj: TemplateObject = await TemplateModelWrapper.$$findOne(
            { uid: reqParam.uid } as TemplateObject) as TemplateObject;
        if (dbObj == null) {
            throw new ApiError(ApiResultCode.DbNotFound);
        }

        // only admin or owner can remove template
        if (!CommonUtils.isAdmin(currentUser) && dbObj.publisherUid !== currentUser.uid) {
            throw new ApiError(ApiResultCode.AuthForbidden);
        }
        // remove template file
        await FileStorage.$$deleteEntry(dbObj.templateFileUid as string);
        // TODO: remove related tasks

        await TemplateModelWrapper.$$deleteOne({ uid: reqParam.uid } as TemplateObject);
        return await this.$$convertToDBView(dbObj);
    }

    public static async $$convertToDBView(dbObj: TemplateObject): Promise<TemplateView> {
        const view: TemplateView = new TemplateView();
        keysOfITemplateView.forEach((key: string) => {
            if (key in dbObj) {
                view[key] = dbObj[key];
            }
        });
        return view;
    }
}
