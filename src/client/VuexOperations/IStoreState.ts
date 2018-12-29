import { TaskView } from 'common/responseResults/TaskView';
import { TemplateView } from 'common/responseResults/TemplateView';
import { IUserView, UserView } from 'common/responseResults/UserView';

export interface IStoreState {

    // current login user
    // NOTE: the prop is watched by some components, so if you try to 
    // change it name, please also change the path of watch
    sessionInfo: IUserView;

    redirectURLAfterLogin: string;

    templateObjs: TemplateView[];

    // used for Executor or publisher to store tasks
    taskObjs: TaskView[];
    userObjs: UserView[];
}
