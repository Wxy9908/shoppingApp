import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../../modules/home/pages/HomePage.vue'
import PlanPage from '../../modules/plan/pages/PlanPage.vue'
import MenuPage from '../../modules/menu/pages/MenuPage.vue'
import ShoppingPage from '../../modules/shopping/pages/ShoppingPage.vue'
import InventoryPage from '../../modules/inventory/pages/InventoryPage.vue'
import ReviewPage from '../../modules/review/pages/ReviewPage.vue'

const routes = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/home',
    name: 'HomePage',
    component: HomePage,
  },
  {
    path: '/plan',
    name: 'PlanPage',
    component: PlanPage,
  },
  {
    path: '/menu',
    name: 'MenuPage',
    component: MenuPage,
  },
  {
    path: '/shopping',
    name: 'ShoppingPage',
    component: ShoppingPage,
  },
  {
    path: '/inventory',
    name: 'InventoryPage',
    component: InventoryPage,
  },
  {
    path: '/review',
    name: 'ReviewPage',
    component: ReviewPage,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
