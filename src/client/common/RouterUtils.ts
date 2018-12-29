import { UserRole } from 'common/UserRole';
import VueRouter, { RawLocation } from 'vue-router';
import { CommonUtils } from 'common/CommonUtils';

export enum RoutePathItem {
    Admin = 'admin',
    Admin_Notification = 'notification',
    Admin_Template = 'template',
    Admin_User = 'user',
    AdminRegister = 'adminRegister',
    Error = 'error',
    Executor = 'executor',
    Login = 'login',
    Publisher = 'publisher',
    UserRegister = 'userRegister',
}
export enum RouterName {
    Admin = 'admin',
    Admin_Notification = 'notification',
    Admin_Template = 'admin_template',
    Admin_User = 'admin_user',
    AdminRegister = 'adminRegister',
    Error = 'error',
    Executor = 'executor',
    Login = 'login',
    Publisher = 'publisher',
    UserRegister = 'userRegister',
}
export class RouterUtils {
    public static goToAdminView(router: VueRouter) {
        router.push({ name: RouterName.Admin } as RawLocation);
    }
    public static goToAdminTemplateManagementView(router: VueRouter) {
        router.push({ name: RouterName.Admin_Template } as RawLocation);
    }
    public static goToAdminRegisterView(router: VueRouter) {
        router.push({ name: RouterName.AdminRegister } as RawLocation);
    }
    public static goToLoginView(router: VueRouter) {
        router.push({ name: RouterName.Login } as RawLocation);
    }
    public static goToErrorView(router: VueRouter) {
        router.push({ name: RouterName.Error } as RawLocation);
    }

    public static goToUserRegisterView(router: VueRouter, role: UserRole) {
        router.push({
            name: RouterName.UserRegister,
            query: { role: role.valueOf().toString() },
        } as RawLocation);
    }

    public static goToPublisherView(router: VueRouter) {
        router.push({
            name: RouterName.Publisher,
        } as RawLocation);
    }
    public static goToExecutorView(router: VueRouter) {
        router.push({
            name: RouterName.Executor,
        } as RawLocation);
    }
    /**
     * According the User Type to go to the corresponding home page
     * @param router 
     * @param userRoles 
     */
    public static goToUserHomePage(router: VueRouter, userRoles: UserRole[] | undefined) {
        if (userRoles == null) {
            RouterUtils.goToErrorView(router);
            return;
        }
        // according user type to go to different view
        if (userRoles.includes(UserRole.Admin)) {
            RouterUtils.goToAdminView(router);
        } else if (CommonUtils.isPublisher(userRoles)) {
            RouterUtils.goToPublisherView(router);
        } else if (CommonUtils.isExecutor(userRoles)) {
            RouterUtils.goToExecutorView(router);
        } else {
            RouterUtils.goToErrorView(router);
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
}
