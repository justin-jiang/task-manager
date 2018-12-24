import Vue from 'vue';
import Router from 'vue-router';
import { RouterName, RoutePathItem } from 'client/views/RouterUtils';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: `/${RoutePathItem.Login}`,
      name: RouterName.Login,
      // route level code-splitting
      // this generates a separate chunk for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('./views/LoginVue.vue'),
    },
    {
      path: `/${RoutePathItem.Admin}`,
      name: RouterName.Admin,
      // route level code-splitting
      // this generates a separate chunk for this route
      // which is lazy-loaded when the route is visited.
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
      path: `/${RoutePathItem.AdminRegister}`,
      name: RouterName.AdminRegister,
      // route level code-splitting
      // this generates a separate chunk for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('./views/AdminUserRegisterVue.vue'),
    },
    {
      path: `/${RoutePathItem.Error}`,
      name: RouterName.Error,
      component: () => import('./views/ErrorVue.vue'),
    },
    {
      path: `/${RoutePathItem.UserRegister}`,
      name: RouterName.UserRegister,
      component: () => import('./views/UserRegisterVue.vue'),
    },
  ],
});
