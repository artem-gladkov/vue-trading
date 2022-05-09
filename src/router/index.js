import Vue from 'vue'
import VueRouter from 'vue-router'
import Diagram from '../views/Diagram.vue'

Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  base: import.meta.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'diagram',
      component: Diagram
    }
  ]
})

export default router
