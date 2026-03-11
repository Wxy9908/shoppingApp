<template>
  <section class="page" aria-label="菜单页面">
    <header class="card">
      <div class="between">
        <div class="title">菜单页</div>
        <span class="tag orange">周视图</span>
      </div>
      <div v-if="dateTabs.length" class="scroll-x" style="margin-top: 12px;">
        <span
          v-for="dateTab in dateTabs"
          :key="dateTab.value"
          class="pill"
          :class="{ active: activeDate === dateTab.value }"
          @click="handleSwitchDate(dateTab.value)"
        >
          {{ dateTab.label }}
        </span>
      </div>
      <div class="row" style="margin-top: 16px;">
        <button class="btn btn--primary" style="flex: 1;" :loading="prepStore.isLoading" @click="handleGenerateMenu">
          生成本周菜单
        </button>
      </div>
    </header>

    <div v-if="!prepStore.hasActivePlan" class="empty">
      <p class="empty-text">请先在计划页创建本周计划。</p>
      <button class="btn btn--primary" style="width: 100%;" @click="handleGoPlan">去创建周计划</button>
    </div>

    <div v-else class="content">
      <van-empty v-if="!prepStore.mealItems.length" description="还没有菜单，先点击上方按钮生成。" />

      <article v-for="item in visibleMealItems" :key="item.id" class="meal-card">
        <div class="between">
          <div>
            <div class="meal-name">{{ item.mealType }} · {{ item.dishName }}</div>
            <div class="meta">
              <span>⏱ {{ item.prepMinutes || 20 }}m</span>
              <span>📊 {{ item.difficulty || '中等' }}</span>
              <span>🍎 食材 {{ item.ingredients?.length || 0 }}</span>
            </div>
          </div>
          <span class="tag green">{{ item.mealType }}</span>
        </div>

        <div class="row" style="margin-top: 16px;">
          <button class="btn btn--sm" @click="handleToggleReplace(item.id)">替换</button>
          <button class="btn btn--sm" @click="handleDeleteMeal(item.id)">删除</button>
          <button
            class="btn btn--sm btn--primary"
            style="flex: 1.5;"
            @click="handleToggleMealStatus(item)"
          >
            {{ getMealStatus(item) === MEAL_ITEM_STATUS.COMPLETED ? '取消完成' : '标记完成' }}
          </button>
        </div>

        <div v-if="replacingMealId === item.id" class="field" style="margin-top: 12px;">
          <select
            :id="`dish-${item.id}`"
            class="dish-select"
            :value="item.dishId"
            aria-label="选择替换菜品"
            @change="handleDishChange($event, item.id)"
          >
            <option v-for="dish in prepStore.dishTemplates" :key="dish.id" :value="dish.id">
              {{ dish.name }}（{{ dish.prepMinutes }} 分钟）
            </option>
          </select>
        </div>

        <details v-if="item.steps && item.steps.length" style="margin-top: 16px; background: #f8fafc; border-radius: 16px; padding: 4px 16px; border: 1px solid #f1f5f9;">
          <summary style="font-size: 13px; color: #3b82f6; cursor: pointer; padding: 10px 0; font-weight: 500;">查看做饭流程</summary>
          <ol style="margin: 0 0 14px 20px; padding: 0; color: #475569; font-size: 14px; line-height: 1.6; font-weight: 400;">
            <li v-for="(step, index) in item.steps" :key="index">
              <strong>{{ step.title }}：</strong>{{ step.content }}
            </li>
          </ol>
        </details>
      </article>

      <button class="btn btn--primary" style="width: 100%;" @click="handleGoShopping">
        去生成购物清单
      </button>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showFailToast, showSuccessToast } from 'vant'
import { MEAL_ITEM_STATUS, usePrepStore } from '../../../app/store/usePrepStore'

defineOptions({
  name: 'MenuPage',
})

const prepStore = usePrepStore()
const router = useRouter()
const activeDate = ref('')
const replacingMealId = ref(null)

const handleToggleReplace = (mealId) => {
  replacingMealId.value = replacingMealId.value === mealId ? null : mealId
}

const dateTabs = computed(() => {
  const dateSet = new Set(prepStore.mealItems.map((item) => item.date))
  return Array.from(dateSet)
    .sort((left, right) => left.localeCompare(right, 'zh-CN'))
    .map((value) => ({
      value,
      label: value,
    }))
})

const visibleMealItems = computed(() => {
  if (!activeDate.value) {
    return prepStore.mealItems
  }

  return prepStore.mealItems.filter((item) => item.date === activeDate.value)
})

const formatIngredients = (ingredients = []) => {
  if (!ingredients.length) {
    return '暂无食材'
  }

  return ingredients.map((ingredient) => `${ingredient.name}${ingredient.quantity}${ingredient.unit}`).join('、')
}

const handleGoPlan = () => {
  router.push('/plan')
}

const handleGoShopping = () => {
  router.push('/shopping')
}

const handleSwitchDate = (dateValue) => {
  activeDate.value = dateValue
}

const handleGenerateMenu = async () => {
  await prepStore.generateMenu()
  if (prepStore.lastError) {
    showFailToast(prepStore.lastError)
    return
  }

  showSuccessToast('菜单生成成功')
  if (dateTabs.value.length) {
    activeDate.value = dateTabs.value[0].value
  }
}

const handleDishChange = async (event, mealItemId) => {
  const nextDishId = event.target.value
  await prepStore.replaceMealTemplate(mealItemId, nextDishId)
  if (prepStore.lastError) {
    showFailToast(prepStore.lastError)
    return
  }

  showSuccessToast('菜品替换成功')
}

const getMealStatus = (mealItem) => {
  return mealItem.status || MEAL_ITEM_STATUS.PENDING
}

const handleToggleMealStatus = async (mealItem) => {
  const nextStatus = getMealStatus(mealItem) === MEAL_ITEM_STATUS.COMPLETED ? MEAL_ITEM_STATUS.PENDING : MEAL_ITEM_STATUS.COMPLETED
  await prepStore.updateMealItemStatus(mealItem.id, nextStatus)
  if (prepStore.lastError) {
    showFailToast(prepStore.lastError)
    return
  }

  showSuccessToast(nextStatus === MEAL_ITEM_STATUS.COMPLETED ? '已标记完成' : '已恢复为待做')
}

const handleDeleteMeal = async (mealItemId) => {
  await prepStore.removeMealItem(mealItemId)
  if (prepStore.lastError) {
    showFailToast(prepStore.lastError)
    return
  }

  showSuccessToast('菜品已删除')
}

onMounted(async () => {
  await prepStore.bootstrap()
  if (dateTabs.value.length) {
    activeDate.value = dateTabs.value[0].value
  }
})
</script>

<style scoped>
.row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.scroll-x {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 4px 0;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.scroll-x::-webkit-scrollbar {
  display: none;
}

.tag {
  font-size: 12px;
  font-weight: 500;
  border-radius: 8px;
  padding: 4px 10px;
  background: #f1f5f9;
  color: #475569;
}

.tag.orange {
  background: #fff7ed;
  color: #d97706;
}

.tag.green {
  background: #ecfdf5;
  color: #059669;
}

.dish-select {
  width: 100%;
  height: 44px;
  border: 1px solid #f1f5f9;
  border-radius: 14px;
  padding: 0 16px;
  font-size: 15px;
  background: #f8fafc;
  appearance: none;
  color: #1e293b;
  transition: all 0.2s;
}

.content {
  display: grid;
  gap: 16px;
}
</style>
