<template>
  <section class="page" aria-label="周计划页面">
    <header class="card">
      <div class="between">
        <div class="title">{{ pageTitle }}</div>
        <span :class="planStatusTagClass">{{ planStatusTagText }}</span>
      </div>
      <p class="desc">{{ modeDescription }}</p>
      <p class="summary-line">{{ planInsightText }}</p>
      <div v-if="hasCurrentPlan" class="row plan-meta-row">
        <span class="pill pill--active">👥 {{ form.peopleCount }} 人</span>
        <span class="pill">📅 {{ selectedCookingDays.length }} 天</span>
        <span class="pill">💰 预算 {{ form.budget }}</span>
      </div>
      <div v-if="hasCurrentPlan && preferenceList.length" class="row plan-meta-row">
        <span v-for="pref in preferenceList" :key="pref" class="pill pill--active">{{ pref }}</span>
      </div>
    </header>

    <article class="card">
      <div class="title plan-section-title">基础配置</div>
      <van-form class="form">
        <van-field
          :model-value="internalWeekLabel"
          label="周数（系统）"
          readonly
          aria-label="系统周数"
          class="readonly-field"
        />
        <van-field
          v-model.trim="form.planName"
          label="计划名称"
          placeholder="例如：工作日快手餐"
          maxlength="20"
          show-word-limit
          aria-label="计划名称"
          class="focus-highlight"
        />
        <van-field
          v-model.number="form.peopleCount"
          type="digit"
          label="人数（人）"
          placeholder="请输入就餐人数"
          :rules="[{ required: true, message: '请填写人数' }]"
          aria-label="就餐人数"
          class="focus-highlight"
        />
        <van-field
          v-model.number="form.budget"
          type="digit"
          label="预算（元）"
          placeholder="请输入本周预算（元）"
          :rules="[{ required: true, message: '请填写预算' }]"
          aria-label="每周预算"
          class="focus-highlight"
        />
        <div class="field-block focus-highlight" tabindex="0">
          <div class="field-label">做饭日期（天）</div>
          <div class="chip-row wrap">
            <button
              v-for="option in cookingDayOptions"
              :key="option.value"
              type="button"
              class="filter-pill"
              :class="{ 'filter-pill--active': selectedCookingDays.includes(option.value) }"
              @click="handleToggleCookingDay(option.value)"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
        
        <div class="field-block focus-highlight" tabindex="0">
          <div class="field-label">口味偏好</div>
          <div class="chip-row wrap">
            <button
              v-for="option in PREFERENCE_OPTIONS"
              :key="option"
              type="button"
              class="filter-pill"
              :class="{ 'filter-pill--active': selectedPreferences.includes(option) }"
              @click="handleTogglePreference(option)"
            >
              {{ option }}
            </button>
          </div>
        </div>

        <div class="actions">
          <button
            class="btn btn--primary btn--lg"
            type="button"
            aria-label="保存计划"
            :disabled="prepStore.isLoading"
            @click="handleSavePlan"
          >
            {{ primaryActionText }}
          </button>
          <button
            v-if="hasCurrentPlan"
            class="btn"
            type="button"
            aria-label="前往菜单管理"
            :disabled="prepStore.isLoading"
            @click="handleGoMenu"
          >
            前往菜单管理
          </button>
        </div>
      </van-form>
    </article>

    <article v-if="hasCurrentPlan" class="card" aria-label="计划操作">
      <div class="title plan-section-title">计划操作</div>
      <p class="desc">复制会生成下周新计划并重置执行状态，删除会清理当前周关联数据。</p>
      <div class="actions">
        <button
          class="btn"
          type="button"
          aria-label="复制到下周"
          :disabled="prepStore.isLoading"
          @click="handleCopyToNextWeek"
        >
          复制到下周（重置执行状态）
        </button>
        <button
          class="btn btn--danger"
          type="button"
          aria-label="删除当前周计划"
          :disabled="prepStore.isLoading"
          @click="handleDeletePlan"
        >
          删除当前周计划
        </button>
      </div>
    </article>

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
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showSuccessToast, showFailToast, showConfirmDialog } from 'vant'
import { usePrepStore } from '../../../app/store/usePrepStore'

defineOptions({
  name: 'PlanPage',
})

const router = useRouter()
const prepStore = usePrepStore()
const importInputRef = ref(null)

const defaultForm = {
  planName: '',
  peopleCount: 2,
  budget: 300,
}

const form = reactive({
  ...defaultForm,
})
const selectedCookingDays = ref([0, 1, 2, 3, 4])
const selectedPreferences = ref([])
const PREFERENCE_OPTIONS = ['清淡', '少油', '快手菜', '高蛋白', '低脂', '控糖', '省钱']

const hasCurrentPlan = computed(() => prepStore.hasActivePlan)
const pageTitle = computed(() => (hasCurrentPlan.value ? '计划编辑' : '计划创建'))
const primaryActionText = computed(() => (hasCurrentPlan.value ? '保存修改' : '创建计划'))
const internalWeekLabel = computed(() => prepStore.currentPlan?.weekLabel || `Week ${prepStore.planCount + 1}`)
const cookingDayOptions = computed(() => {
  const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  return weekDays.map((label, dayIndex) => ({
    value: dayIndex,
    label,
  }))
})
const preferenceList = computed(() => selectedPreferences.value)
const canonicalPreferenceList = computed(() =>
  PREFERENCE_OPTIONS.filter((option) => selectedPreferences.value.includes(option))
)
const canonicalSelectedCookingDays = computed(() => [...selectedCookingDays.value].sort((left, right) => left - right))
const hasUnsavedChanges = computed(() => {
  if (!hasCurrentPlan.value || !prepStore.currentPlan) {
    return false
  }

  const savedPreferenceSet = new Set(parsePreferenceText(prepStore.currentPlan.preferences || ''))
  const savedPreferenceList = PREFERENCE_OPTIONS.filter((option) => savedPreferenceSet.has(option))
  const savedCookingDays = normalizeCookingDays(prepStore.currentPlan.selectedDayIndexes, prepStore.currentPlan.days)

  const isPlanNameChanged = (form.planName || '').trim() !== (prepStore.currentPlan.planName || '').trim()
  const isPeopleCountChanged = Number(form.peopleCount) !== Number(prepStore.currentPlan.peopleCount)
  const isBudgetChanged = Number(form.budget) !== Number(prepStore.currentPlan.budget)
  const isPreferenceChanged = canonicalPreferenceList.value.join('|') !== savedPreferenceList.join('|')
  const isCookingDaysChanged = canonicalSelectedCookingDays.value.join('|') !== savedCookingDays.join('|')

  return isPlanNameChanged || isPeopleCountChanged || isBudgetChanged || isPreferenceChanged || isCookingDaysChanged
})
const planStatusTagText = computed(() => {
  if (!hasCurrentPlan.value) {
    return '未创建'
  }

  return hasUnsavedChanges.value ? '待保存' : '已保存'
})
const planStatusTagClass = computed(() => {
  if (!hasCurrentPlan.value) {
    return 'week-tag'
  }

  return hasUnsavedChanges.value ? 'week-tag' : 'hero-tag'
})
const modeDescription = computed(() => {
  if (!hasCurrentPlan.value) {
    return '当前为创建模式，创建后可进入菜单管理与清单生成。'
  }

  return hasUnsavedChanges.value
    ? '当前有未保存改动，保存后会更新本周计划。'
    : '当前为编辑模式，计划内容已保存。'
})
const planInsightText = computed(() => {
  const mealCount = selectedCookingDays.value.length * 2
  const dailyBudget = selectedCookingDays.value.length > 0 ? (form.budget / selectedCookingDays.value.length).toFixed(1) : '0.0'
  const perPersonBudget =
    form.peopleCount > 0 && selectedCookingDays.value.length > 0
      ? (form.budget / (form.peopleCount * selectedCookingDays.value.length)).toFixed(1)
      : '0.0'
  const planNameText = form.planName ? `「${form.planName}」` : '当前计划'
  return `${planNameText}预计 ${mealCount} 餐，人均每日约 ${perPersonBudget} 元，日均预算约 ${dailyBudget} 元。`
})

const parsePreferenceText = (text) => {
  return (text || '')
    .split(/[、，, ]+/)
    .map((item) => item.trim())
    .filter(Boolean)
}

const resetForm = () => {
  Object.assign(form, defaultForm)
  selectedCookingDays.value = [0, 1, 2, 3, 4]
  selectedPreferences.value = []
}

const syncFormByCurrentPlan = () => {
  if (!prepStore.currentPlan) {
    resetForm()
    return
  }

  form.planName = prepStore.currentPlan.planName || ''
  form.peopleCount = prepStore.currentPlan.peopleCount
  form.budget = prepStore.currentPlan.budget
  selectedCookingDays.value = normalizeCookingDays(
    prepStore.currentPlan.selectedDayIndexes,
    prepStore.currentPlan.days
  )
  const parsedPreferenceList = parsePreferenceText(prepStore.currentPlan.preferences || '')
  selectedPreferences.value = parsedPreferenceList.filter((item) => PREFERENCE_OPTIONS.includes(item))
}

const normalizeCookingDays = (selectedDayIndexes, fallbackDays) => {
  if (Array.isArray(selectedDayIndexes) && selectedDayIndexes.length) {
    return [...new Set(selectedDayIndexes.map((value) => Number(value)).filter((value) => Number.isInteger(value) && value >= 0 && value <= 6))]
      .sort((left, right) => left - right)
  }

  const parsedFallbackDays = Number(fallbackDays)
  const defaultDayCount = Number.isInteger(parsedFallbackDays) && parsedFallbackDays >= 1 && parsedFallbackDays <= 7 ? parsedFallbackDays : 5
  return Array.from({ length: defaultDayCount }, (_, index) => index)
}

const handleToggleCookingDay = (dayIndex) => {
  if (selectedCookingDays.value.includes(dayIndex)) {
    if (selectedCookingDays.value.length === 1) {
      showFailToast('至少选择 1 天做饭日期')
      return
    }
    selectedCookingDays.value = selectedCookingDays.value.filter((value) => value !== dayIndex)
    return
  }

  selectedCookingDays.value = [...selectedCookingDays.value, dayIndex].sort((left, right) => left - right)
}

const handleTogglePreference = (option) => {
  if (selectedPreferences.value.includes(option)) {
    selectedPreferences.value = selectedPreferences.value.filter((item) => item !== option)
    return
  }

  selectedPreferences.value = [...selectedPreferences.value, option]
}

const validatePlanForm = () => {
  const peopleCount = Number(form.peopleCount)
  const budget = Number(form.budget)

  if (form.planName && form.planName.trim().length > 20) {
    showFailToast('计划名称最多 20 个字')
    return false
  }

  if (!Number.isInteger(peopleCount) || peopleCount < 1 || peopleCount > 20) {
    showFailToast('就餐人数需为 1-20 的整数')
    return false
  }

  if (!selectedCookingDays.value.length) {
    showFailToast('请至少选择 1 天做饭日期')
    return false
  }

  if (!Number.isFinite(budget) || budget <= 0 || budget > 20000) {
    showFailToast('预算需大于 0 且不超过 20000 元')
    return false
  }

  if (preferenceList.value.length > 7) {
    showFailToast('口味偏好最多选择 7 项')
    return false
  }

  return true
}

const handleSavePlan = async () => {
  if (!validatePlanForm()) {
    return
  }

  await prepStore.savePlan({
    weekLabel: internalWeekLabel.value,
    planName: form.planName.trim(),
    peopleCount: Number(form.peopleCount),
    days: selectedCookingDays.value.length,
    selectedDayIndexes: selectedCookingDays.value,
    budget: Number(form.budget),
    preferences: canonicalPreferenceList.value.join('、'),
  })

  if (prepStore.lastError) {
    showFailToast(prepStore.lastError)
    return
  }

  showSuccessToast('周计划保存成功')
}

const handleGoMenu = () => {
  if (!hasCurrentPlan.value) {
    showFailToast('请先创建本周计划')
    return
  }

  router.push('/menu')
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

  syncFormByCurrentPlan()
  showSuccessToast('已复制到下周，执行状态已重置')
}

const handleDeletePlan = async () => {
  if (!prepStore.hasActivePlan) {
    return
  }

  try {
    await showConfirmDialog({
      title: '删除本周计划',
      message: '删除后会同时清理本周菜单、清单和周复盘数据，且不可恢复，确定继续吗？',
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
    })
  } catch {
    return
  }

  await prepStore.deleteCurrentPlan()
  if (prepStore.lastError) {
    showFailToast(prepStore.lastError)
    return
  }

  resetForm()
  showSuccessToast('本周计划已删除')
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
    try {
      await showConfirmDialog({
        title: '确认导入并覆盖数据',
        message: '导入将全量覆盖当前数据。系统会先自动创建快照，但本次覆盖后当前内容将被替换，是否继续？',
        confirmButtonText: '确认导入',
        cancelButtonText: '取消',
      })
    } catch {
      return
    }

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
.between {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--prep-space-3);
}

.row {
  display: flex;
  gap: var(--prep-space-3);
  align-items: center;
  flex-wrap: wrap;
}

.plan-meta-row {
  margin-top: var(--prep-space-3);
}

.field-block {
  padding: 10px 16px;
  display: grid;
  gap: var(--prep-space-2);
  transition: all 0.2s ease;
  outline: none;
}

.field-label {
  font-size: 14px;
  color: #646566;
  line-height: 24px;
  margin-bottom: 4px;
}

.chip-row.wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  overflow-x: visible;
  padding: 4px 0;
}

.chip-row.wrap .filter-pill {
  flex: 0 0 calc(25% - 6px); /* 4 per row */
  justify-content: center;
  padding: 0;
  min-width: 0;
}

.plan-section-title {
  margin-bottom: var(--prep-space-4);
}

.form {
  display: grid;
}

.actions {
  display: grid;
  gap: var(--prep-space-3);
  margin-top: var(--prep-space-5);
}

.pill--active {
  background: var(--prep-primary-soft);
  color: var(--prep-primary);
  border-color: var(--prep-primary-border);
}

.btn--danger {
  border-color: rgba(239, 68, 68, 0.2);
  color: var(--prep-danger);
  background: rgba(239, 68, 68, 0.06);
}

.btn--danger:active {
  background: rgba(239, 68, 68, 0.12);
}

.backup-panel {
  background: var(--prep-surface);
  border-radius: var(--prep-radius-xl);
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: var(--prep-shadow-card);
  border: 1px solid rgba(0, 0, 0, 0.02);
}

.backup-title {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.backup-desc {
  margin: 12px 0 0;
  font-size: 13px;
  color: var(--prep-text-muted);
}

.focus-highlight :deep(.van-field__control) {
  transition: all 0.2s ease;
}

.focus-highlight:focus-within {
  background: var(--prep-primary-soft);
  border-radius: var(--prep-radius-md);
}

.focus-highlight:focus-within :deep(.van-field__label),
.focus-highlight:focus-within .field-label {
  color: var(--prep-primary);
  font-weight: 600;
}

.readonly-field :deep(.van-field__control) {
  color: var(--prep-text-muted);
  font-weight: 500;
}

.hidden-input {
  display: none;
}
</style>
