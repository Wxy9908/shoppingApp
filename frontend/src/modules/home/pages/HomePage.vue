<template>
  <section class="page" aria-label="首页">
    <header class="hero-card">
      <div class="between">
        <h1 class="title">本周计划 · {{ currentWeekLabel }}</h1>
        <span v-if="hasCurrentPlan" class="hero-tag">进行中</span>
      </div>
      <p class="desc">{{ planMetaText }}</p>
      <div v-if="weekRangeText" class="week-range-text">{{ weekRangeText }}</div>
      <div class="row home-plan-actions" :class="{ 'home-plan-actions--single': !hasCurrentPlan }">
        <button class="btn btn--primary home-plan-btn" @click="handleGoPlan">{{ planEntryButtonText }}</button>
        <button v-if="hasCurrentPlan" class="btn home-plan-btn" @click="handleCopyToNextWeek">
          复制到下周
        </button>
      </div>
    </header>

    <article class="card" aria-label="周进度">
      <div class="between">
        <h2 class="title">本周进度</h2>
        <div class="progress-badge">{{ completionPercent }}%</div>
      </div>
      <div class="progress-container">
        <div class="progress-bar" :style="{ width: completionPercent + '%', height: '100%', background: 'linear-gradient(90deg, var(--prep-primary), #60a5fa)', borderRadius: '999px', transition: 'width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' }" />
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
import { MEAL_ITEM_STATUS, SHOPPING_ITEM_STATUS, usePrepStore, formatWeekRange } from '../../../app/store/usePrepStore'

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
  if (!prepStore.currentPlan) {
    return '未创建'
  }
  return prepStore.currentPlan.weekLabel || `Week ${prepStore.planCount || 1}`
})

const weekRangeText = computed(() => {
  if (!prepStore.currentPlan?.weekStartDate) {
    return ''
  }
  return formatWeekRange(
    prepStore.currentPlan.weekStartDate,
    prepStore.currentPlan.days,
    prepStore.currentPlan.selectedDayIndexes || []
  )
})

const planMetaText = computed(() => {
  if (!prepStore.currentPlan) {
    return '还没有本周计划，先创建计划再生成菜单与清单。'
  }

  const planNameText = prepStore.currentPlan.planName ? `${prepStore.currentPlan.planName} · ` : ''
  return `${planNameText}${prepStore.currentPlan.days} 天 · ${prepStore.currentPlan.peopleCount} 人 · 预算 ${prepStore.currentPlan.budget} 元`
})

const planEntryButtonText = computed(() => (prepStore.hasActivePlan ? '编辑计划' : '新建计划'))
const hasCurrentPlan = computed(() => prepStore.hasActivePlan)

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
  if (!hasCurrentPlan.value) {
    showFailToast('请先创建本周计划')
    return
  }

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
.week-range-text {
  font-size: 11px;
  color: var(--prep-text-muted);
  background: rgba(0, 0, 0, 0.03);
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
}

.progress-container {
  margin-top: 12px;
  height: 8px;
  background: #f1f5f9;
  border-radius: 999px;
  overflow: hidden;
  position: relative;
}

.row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.home-plan-actions {
  margin-top: var(--prep-space-5);
}

.home-plan-actions--single {
  justify-content: flex-start;
}

.home-plan-btn {
  flex: 1;
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
