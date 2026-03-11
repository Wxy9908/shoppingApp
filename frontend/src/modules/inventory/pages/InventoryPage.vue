<template>
  <section class="page" aria-label="库存页面">
    <header class="head-card">
      <h1 class="title">库存管理</h1>
      <p class="desc">录入现有库存后，清单标记“冰箱已有”会自动扣减，并写入库存流水。</p>
    </header>

    <article class="card">
      <van-form class="form" @submit="handleSaveInventory">
        <van-field
          v-model.trim="form.name"
          label="食材名"
          placeholder="如：番茄"
          :rules="[{ required: true, message: '请输入食材名' }]"
          aria-label="库存食材名"
        />
        <van-field
          v-model.number="form.quantity"
          type="digit"
          label="数量"
          placeholder="如：500"
          :rules="[{ required: true, message: '请输入数量' }]"
          aria-label="库存数量"
        />
        <van-field
          v-model.trim="form.unit"
          label="单位"
          placeholder="如：g"
          :rules="[{ required: true, message: '请输入单位' }]"
          aria-label="库存单位"
        />
        <van-field
          v-model.trim="form.category"
          label="分类"
          placeholder="如：蔬菜"
          aria-label="库存分类"
        />
        <van-button native-type="submit" type="primary" block :loading="prepStore.isLoading">新增/补货库存</van-button>
      </van-form>
    </article>

    <van-empty v-if="!prepStore.inventoryItems.length" description="暂无库存，请先录入。" />

    <section class="list card" aria-label="库存列表">
      <article v-for="item in prepStore.inventoryItems" :key="item.id" class="inventory-card">
        <h2 class="inventory-name">{{ item.name }}</h2>
        <p class="inventory-meta">{{ item.quantity }} {{ item.unit }} · {{ item.category || '其他' }}</p>
      </article>
    </section>

    <section class="log-section card" aria-label="库存流水">
      <h2 class="log-title">最近库存流水</h2>
      <van-empty v-if="!prepStore.inventoryLogs.length" description="暂无库存流水。" />
      <article v-for="log in prepStore.inventoryLogs" :key="log.id" class="log-card">
        <p class="log-main">
          {{ log.changeType === 'deduct' ? '扣减' : '回滚' }} · {{ log.changeAmount }} · {{ formatLogTime(log.createdAt) }}
        </p>
        <p class="log-sub">sourceId: {{ log.sourceId }}</p>
      </article>
    </section>
  </section>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { showFailToast, showSuccessToast } from 'vant'
import { usePrepStore } from '../../../app/store/usePrepStore'

defineOptions({
  name: 'InventoryPage',
})

const prepStore = usePrepStore()
const form = reactive({
  name: '',
  quantity: 100,
  unit: 'g',
  category: '其他',
})

const formatLogTime = (timeValue) => {
  if (!timeValue) {
    return '--'
  }
  return new Date(timeValue).toLocaleString('zh-CN')
}

const handleSaveInventory = async () => {
  await prepStore.saveInventoryItem({
    name: form.name,
    quantity: form.quantity,
    unit: form.unit,
    category: form.category || '其他',
  })

  if (prepStore.lastError) {
    showFailToast(prepStore.lastError)
    return
  }

  form.name = ''
  form.quantity = 100
  form.unit = 'g'
  form.category = '其他'
  showSuccessToast('库存已更新')
}

onMounted(async () => {
  await prepStore.bootstrap()
})
</script>

<style scoped>
.desc {
  margin: 8px 0 0;
  line-height: 1.6;
}

.form {
  display: grid;
  gap: 8px;
}

.list { gap: 10px; }

.inventory-card {
  border: 1px solid var(--prep-line-soft);
  border-radius: 12px;
  padding: 10px;
  background: var(--prep-surface-muted);
}

.inventory-name {
  margin: 0;
  font-size: 14px;
}

.inventory-meta {
  margin: 4px 0 0;
}

.log-title {
  margin: 0 0 8px;
  font-size: 14px;
  color: var(--prep-text);
}

.log-card {
  border-top: 1px solid #f1f5f9;
  padding: 8px 0;
}

.log-main,
.log-sub {
  margin: 0;
  font-size: 12px;
}

.log-sub {
  margin-top: 4px;
}
</style>
