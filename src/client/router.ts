import Vue from 'vue';
import Router from 'vue-router';
import { RouterName, RoutePathItem } from 'client/common/RouterUtils';

Vue.use(Router);

export default new Router({
  routes: [
    {
      // Login View
      path: `/${RoutePathItem.Login}`,
      name: RouterName.Login,
      // route level code-splitting
      // this generates a separate chunk for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "0" */'./views/LoginVue.vue'),
    },
    {
      // Admin View
      path: `/${RoutePathItem.Admin}`,
      name: RouterName.Admin,
      component: () => import(/* webpackChunkName: "1" */'./views/AdminVue.vue'),
      children: [
        {
          path: `/${RoutePathItem.Admin}/${RoutePathItem.Admin_Notification}`,
          name: RouterName.Admin_Notification,
          component: () => import(/* webpackChunkName: "2" */'./views/NotificationManagementVue.vue'),
        },
        {
          path: `/${RoutePathItem.Admin}/${RoutePathItem.Admin_User}`,
          name: RouterName.Admin_User,
          component: () => import(/* webpackChunkName: "3" */'./views/UserManagementVue.vue'),
        },
        {
          path: `/${RoutePathItem.Admin}/${RoutePathItem.Admin_Task}`,
          name: RouterName.Admin_Task,
          component: () => import(/* webpackChunkName: "4" */'./views/AdminTaskVue.vue'),
        },
        {
          path: `/${RoutePathItem.Admin}/${RoutePathItem.Admin_Template}`,
          name: RouterName.Admin_Template,
          component: () => import(/* webpackChunkName: "5" */'./views/QualificationTemplateVue.vue'),
        },
        {
          path: `/${RoutePathItem.Admin}/${RoutePathItem.Admin_Protocol}`,
          name: RouterName.Admin_Procotol,
          component: () => import(/* webpackChunkName: "6" */'./views/AdminProtocolVue.vue'),
        },
      ],
    },
    {
      // Admin Register View
      path: `/${RoutePathItem.AdminRegister}`,
      name: RouterName.AdminRegister,
      // route level code-splitting
      // this generates a separate chunk for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "7" */'./views/AdminRegisterVue.vue'),
    },
    {
      // Error View
      path: `/${RoutePathItem.Error}`,
      name: RouterName.Error,
      component: () => import(/* webpackChunkName: "8" */'./views/ErrorVue.vue'),
    },
    {
      // User Register View
      path: `/${RoutePathItem.UserRegister}`,
      name: RouterName.UserRegister,
      component: () => import(/* webpackChunkName: "9" */'./views/UserRegisterVue.vue'),
    },

    {
      // Publisher View
      path: `/${RoutePathItem.Publisher}`,
      name: RouterName.Publisher,
      component: () => import(/* webpackChunkName: "10" */'./views/PublisherVue.vue'),
      children: [
        {
          path: `/${RoutePathItem.Publisher}/${RoutePathItem.Publisher_Task}`,
          name: RouterName.Publisher_Task,
          component: () => import(/* webpackChunkName: "11" */'./views/PublisherTaskVue.vue'),
        },
        {
          path: `/${RoutePathItem.Publisher}/${RoutePathItem.Publisher_Template}`,
          name: RouterName.Publisher_Template,
          component: () => import(/* webpackChunkName: "12" */'./views/TemplateManagementVue.vue'),
        },
        {
          path: `/${RoutePathItem.Publisher}/${RoutePathItem.Publisher_Notification}`,
          name: RouterName.Publisher_Notification,
          component: () => import(/* webpackChunkName: "13" */'./views/NotificationManagementVue.vue'),
        },
        {
          path: `/${RoutePathItem.Publisher}/${RoutePathItem.Publisher_UserInfo}`,
          name: RouterName.Publisher_UserInfo,
          component: () => import(/* webpackChunkName: "14" */'./views/UserInfoVue.vue'),
        },
      ],
    },

    {
      // Executor View
      path: `/${RoutePathItem.Executor}`,
      name: RouterName.Executor,
      component: () => import(/* webpackChunkName: "15" */'./views/ExecutorVue.vue'),
      children: [
        {
          path: `/${RoutePathItem.Executor}/${RoutePathItem.Executor_Task}`,
          name: RouterName.Executor_Task,
          component: () => import(/* webpackChunkName: "16" */'./views/ExecutorTaskVue.vue'),
        },
        {
          path: `/${RoutePathItem.Executor}/${RoutePathItem.Executor_Notification}`,
          name: RouterName.Executor_Notification,
          component: () => import(/* webpackChunkName: "17" */'./views/NotificationManagementVue.vue'),
        },
        {
          path: `/${RoutePathItem.Executor}/${RoutePathItem.Executor_UserInfo}`,
          name: RouterName.Executor_UserInfo,
          component: () => import(/* webpackChunkName: "18" */'./views/UserInfoVue.vue'),
        },
      ],
    },
  ],
});
