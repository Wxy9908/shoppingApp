<template>
  <section class="page" aria-label="购物清单页面">
    <h1 class="title">购物清单</h1>
    <p class="desc">支持菜单自动聚合（别名归一、单位换算）和手动补充食材。</p>

    <div v-if="!prepStore.hasActivePlan" class="empty">
      <p class="empty-text">当前周无有效计划，请先创建计划并生成菜单。</p>
      <van-button type="primary" block aria-label="去计划页" @click="handleGoPlan">去计划页</van-button>
    </div>

    <div v-else class="content">
      <van-button type="primary" block :loading="prepStore.isLoading" @click="handleGenerateShopping">
        根据菜单生成购物清单
      </van-button>

      <van-form class="manual-form" @submit="handleManualAdd">
        <van-field
          v-model.trim="manualForm.name"
          label="食材名"
          placeholder="如：西红柿"
          :rules="[{ required: true, message: '请输入食材名' }]"
          aria-label="手动新增食材名"
        />
        <van-field
          v-model.number="manualForm.quantity"
          type="digit"
          label="数量"
          placeholder="如：2"
          :rules="[{ required: true, message: '请输入数量' }]"
          aria-label="手动新增数量"
        />
        <van-field
          v-model.trim="manualForm.unit"
          label="单位"
          placeholder="如：个 / g"
          :rules="[{ required: true, message: '请输入单位' }]"
          aria-label="手动新增单位"
        />
        <van-field
          v-model.trim="manualForm.category"
          label="分类"
          placeholder="如：蔬菜、肉禽"
          aria-label="手动新增分类"
        />
        <van-button native-type="submit" type="success" block>手动新增食材</van-button>
      </van-form>

      <van-empty v-if="!prepStore.shoppingItems.length" description="还没有清单，先点击上方按钮生成。" />

      <section
        v-for="(items, category) in prepStore.shoppingItemsByCategory"
        :key="category"
        class="category-section"
        :aria-label="`${category}分类`"
      >
        <h2 class="category-title">{{ category }}</h2>
        <article v-for="item in items" :key="item.id" class="shopping-item">
          <div>
            <p class="item-name">{{ item.name }}</p>
            <p class="item-quantity">{{ item.quantity }} {{ item.unit }}</p>
          </div>

          <div class="item-right">
            <div class="status-actions">
              <button
                type="button"
                class="status-chip"
                :class="{ 'status-chip--active': item.status === SHOPPING_ITEM_STATUS.PENDING }"
                :aria-label="`将${item.name}标记为待购买`"
                @click="handleStatusChange(item.id, SHOPPING_ITEM_STATUS.PENDING)"
              >
                待购买
              </button>
              <button
                type="button"
                class="status-chip"
                :class="{ 'status-chip--active': item.status === SHOPPING_ITEM_STATUS.PURCHASED }"
                :aria-label="`将${item.name}标记为已购买`"
                @click="handleStatusChange(item.id, SHOPPING_ITEM_STATUS.PURCHASED)"
              >
                已购买
              </button>
              <button
                type="button"
                class="status-chip"
                :class="{ 'status-chip--active': item.status === SHOPPING_ITEM_STATUS.IN_STOCK }"
                :aria-label="`将${item.name}标记为冰箱已有`"
                @click="handleStatusChange(item.id, SHOPPING_ITEM_STATUS.IN_STOCK)"
              >
                冰箱已有
              </button>
            </div>

            <van-tag v-if="item.needsManualConfirm" type="warning">需手动确认</van-tag>
            <van-tag v-else plain type="primary">已聚合</van-tag>
          </div>
        </article>
      </section>
    </div>
  </section>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showFailToast, showSuccessToast } from 'vant'
import { SHOPPING_ITEM_STATUS, getShoppingStatusLabel, usePrepStore } from '../../../app/store/usePrepStore'

defineOptions({
  name: 'ShoppingPage',
})

const router = useRouter()
const prepStore = usePrepStore()

const manualForm = reactive({
  name: '',
  quantity: 1,
  unit: '个',
  category: '其他',
})

const handleGoPlan = () => {
  router.push('/plan')
}

const handleGenerateShopping = async () => {
  if (!prepStore.mealItems.length) {
    showFailToast('请先在菜单页生成菜单')
    return
  }

  await prepStore.generateShoppingList()
  if (prepStore.lastError) {
    showFailToast(prepStore.lastError)
    return
  }

  showSuccessToast('购物清单已生成')
}

const handleStatusChange = async (itemId, nextStatus) => {
  await prepStore.updateShoppingItemStatus(itemId, nextStatus)
  if (prepStore.lastError) {
    showFailToast(prepStore.lastError)
    return
  }

  showSuccessToast(`状态已更新为${getShoppingStatusLabel(nextStatus)}`)
}

const handleManualAdd = async () => {
  await prepStore.addManualShoppingItem({
    name: manualForm.name,
    quantity: manualForm.quantity,
    unit: manualForm.unit,
    category: manualForm.category || '其他',
  })

  if (prepStore.lastError) {
    showFailToast(prepStore.lastError)
    return
  }

  manualForm.name = ''
  manualForm.quantity = 1
  manualForm.unit = '个'
  manualForm.category = '其他'
  showSuccessToast('已新增到购物清单')
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

.content {
  display: grid;
  gap: 12px;
}

.manual-form {
  display: grid;
  gap: 8px;
}

.category-section {
  border: 1px solid #ececec;
  border-radius: 10px;
  padding: 10px;
}

.category-title {
  margin: 0 0 8px;
  font-size: 14px;
  color: #323233;
}

.shopping-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-top: 1px dashed #efefef;
  padding: 8px 0;
  gap: 10px;
}

.item-name {
  margin: 0;
  font-size: 14px;
}

.item-quantity {
  margin: 4px 0 0;
  color: #646566;
  font-size: 13px;
}

.item-right {
  display: grid;
  justify-items: end;
  gap: 6px;
}

.status-actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.status-chip {
  border: 1px solid #d9d9d9;
  border-radius: 14px;
  background: #fff;
  color: #646566;
  font-size: 12px;
  padding: 2px 8px;
  line-height: 1.6;
  cursor: pointer;
}

.status-chip--active {
  border-color: #1989fa;
  color: #1989fa;
  background: #f0f7ff;
}
</style>
