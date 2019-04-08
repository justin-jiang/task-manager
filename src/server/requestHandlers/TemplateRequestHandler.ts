import { CommonUtils } from 'common/CommonUtils';
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

    /**
     * used by publisher to query owned template
     * @param currentUser 
     */
    public static async $$query(currentUser: UserObject): Promise<TemplateView[]> {
        if (!CommonUtils.isReadyPublisher(currentUser)) {
            throw new ApiError(ApiResultCode.AuthForbidden);
        }
        const dbObjs: TemplateObject[] = await TemplateModelWrapper.$$find(
            { publisherUid: currentUser.uid } as TemplateObject) as TemplateObject[];
        const views: TemplateView[] = [];
        if (dbObjs != null && dbObjs.length > 0) {
            for (const obj of dbObjs) {
                views.push(await this.$$convertToDBView(obj));
            }
        }
        return views;
    }

    /**
     * used by publisher owner to update temlate
     * @param reqParam 
     * @param currentUser 
     */
    public static async $$basicInfoEdit(
        reqParam: TemplateEditParam, currentUser: UserObject): Promise<TemplateView> {
        // param check
        if (CommonUtils.isNullOrEmpty(reqParam.uid)) {
            throw new ApiError(ApiResultCode.InputInvalidParam, JSON.stringify(reqParam));
        }

        // template check
        const dbObj: TemplateObject = await RequestUtils.$$templateExistenceCheck(reqParam.uid as string);
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

    /**
     * used by publisher owner to remove template
     * @param reqParam 
     * @param currentUser 
     */
    public static async $$remove(reqParam: TemplateRemoveParam, currentUser: UserObject): Promise<TemplateView> {
        // user check
        RequestUtils.readyPublisherCheck(currentUser);

        // template check
        const dbObj: TemplateObject = await RequestUtils.$$templateExistenceCheck(reqParam.uid as string);

        // publisher owner can remove template
        if (dbObj.publisherUid !== currentUser.uid) {
            throw new ApiError(ApiResultCode.AuthForbidden);
        }
        // remove template file
        await FileStorage.$$deleteEntry(dbObj.templateFileUid as string);

        await TemplateModelWrapper.$$deleteOne({ uid: reqParam.uid } as TemplateObject);
        return await this.$$convertToDBView(dbObj);
    }

    /**
     * 
     * @param dbObj 
     */
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
