<template>
  <section class="page" aria-label="周计划页面">
    <h1 class="title">周计划创建</h1>
    <p class="desc">10 分钟完成本周规划，后续可在菜单页继续调整菜品。</p>

    <van-form class="form" @submit="handleSavePlan">
      <van-field
        v-model.number="form.peopleCount"
        type="digit"
        label="人数"
        placeholder="请输入就餐人数"
        :rules="[{ required: true, message: '请填写人数' }]"
        aria-label="就餐人数"
      />
      <van-field
        v-model.number="form.days"
        type="digit"
        label="天数"
        placeholder="请输入规划天数（1-7）"
        :rules="[{ required: true, message: '请填写天数' }]"
        aria-label="规划天数"
      />
      <van-field
        v-model.number="form.budget"
        type="digit"
        label="预算"
        placeholder="请输入本周预算（元）"
        :rules="[{ required: true, message: '请填写预算' }]"
        aria-label="每周预算"
      />
      <van-field
        v-model.trim="form.preferences"
        label="口味偏好"
        placeholder="如：清淡、少油、快手菜"
        aria-label="口味偏好"
      />

      <div class="actions">
        <van-button native-type="submit" type="primary" block :loading="prepStore.isLoading">保存计划</van-button>
        <van-button
          type="default"
          block
          aria-label="前往菜单页"
          :disabled="!prepStore.hasActivePlan"
          @click="handleGoMenu"
        >
          前往菜单管理
        </van-button>
        <van-button
          type="success"
          block
          aria-label="复制到下周"
          :disabled="!prepStore.hasActivePlan"
          :loading="prepStore.isLoading"
          @click="handleCopyToNextWeek"
        >
          复制到下周（重置执行状态）
        </van-button>
      </div>
    </van-form>

    <van-notice-bar
      v-if="prepStore.currentPlan"
      wrapable
      left-icon="info-o"
      text="本周计划已保存，可进入菜单页生成/替换菜品并生成购物清单。"
    />

    <section class="backup-panel" aria-label="数据备份恢复">
      <h2 class="backup-title">数据备份恢复</h2>
      <div class="backup-actions">
        <van-button type="primary" plain block :loading="prepStore.isLoading" @click="handleExportData">
          导出 JSON 备份
        </van-button>
        <van-button type="warning" plain block :loading="prepStore.isLoading" @click="handleOpenImportFile">
          导入 JSON（全量覆盖）
        </van-button>
      </div>
      <p v-if="prepStore.lastRestoreAt" class="backup-desc">
        最近恢复时间：{{ new Date(prepStore.lastRestoreAt).toLocaleString('zh-CN') }}
      </p>
      <input ref="importInputRef" class="hidden-input" type="file" accept="application/json" @change="handleImportFile">
    </section>
  </section>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showSuccessToast, showFailToast } from 'vant'
import { usePrepStore } from '../../../app/store/usePrepStore'

defineOptions({
  name: 'PlanPage',
})

const router = useRouter()
const prepStore = usePrepStore()
const importInputRef = ref(null)

const form = reactive({
  peopleCount: 2,
  days: 5,
  budget: 300,
  preferences: '',
})

const syncFormByCurrentPlan = () => {
  if (!prepStore.currentPlan) {
    return
  }

  form.peopleCount = prepStore.currentPlan.peopleCount
  form.days = prepStore.currentPlan.days
  form.budget = prepStore.currentPlan.budget
  form.preferences = prepStore.currentPlan.preferences || ''
}

const handleSavePlan = async () => {
  if (form.days < 1 || form.days > 7) {
    showFailToast('规划天数需在 1-7 之间')
    return
  }

  await prepStore.savePlan({
    peopleCount: form.peopleCount,
    days: form.days,
    budget: form.budget,
    preferences: form.preferences,
  })

  if (prepStore.lastError) {
    showFailToast(prepStore.lastError)
    return
  }

  showSuccessToast('周计划保存成功')
}

const handleGoMenu = () => {
  router.push('/menu')
}

const handleCopyToNextWeek = async () => {
  await prepStore.copyCurrentPlanToNextWeek()
  if (prepStore.lastError) {
    showFailToast(prepStore.lastError)
    return
  }

  syncFormByCurrentPlan()
  showSuccessToast('已复制到下周，执行状态已重置')
}

const handleExportData = async () => {
  await prepStore.exportAllDataAsJson()
  if (prepStore.lastError) {
    showFailToast(prepStore.lastError)
    return
  }
  showSuccessToast('JSON 备份已导出')
}

const handleOpenImportFile = () => {
  importInputRef.value?.click()
}

const handleImportFile = async (event) => {
  const selectedFile = event.target.files?.[0]
  if (!selectedFile) {
    return
  }

  try {
    const rawText = await selectedFile.text()
    await prepStore.restoreAllDataFromJson(rawText)
    if (prepStore.lastError) {
      showFailToast(prepStore.lastError)
      return
    }

    syncFormByCurrentPlan()
    showSuccessToast('导入恢复成功')
  } finally {
    event.target.value = ''
  }
}

onMounted(async () => {
  await prepStore.bootstrap()
  syncFormByCurrentPlan()
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

.form {
  display: grid;
  gap: 12px;
}

.actions {
  display: grid;
  gap: 10px;
  margin-top: 8px;
}

.backup-panel {
  margin-top: 12px;
  border: 1px solid #ececec;
  border-radius: 10px;
  padding: 10px;
}

.backup-title {
  margin: 0 0 8px;
  font-size: 14px;
}

.backup-actions {
  display: grid;
  gap: 8px;
}

.backup-desc {
  margin: 8px 0 0;
  color: #646566;
  font-size: 12px;
}

.hidden-input {
  display: none;
}
</style>
