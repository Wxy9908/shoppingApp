import { createRouter, createWebHistory } from 'vue-router'
import PlanPage from '../../modules/plan/pages/PlanPage.vue'
import MenuPage from '../../modules/menu/pages/MenuPage.vue'
import ShoppingPage from '../../modules/shopping/pages/ShoppingPage.vue'
import InventoryPage from '../../modules/inventory/pages/InventoryPage.vue'

const routes = [
  {
    path: '/',
    redirect: '/plan',
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
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
