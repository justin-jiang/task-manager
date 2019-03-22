import { CommonObject } from 'common/commonDataObjects/CommonObject';
import { UserView } from 'common/responseResults/UserView';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { Store } from 'vuex';
import { StoreActionNames } from 'client/VuexOperations/StoreActionNames';
import { IStoreActionArgs } from 'client/VuexOperations/IStoreActionArgs';

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
        await store.dispatch(StoreActionNames.userQuery,
            {
                notUseLocalData: false,
            } as IStoreActionArgs);
        const storeState = (store.state as IStoreState);

        return this.getUserById(storeState, uid);
    }
}
