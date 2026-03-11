<template>
  <section class="page" aria-label="菜单页面">
    <h1 class="title">菜单管理</h1>
    <p class="desc">支持生成周菜单、手动替换菜品，并保留持久化结果。</p>

    <div v-if="!prepStore.hasActivePlan" class="empty">
      <p class="empty-text">请先在计划页创建本周计划。</p>
      <van-button type="primary" block aria-label="去创建周计划" @click="handleGoPlan">去创建周计划</van-button>
    </div>

    <div v-else class="content">
      <div class="toolbar">
        <van-button type="primary" size="small" :loading="prepStore.isLoading" @click="handleGenerateMenu">
          生成本周菜单
        </van-button>
      </div>

      <van-empty v-if="!prepStore.mealItems.length" description="还没有菜单，先点击上方按钮生成。" />

      <article v-for="item in prepStore.mealItems" :key="item.id" class="meal-card">
        <header class="meal-header">
          <strong>{{ item.date }} · {{ item.mealType }}</strong>
        </header>

        <div class="meal-body">
          <p class="dish-name">{{ item.dishName }}</p>
          <p class="ingredients">{{ formatIngredients(item.ingredients) }}</p>
        </div>

        <footer class="meal-footer">
          <label class="select-label" :for="`dish-${item.id}`">替换菜品</label>
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
          <van-button plain type="danger" size="small" @click="handleDeleteMeal(item.id)">删除</van-button>
        </footer>
      </article>

      <van-button type="success" block aria-label="前往购物清单" @click="handleGoShopping">
        去生成购物清单
      </van-button>
    </div>
  </section>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showFailToast, showSuccessToast } from 'vant'
import { usePrepStore } from '../../../app/store/usePrepStore'

defineOptions({
  name: 'MenuPage',
})

const prepStore = usePrepStore()
const router = useRouter()

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

const handleGenerateMenu = async () => {
  await prepStore.generateMenu()
  if (prepStore.lastError) {
    showFailToast(prepStore.lastError)
    return
  }

  showSuccessToast('菜单生成成功')
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
})
</script>

<style scoped>
.page {
  border-radius: 12px;
  background: #ffffff;
  padding: 16px;
  box-shadow: 0 4px 16px rgb(0 0 0 / 4%);
}

.title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.desc {
  margin: 8px 0 12px;
  color: #646566;
  line-height: 1.6;
}

.empty-text {
  margin: 0 0 10px;
  color: #646566;
}

.toolbar {
  margin-bottom: 12px;
}

.content {
  display: grid;
  gap: 12px;
}

.meal-card {
  border: 1px solid #e7e8ea;
  border-radius: 10px;
  padding: 12px;
  background: #fff;
}

.meal-header {
  margin-bottom: 6px;
  color: #323233;
}

.meal-body {
  margin-bottom: 10px;
}

.dish-name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.ingredients {
  margin: 6px 0 0;
  color: #646566;
  font-size: 13px;
}

.meal-footer {
  display: grid;
  gap: 6px;
}

.select-label {
  font-size: 13px;
  color: #646566;
}

.dish-select {
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  min-height: 32px;
  padding: 0 8px;
}
</style>
