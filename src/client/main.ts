import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import Vue from 'vue';
import AppVue from './AppVue.vue';
import router from './router';
import store from './store';
import 'viewerjs/dist/viewer.css';


Vue.config.productionTip = false;
Vue.use(ElementUI);
new Vue({
  router,
  store,
  render: (h: any) => h(AppVue),
} as any).$mount('#app');
