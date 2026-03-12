<template>
  <section class="page" aria-label="购物清单页面">
    <header class="card">
      <div class="between">
        <div class="title" style="font-size: 18px;">购物清单</div>
        <button class="btn btn--primary btn--sm" @click="handleOpenAddDialog">+ 新增食材</button>
      </div>
      <div class="summary-line">
        待购买 {{ pendingCount }} 项 · 已购买 {{ purchasedCount }} 项 · 冰箱已有 {{ inStockCount }} 项
      </div>
      <div class="scroll-x" style="margin-top: 16px;" role="tablist" aria-label="购物清单筛选">
        <span
          v-for="filter in filters"
          :key="filter.value"
          class="pill"
          :class="{ active: activeFilter === filter.value }"
          @click="handleSwitchFilter(filter.value)"
        >
          {{ filter.label }}
        </span>
      </div>
    </header>

    <div v-if="!prepStore.hasActivePlan" class="empty">
      <p class="empty-text">当前周无有效计划，请先创建计划并生成菜单。</p>
      <button class="btn btn--primary" style="width: 100%;" @click="handleGoPlan">去计划页</button>
    </div>

    <div v-else class="content">
      <p v-if="prepStore.shoppingListNeedsRefresh && prepStore.shoppingItems.length" class="hint">
        菜单已变更，建议先重新生成购物清单再继续采购。
      </p>
      <button class="btn btn--primary" style="width: 100%;" :loading="prepStore.isLoading" @click="handleGenerateShopping">
        {{ prepStore.shoppingListNeedsRefresh ? '重新生成购物清单' : '根据菜单生成购物清单' }}
      </button>

      <van-empty v-if="!filteredCategoryList.length" description="当前筛选下无清单项。" />

      <section
        v-for="categoryGroup in filteredCategoryList"
        :key="categoryGroup.category"
        class="card"
        :aria-label="`${categoryGroup.category}分类`"
      >
        <div class="between">
          <div class="title">{{ categoryGroup.category }}</div>
          <span class="tag">{{ categoryGroup.items.length }} 项</span>
        </div>

        <div class="shopping-list">
          <div v-for="item in categoryGroup.items" :key="item.id" class="shopping-item">
            <div class="between">
              <div class="item-name">{{ item.name }} {{ item.quantity }}{{ item.unit }}</div>
              <span class="desc">{{ getShoppingStatusLabel(item.status) }}</span>
            </div>

            <div class="status-group">
              <button
                type="button"
                class="status-btn pending"
                :class="{ 'status-btn--active': item.status === SHOPPING_ITEM_STATUS.PENDING }"
                @click="handleStatusChange(item.id, SHOPPING_ITEM_STATUS.PENDING)"
              >
                待购买
              </button>
              <button
                type="button"
                class="status-btn purchased"
                :class="{ 'status-btn--active': item.status === SHOPPING_ITEM_STATUS.PURCHASED }"
                @click="handleStatusChange(item.id, SHOPPING_ITEM_STATUS.PURCHASED)"
              >
                已购买
              </button>
              <button
                type="button"
                class="status-btn inventory"
                :class="{ 'status-btn--active': item.status === SHOPPING_ITEM_STATUS.IN_STOCK }"
                @click="handleStatusChange(item.id, SHOPPING_ITEM_STATUS.IN_STOCK)"
              >
                冰箱已有
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- eslint-disable vue/no-v-model-argument -->
    <van-dialog
      v-model:show="isAddDialogVisible"
      title="新增食材"
      show-cancel-button
      confirm-button-text="确认添加"
      cancel-button-text="取消"
      @confirm="handleManualAdd"
    >
      <van-form class="manual-form" @submit.prevent>
        <van-field v-model.trim="manualForm.name" label="食材名" placeholder="例如：土豆" aria-label="食材名" />
        <van-field v-model.number="manualForm.quantity" type="digit" label="数量" placeholder="例如：2" aria-label="数量" />
        <van-field v-model.trim="manualForm.unit" label="单位" placeholder="个 / g / ml" aria-label="单位" />
        <van-field v-model.trim="manualForm.category" label="分类" placeholder="蔬菜 / 肉禽 / 调料 / 其他" aria-label="分类" />
      </van-form>
    </van-dialog>
    <!-- eslint-enable vue/no-v-model-argument -->
  </section>
</template>

<script setup>
import { computed, reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showFailToast, showSuccessToast } from 'vant'
import { SHOPPING_ITEM_STATUS, getShoppingStatusLabel, usePrepStore } from '../../../app/store/usePrepStore'

defineOptions({
  name: 'ShoppingPage',
})

const router = useRouter()
const prepStore = usePrepStore()
const activeFilter = ref('all')
const isAddDialogVisible = ref(false)

const manualForm = reactive({
  name: '',
  quantity: 1,
  unit: '个',
  category: '其他',
})

const filters = [
  { label: '全部', value: 'all' },
  { label: '待购买', value: SHOPPING_ITEM_STATUS.PENDING },
  { label: '已购买', value: SHOPPING_ITEM_STATUS.PURCHASED },
  { label: '冰箱已有', value: SHOPPING_ITEM_STATUS.IN_STOCK },
]

const pendingCount = computed(
  () => prepStore.shoppingItems.filter((item) => item.status === SHOPPING_ITEM_STATUS.PENDING).length
)
const purchasedCount = computed(
  () => prepStore.shoppingItems.filter((item) => item.status === SHOPPING_ITEM_STATUS.PURCHASED).length
)
const inStockCount = computed(
  () => prepStore.shoppingItems.filter((item) => item.status === SHOPPING_ITEM_STATUS.IN_STOCK).length
)

const filteredCategoryList = computed(() => {
  const groupedMap = prepStore.shoppingItems.reduce((accumulator, item) => {
    if (activeFilter.value !== 'all' && item.status !== activeFilter.value) {
      return accumulator
    }

    const category = item.category || '其他'
    if (!accumulator.has(category)) {
      accumulator.set(category, [])
    }
    accumulator.get(category).push(item)
    return accumulator
  }, new Map())

  return Array.from(groupedMap.entries()).map(([category, items]) => ({
    category,
    items,
  }))
})

const handleGoPlan = () => {
  router.push('/plan')
}

const handleSwitchFilter = (filterValue) => {
  activeFilter.value = filterValue
}

const handleOpenAddDialog = () => {
  isAddDialogVisible.value = true
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
  if (!manualForm.name.trim()) {
    showFailToast('请输入食材名')
    return
  }

  if (!Number.isFinite(Number(manualForm.quantity)) || Number(manualForm.quantity) <= 0) {
    showFailToast('请输入大于 0 的数量')
    return
  }

  if (!manualForm.unit.trim()) {
    showFailToast('请输入单位')
    return
  }

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
  isAddDialogVisible.value = false
  showSuccessToast('已新增到购物清单')
}

onMounted(async () => {
  await prepStore.bootstrap()
})
</script>

<style scoped>
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

.shopping-list {
  display: grid;
}

.manual-form {
  padding: 16px;
  display: grid;
  gap: 12px;
}

button {
  cursor: pointer;
}
</style>
