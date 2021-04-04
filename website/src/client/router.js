import VueRouter from 'vue-router';

export default new VueRouter({
  mode: 'history',
  routes: [
    { path: '/', component: () => import('@/components/TreeVisualization') },
    { path: '*', component: () => import('@/components/TreeVisualization') },
  ],
});
