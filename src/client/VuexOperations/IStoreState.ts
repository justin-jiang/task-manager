import { IUserView } from '@/common/responseResults/IUserView';

export interface IAdminStoreState {
    /**
     * user/accout related data
     */
    loginUser: IUserView | undefined;
    userList: IUserView[];
    // current selected user infos
    selectedUser: IUserView | undefined;
}
