import { UserView } from 'common/responseResults/UserView';

export interface IStoreState {
    
    // current login user
    sessionInfo?: UserView;

    redirectURLAfterLogin?: string;
}
