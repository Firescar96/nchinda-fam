import VueRouter from 'vue-router';
import TreeVisualization from '@/components/TreeVisualization';


export default new VueRouter({
  mode: 'history',
  routes: [
    { path: '/', component: TreeVisualization },
    { path: '*', component: TreeVisualization },
  ],
});
