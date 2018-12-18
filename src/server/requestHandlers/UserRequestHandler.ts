import { IQueryConditions } from 'common/requestParams/IQueryConditions';
import { IUserPostParam } from 'common/requestParams/IUserPostParam';
import { getBlankIUserView, IUserView, keysOfObject as keysOfIUserView } from 'common/responseResults/IUserView';
import { LoggersManager } from 'server/libsWrapper/LoggersManager';
import { UserModelWrapper } from '../dataModels/UserModelWrapper';
import { IUserObject } from '../dataObjects/IUserObject';

export class UserRequestHandler {
    public static async $$createUser(user: IUserPostParam): Promise<IUserView> {
        const userFromModel: UserModelWrapper = new UserModelWrapper();
        Object.keys(user).forEach((key: string) => {
            userFromModel[key] = user[key];
        });
        await userFromModel.$$save();
        const result: IUserView = {} as any;
        result.uid = userFromModel.uid;
        result.name = userFromModel.name;
        result.telephone = userFromModel.telephone;
        result.email = userFromModel.email;
        return result;
    }

    public static async $$findUser(conditions: IQueryConditions): Promise<IUserView[]> {
        const userFromModel: UserModelWrapper = new UserModelWrapper();
        const userObjs: IUserObject[] = await userFromModel.$$find(conditions);
        const userViews: IUserView[] = [];
        userObjs.forEach((obj: IUserObject) => {
            userViews.push(this.convertToUserView(obj));
        });
        return userViews;
    }

    private static convertToUserView(userObj: IUserObject): IUserView {
        const userView: IUserView = getBlankIUserView();
        keysOfIUserView.forEach((key: string) => {
            if (key in userObj) {
                userView[key] = userObj[key];
            } else {
                LoggersManager.warn('Missed Key in IUserObject', key);
            }

        });
        return userView;
    }
}
