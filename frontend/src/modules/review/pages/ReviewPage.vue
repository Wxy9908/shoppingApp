<template>
  <section class="page" aria-label="周复盘页面">
    <article class="card">
      <h1 class="title">周复盘</h1>
      <p class="desc">用于 4 周 Go / No-Go 评估，持续记录每周核心指标。</p>
      <div class="chip-row">
        <span class="chip chip--active">计划耗时 {{ reviewForm.planningMinutes }} 分钟</span>
        <span class="chip">采购耗时 {{ reviewForm.shoppingMinutes }} 分钟</span>
        <span class="chip">完成率 {{ reviewForm.completionRate }}%</span>
      </div>
    </article>

    <article class="card form-card">
      <h2 class="sub-title">本周指标填写</h2>
      <van-form class="review-form" @submit="handleSaveReview">
        <van-field v-model.number="reviewForm.planningMinutes" type="digit" label="计划耗时(分钟)" aria-label="计划耗时" />
        <van-field v-model.number="reviewForm.shoppingMinutes" type="digit" label="采购耗时(分钟)" aria-label="采购耗时" />
        <van-field v-model.number="reviewForm.missedItemsCount" type="digit" label="漏买次数" aria-label="漏买次数" />
        <van-field v-model.number="reviewForm.wastedItemsCount" type="digit" label="浪费食材数" aria-label="浪费食材数" />
        <van-field v-model.number="reviewForm.actualCost" type="digit" label="实际花费(元)" aria-label="实际花费" />
        <van-field v-model.number="reviewForm.completionRate" type="digit" label="完成率(%)" aria-label="完成率" />
        <van-button native-type="submit" type="primary" block :loading="prepStore.isLoading">保存本周复盘</van-button>
      </van-form>
      <p v-if="prepStore.weeklyReview?.updatedAt" class="update-time">
        最近更新时间：{{ formatTime(prepStore.weeklyReview.updatedAt) }}
      </p>
    </article>

    <article class="card">
      <h2 class="sub-title">预算对比</h2>
      <p class="metric-line">预算：{{ budget }} 元</p>
      <p class="metric-line">实际：{{ reviewForm.actualCost }} 元</p>
      <p class="metric-line" :class="{ over: reviewForm.actualCost > budget }">
        状态：{{ reviewForm.actualCost > budget ? '超预算' : '预算内' }}
      </p>
    </article>

    <article class="card">
      <h2 class="sub-title">本周检查项</h2>
      <ul class="check-list" aria-label="本周验收检查项">
        <li>漏买次数：{{ reviewForm.missedItemsCount }} 次</li>
        <li>浪费食材：{{ reviewForm.wastedItemsCount }} 件</li>
        <li>清单三态互斥切换正常</li>
        <li>库存扣减与回滚日志可追踪</li>
      </ul>
    </article>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive } from 'vue'
import { showFailToast, showSuccessToast } from 'vant'
import { MEAL_ITEM_STATUS, SHOPPING_ITEM_STATUS, usePrepStore } from '../../../app/store/usePrepStore'

defineOptions({
  name: 'ReviewPage',
})

const prepStore = usePrepStore()
const reviewForm = reactive({
  planningMinutes: 0,
  shoppingMinutes: 0,
  missedItemsCount: 0,
  wastedItemsCount: 0,
  completionRate: 0,
  actualCost: 0,
})

const budget = computed(() => Number(prepStore.currentPlan?.budget || 0))
const derivedActualCost = computed(() => {
  const purchasedItems = prepStore.shoppingItems.filter(
    (item) => (item.status || SHOPPING_ITEM_STATUS.PENDING) === SHOPPING_ITEM_STATUS.PURCHASED
  )
  return purchasedItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
})

const derivedCompletionRate = computed(() => {
  const total = prepStore.shoppingItems.length + prepStore.mealItems.length
  if (!total) {
    return 0
  }
  const doneShopping = prepStore.shoppingItems.filter(
    (item) => (item.status || SHOPPING_ITEM_STATUS.PENDING) !== SHOPPING_ITEM_STATUS.PENDING
  ).length
  const doneMeals = prepStore.mealItems.filter(
    (item) => (item.status || MEAL_ITEM_STATUS.PENDING) === MEAL_ITEM_STATUS.COMPLETED
  ).length
  const done = doneShopping + doneMeals
  return Math.round((done / total) * 100)
})

const derivedPlanningMinutes = computed(() => (prepStore.currentPlan ? 10 : 0))
const derivedShoppingMinutes = computed(() => (prepStore.shoppingItems.length ? 35 : 0))
const derivedMissedItemsCount = computed(
  () => prepStore.shoppingItems.filter((item) => (item.status || SHOPPING_ITEM_STATUS.PENDING) === SHOPPING_ITEM_STATUS.PENDING).length
)
const derivedWastedItemsCount = computed(() =>
  prepStore.inventoryItems.filter((item) => Number(item.quantity || 0) <= 0).length
)

const syncReviewForm = () => {
  const savedReview = prepStore.weeklyReview
  reviewForm.planningMinutes = Number(savedReview?.planningMinutes ?? derivedPlanningMinutes.value)
  reviewForm.shoppingMinutes = Number(savedReview?.shoppingMinutes ?? derivedShoppingMinutes.value)
  reviewForm.missedItemsCount = Number(savedReview?.missedItemsCount ?? derivedMissedItemsCount.value)
  reviewForm.wastedItemsCount = Number(savedReview?.wastedItemsCount ?? derivedWastedItemsCount.value)
  reviewForm.completionRate = Number(savedReview?.completionRate ?? derivedCompletionRate.value)
  reviewForm.actualCost = Number(savedReview?.actualCost ?? derivedActualCost.value)
}

const formatTime = (timeValue) => {
  if (!timeValue) {
    return '--'
  }
  return new Date(timeValue).toLocaleString('zh-CN')
}

const handleSaveReview = async () => {
  await prepStore.saveWeeklyReview({
    planningMinutes: reviewForm.planningMinutes,
    shoppingMinutes: reviewForm.shoppingMinutes,
    missedItemsCount: reviewForm.missedItemsCount,
    wastedItemsCount: reviewForm.wastedItemsCount,
    completionRate: reviewForm.completionRate,
    actualCost: reviewForm.actualCost,
    budget: budget.value,
  })
  if (prepStore.lastError) {
    showFailToast(prepStore.lastError)
    return
  }

  showSuccessToast('周复盘已保存')
}

onMounted(async () => {
  await prepStore.bootstrap()
  syncReviewForm()
})
</script>

<style scoped>
.desc {
  margin: 8px 0 0;
}

.chip-row {
  margin-top: 12px;
  flex-wrap: wrap;
}

.chip {
  padding: 4px 10px;
  font-size: 12px;
}

.review-form {
  margin-top: 10px;
  display: grid;
}

.update-time { margin: 10px 0 0; }

.metric-line {
  margin: 8px 0 0;
  font-size: 13px;
}

.metric-line.over {
  color: #ef4444;
  font-weight: 600;
}

.check-list {
  margin: 10px 0 0;
  padding-left: 18px;
  color: #475569;
  font-size: 13px;
  line-height: 1.7;
}
</style>
