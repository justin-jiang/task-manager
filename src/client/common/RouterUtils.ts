import { UserRole } from 'common/UserRole';
import VueRouter, { RawLocation } from 'vue-router';
import { CommonUtils } from 'common/CommonUtils';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { LoggerManager } from 'client/LoggerManager';
import { RouteQuery } from './RouteQuery';
import { UserView } from 'common/responseResults/UserView';

export enum RoutePathItem {
    Admin = 'admin',
    Admin_Notification = 'notification',
    Admin_User = 'user',
    AdminRegister = 'adminRegister',
    Error = 'error',
    Executor = 'executor',
    Executor_Task = 'task',
    Executor_UserInfo = 'userInfo',
    Executor_Notification = 'notification',
    Login = 'login',
    Publisher = 'publisher',
    Publisher_Task = 'task',
    Publisher_Template = 'template',
    Publisher_UserInfo = 'userInfo',
    Publisher_Notification = 'notification',
    UserRegister = 'userRegister',
}
export enum RouterName {
    Admin = 'admin',
    Admin_Notification = 'notification',
    Admin_User = 'admin_user',
    AdminRegister = 'adminRegister',
    Error = 'error',
    Executor = 'executor',
    Executor_Task = 'executor_task',
    Executor_UserInfo = 'executor_userInfo',
    Executor_Notification = 'executor_notification',
    Login = 'login',
    Publisher = 'publisher',
    Publisher_Task = 'publisher_task',
    Publisher_Template = 'publisher_template',
    Publisher_UserInfo = 'publisher_userInfo',
    Publisher_Notification = 'publisher_notification',
    UserRegister = 'userRegister',
}
export class RouterUtils {
    public static goToAdminView(router: VueRouter) {
        router.push({ name: RouterName.Admin } as RawLocation);
    }
    public static goToAdminUserManagementView(router: VueRouter) {
        router.push({ name: RouterName.Admin_User } as RawLocation);
    }
    public static goToAdminRegisterView(router: VueRouter) {
        router.push({ name: RouterName.AdminRegister } as RawLocation);
    }
    public static goToLoginView(router: VueRouter) {
        router.push({ name: RouterName.Login } as RawLocation);
    }
    public static goToErrorView(
        router: VueRouter,
        state?: IStoreState,
        errorMessage?: string,
        ex?: Error) {
        if (state != null && errorMessage != null) {
            state.errorMessage = errorMessage;
        }
        if (ex != null) {
            LoggerManager.error('Error:', ex);
        }
        router.push({ name: RouterName.Error } as RawLocation);
    }

    public static goToUserRegisterView(router: VueRouter, role: UserRole) {
        router.push({
            name: RouterName.UserRegister,
            query: { role: role.valueOf().toString() } as RouteQuery,
        } as RawLocation);
    }

    public static goToPublisherDefaultView(router: VueRouter) {
        router.push({
            name: RouterName.Publisher_Task,
        } as RawLocation);
    }
    public static goToPublisherTaskView(router: VueRouter, tabName?: string) {
        router.push({
            name: RouterName.Publisher_Task,
            query: { tabName } as RouteQuery
        } as RawLocation);
    }
    public static goToPublisherUserInfoView(router: VueRouter) {
        router.push({
            name: RouterName.Publisher_UserInfo,
        } as RawLocation);
    }
    public static goToExecutorDefaultView(router: VueRouter) {
        this.goToExecutorTaskView(router);
    }
    public static goToExecutorTaskView(router: VueRouter) {
        router.push({
            name: RouterName.Executor_Task,
        } as RawLocation);
    }
    public static goToExecutorUserInfoView(router: VueRouter) {
        router.push({
            name: RouterName.Executor_UserInfo,
        } as RawLocation);
    }
    public static goToUserInfoView(router: VueRouter, userRoles: UserRole[]) {
        if (CommonUtils.isExecutor(userRoles)) {
            this.goToExecutorUserInfoView(router);
        } else if (CommonUtils.isPublisher(userRoles)) {
            this.goToPublisherUserInfoView(router);
        }
    }
    /**
     * According the User Type to go to the corresponding home page
     * @param router 
     * @param userRoles 
     */
    public static goToUserHomePage(router: VueRouter, user: UserView) {

        // according user type to go to different view
        if (CommonUtils.isAdmin(user.roles)) {
            RouterUtils.goToAdminView(router);
        } else if (!CommonUtils.isUserReady(user)) {
            RouterUtils.goToUserRegisterView(router, (user.roles as UserRole[])[0]);
        } else if (CommonUtils.isPublisher(user.roles)) {
            RouterUtils.goToPublisherDefaultView(router);
        } else if (CommonUtils.isExecutor(user.roles)) {
            RouterUtils.goToExecutorDefaultView(router);
        } else {
            RouterUtils.goToLoginView(router);
        }
    }

    public static isHomeUrl(): boolean {
        return /\/#\/?$/i.test(window.location.href);
    }

    public static isErrorUrl(): boolean {
        const errorUrlPattern: RegExp = new RegExp(`\/#\/${RoutePathItem.Error}`, 'i');
        return errorUrlPattern.test(window.location.href);
    }

    public static isLoginUrl(): boolean {
        const loginUrlPattern: RegExp = new RegExp(`\/#\/${RoutePathItem.Login}`, 'i');
        return loginUrlPattern.test(window.location.href);
    }
    public static isUserRegisterUrl(): boolean {
        const loginUrlPattern: RegExp = new RegExp(`\/#\/${RoutePathItem.UserRegister}`, 'i');
        return loginUrlPattern.test(window.location.href);
    }
    public static isAdminRoot(): boolean {
        const loginUrlPattern: RegExp = new RegExp(`\/#\/${RoutePathItem.Admin}\/?$`, 'i');
        return loginUrlPattern.test(window.location.href);
    }
}
