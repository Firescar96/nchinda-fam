import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './components/App';

import router from './router';

Vue.use(VueRouter);
Vue.config.productionTip = false;

new Vue({
  components: { App },
  template: '<App/>',
  router,
}).$mount('#app');
