import { CommonObject } from 'common/commonDataObjects/CommonObject';
import { UserView } from 'common/responseResults/UserView';
import { IStoreState } from 'client/VuexOperations/IStoreState';

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

    public static getUserById(storeState: IStoreState, uid: string): UserView | null {
        let targetUser: UserView | null = null;
        const executorIndex = storeState.userObjs.findIndex((item) => {
            return item.uid === uid;
        });
        if (executorIndex >= 0) {
            targetUser = storeState.userObjs[executorIndex];

        }
        return targetUser;
    }
}
