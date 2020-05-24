import VueRouter from 'vue-router';
import Opener from '@/components/Opener';


export default new VueRouter({
  mode: 'history',
  routes: [
    { path: '/', component: Opener },
  ],
});
