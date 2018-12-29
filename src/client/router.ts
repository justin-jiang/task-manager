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
      component: () => import('./views/LoginVue.vue'),
    },
    {
      // Admin View
      path: `/${RoutePathItem.Admin}`,
      name: RouterName.Admin,
      component: () => import('./views/AdminVue.vue'),
      children: [
        {
          path: `/${RoutePathItem.Admin}/${RoutePathItem.Admin_Template}`,
          name: RouterName.Admin_Template,
          component: () => import('./components/TemplateManagementVue.vue'),
        },
        {
          path: `/${RoutePathItem.Admin}/${RoutePathItem.Admin_Notification}`,
          name: RouterName.Admin_Notification,
          component: () => import('./components/NotificationManagementVue.vue'),
        },
        {
          path: `/${RoutePathItem.Admin}/${RoutePathItem.Admin_User}`,
          name: RouterName.Admin_User,
          component: () => import('./components/UserManagementVue.vue'),
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
      component: () => import('./views/AdminRegisterVue.vue'),
    },
    {
      // Error View
      path: `/${RoutePathItem.Error}`,
      name: RouterName.Error,
      component: () => import('./views/ErrorVue.vue'),
    },
    {
      // User Register View
      path: `/${RoutePathItem.UserRegister}`,
      name: RouterName.UserRegister,
      component: () => import('./views/UserRegisterVue.vue'),
    },

    {
      // Publisher View
      path: `/${RoutePathItem.Publisher}`,
      name: RouterName.Publisher,
      component: () => import('./views/PublisherVue.vue'),
    },

    {
      // Executor View
      path: `/${RoutePathItem.Executor}`,
      name: RouterName.Executor,
      component: () => import('./views/ExecutorVue.vue'),
    },
  ],
});
