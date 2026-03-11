<template>
  <section class="page" aria-label="首页">
    <header class="hero-card">
      <div class="between">
        <h1 class="title">本周计划 · {{ currentWeekLabel }}</h1>
        <span class="hero-tag">进行中</span>
      </div>
      <p class="desc">{{ planMetaText }}</p>
      <div class="row" style="margin-top: 16px;">
        <button class="btn btn--primary" style="flex: 1;" @click="handleGoPlan">新建计划</button>
        <button class="btn" style="flex: 1;" :disabled="!prepStore.hasActivePlan" @click="handleCopyToNextWeek">
          复制上周
        </button>
      </div>
    </header>

    <article class="card" aria-label="周进度">
      <div class="between">
        <h2 class="title">本周进度</h2>
        <span class="tag" style="color: var(--prep-primary); background: #eff6ff;">{{ completionPercent }}%</span>
      </div>
      <div class="progress-container" style="margin-top: 12px; height: 8px; background: #f1f5f9; border-radius: 999px; overflow: hidden; position: relative;">
        <div class="progress-bar" :style="{ width: completionPercent + '%', height: '100%', background: 'linear-gradient(90deg, var(--prep-primary), #60a5fa)', borderRadius: '999px', transition: 'width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' }"></div>
      </div>
      <p class="desc" style="margin-top: 12px;">
        已完成菜品 {{ completedMealCount }}/{{ totalMealCount }} · 已购买 {{ purchasedCount }}/{{ totalShoppingCount }}
      </p>
    </article>

    <article class="card quick-card" aria-label="快速入口">
      <button class="quick-btn" type="button" aria-label="进入菜单页面" @click="handleGoMenu">菜单管理</button>
      <button class="quick-btn" type="button" aria-label="进入清单页面" @click="handleGoShopping">购物清单</button>
      <button class="quick-btn" type="button" aria-label="进入库存页面" @click="handleGoInventory">库存管理</button>
      <button class="quick-btn" type="button" aria-label="进入周复盘页面" @click="handleGoReview">周复盘</button>
    </article>
  </section>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showFailToast, showSuccessToast } from 'vant'
import { MEAL_ITEM_STATUS, SHOPPING_ITEM_STATUS, usePrepStore } from '../../../app/store/usePrepStore'

defineOptions({
  name: 'HomePage',
})

const router = useRouter()
const prepStore = usePrepStore()

const totalMealCount = computed(() => prepStore.mealItems.length)
const completedMealCount = computed(() =>
  prepStore.mealItems.filter((item) => (item.status || MEAL_ITEM_STATUS.PENDING) === MEAL_ITEM_STATUS.COMPLETED).length
)
const totalShoppingCount = computed(() => prepStore.shoppingItems.length)
const purchasedCount = computed(
  () => prepStore.shoppingItems.filter((item) => item.status === SHOPPING_ITEM_STATUS.PURCHASED).length
)

const completionPercent = computed(() => {
  const total = totalMealCount.value + totalShoppingCount.value
  if (!total) {
    return 0
  }

  const done = completedMealCount.value + purchasedCount.value
  return Math.min(100, Math.round((done / total) * 100))
})

const currentWeekLabel = computed(() => {
  if (!prepStore.currentPlan?.weekStartDate) {
    return '未创建'
  }
  return prepStore.currentPlan.weekStartDate
})

const planMetaText = computed(() => {
  if (!prepStore.currentPlan) {
    return '还没有本周计划，先创建计划再生成菜单与清单。'
  }

  return `${prepStore.currentPlan.days} 天 · ${prepStore.currentPlan.peopleCount} 人 · 预算 ${prepStore.currentPlan.budget} 元`
})

const handleGoPlan = () => {
  router.push('/plan')
}

const handleGoMenu = () => {
  router.push('/menu')
}

const handleGoShopping = () => {
  router.push('/shopping')
}

const handleGoInventory = () => {
  router.push('/inventory')
}

const handleGoReview = () => {
  router.push('/review')
}

const handleCopyToNextWeek = async () => {
  await prepStore.copyCurrentPlanToNextWeek()
  if (prepStore.lastError) {
    showFailToast(prepStore.lastError)
    return
  }

  showSuccessToast('已复制到下周')
}

onMounted(async () => {
  await prepStore.bootstrap()
})
</script>

<style scoped>
.hero-card {
  background: var(--prep-surface);
  border-radius: var(--prep-radius-xl);
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: var(--prep-shadow-card);
  border: 1px solid rgba(0, 0, 0, 0.02);
}

.row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.quick-card {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.quick-btn {
  height: 48px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  color: #475569;
  background: #fff;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.quick-btn:active {
  background: #f8fafc;
  transform: translateY(1px);
}
</style>
