import { CommonObject } from 'common/commonDataObjects/CommonObject';
import { UserView } from 'common/responseResults/UserView';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { Store } from 'vuex';
import { StoreActionNames } from 'client/VuexOperations/StoreActionNames';
import { IStoreActionArgs } from 'client/VuexOperations/IStoreActionArgs';
import { CommonUtils } from 'common/CommonUtils';
import { ApiResult } from 'common/responseResults/APIResult';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';

export class StoreUtils {
    public static replaceFromArray(objArray: CommonObject[], substitute: CommonObject) {
        if (substitute == null || objArray == null || objArray.length === 0) {
            return;
        }
        let indexOfTargetObj: number = -1;
        objArray.forEach((item, index) => {
            if (item.uid === substitute.uid) {
                indexOfTargetObj = index;
            }
        });
        if (indexOfTargetObj !== -1) {
            objArray.splice(indexOfTargetObj, 1, substitute);
        }
    }

    public static deleteFromArray(objArray: CommonObject[], deletedOne: CommonObject) {
        if (deletedOne == null) {
            return;
        }
        let indexOfTargetObj: number = -1;
        objArray.forEach((item, index) => {
            if (item.uid === deletedOne.uid) {
                indexOfTargetObj = index;
            }
        });
        if (indexOfTargetObj !== -1) {
            objArray.splice(indexOfTargetObj, 1);
        }
    }

    public static updateItemOfArray(objArray: CommonObject[], updatedOne: CommonObject) {
        if (updatedOne == null || objArray == null || objArray.length === 0) {
            return;
        }
        let indexOfTargetObj: number = -1;
        objArray.forEach((item, index) => {
            if (item.uid === updatedOne.uid) {
                indexOfTargetObj = index;
            }
        });
        if (indexOfTargetObj !== -1) {
            const origItem = objArray[indexOfTargetObj];
            const newItem = Object.assign({}, origItem, updatedOne);
            objArray.splice(indexOfTargetObj, 1, newItem);
        }
    }

    /**
     * get use by uid from cache
     * @param storeState 
     * @param uid 
     */
    public static getUserById(storeState: IStoreState, uid: string): UserView | undefined {
        return storeState.userObjs.find((item) => {
            return item.uid === uid;
        });
    }

    /**
     * get use by uid with cache check
     * @param store 
     * @param uid 
     */
    public static async $$getUserById(store: Store<IStoreState>, uid: string): Promise<UserView | undefined> {
        await this.$$pullAllUsers(store);
        return this.getUserById(store.state, uid);
    }

    public static async $$pullAllUsers(store: Store<IStoreState>, notUseLocalData?: boolean): Promise<ApiResult> {
        if (notUseLocalData == null) {
            notUseLocalData = false;
        }
        if (CommonUtils.isAdmin(store.state.sessionInfo)) {
            return await store.dispatch(StoreActionNames.userQuery,
                {
                    notUseLocalData,
                } as IStoreActionArgs);
        } else {
            const apiResult: ApiResult = new ApiResult();
            apiResult.code = ApiResultCode.AuthForbidden;
            return apiResult;
        }
    }
}
