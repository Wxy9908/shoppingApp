import { defineStore } from 'pinia'
import { db } from '../../infra/db/dexie'
import { PRODUCT_NAME } from '../constants/brand'

const DEFAULT_MEAL_TYPES = ['午餐', '晚餐']
export const MEAL_ITEM_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
}
export const SHOPPING_ITEM_STATUS = {
  PENDING: 'pending',
  PURCHASED: 'purchased',
  IN_STOCK: 'in_stock',
}

const SHOPPING_ITEM_STATUS_SET = new Set(Object.values(SHOPPING_ITEM_STATUS))
const DEFAULT_ITEM_STATUS = SHOPPING_ITEM_STATUS.PENDING

export const getShoppingStatusLabel = (status) => {
  if (status === SHOPPING_ITEM_STATUS.PURCHASED) {
    return '已购买'
  }

  if (status === SHOPPING_ITEM_STATUS.IN_STOCK) {
    return '冰箱已有'
  }

  return '待购买'
}

export const shouldDeductInventory = (previousStatus, nextStatus) => {
  return previousStatus !== SHOPPING_ITEM_STATUS.IN_STOCK && nextStatus === SHOPPING_ITEM_STATUS.IN_STOCK
}

export const shouldRollbackInventory = (previousStatus, nextStatus) => {
  return previousStatus === SHOPPING_ITEM_STATUS.IN_STOCK && nextStatus !== SHOPPING_ITEM_STATUS.IN_STOCK
}

export const ingredientAliasMap = {
  西红柿: '番茄',
  土豆: '马铃薯',
  生抽: '酱油',
  小葱: '葱',
  鸡胸: '鸡胸肉',
}

export const unitConvertMap = {
  kg: { baseUnit: 'g', ratio: 1000 },
  千克: { baseUnit: 'g', ratio: 1000 },
  斤: { baseUnit: 'g', ratio: 500 },
  克: { baseUnit: 'g', ratio: 1 },
}

export const pieceToGramMap = {
  番茄: 120,
  洋葱: 150,
  土豆: 220,
  鸡蛋: 50,
}

const dishTemplates = [
  {
    id: 'dish-001',
    name: '番茄炒蛋',
    prepMinutes: 15,
    steps: [
      { title: '备料', content: '番茄切块，鸡蛋打散加少许盐。' },
      { title: '炒蛋', content: '热锅下油，鸡蛋炒至凝固后盛出。' },
      { title: '合炒', content: '番茄炒出汁后回锅鸡蛋，翻炒均匀即可。' },
    ],
    ingredients: [
      { name: '西红柿', quantity: 2, unit: '个', category: '蔬菜' },
      { name: '鸡蛋', quantity: 3, unit: '个', category: '蛋奶' },
    ],
  },
  {
    id: 'dish-002',
    name: '青椒土豆丝',
    prepMinutes: 20,
    steps: [
      { title: '备料', content: '土豆去皮切丝后泡水，青椒切丝。' },
      { title: '爆香', content: '热油下蒜末，炒香后下土豆丝。' },
      { title: '收尾', content: '加入青椒丝和调味料，大火快炒至断生。' },
    ],
    ingredients: [
      { name: '土豆', quantity: 2, unit: '个', category: '蔬菜' },
      { name: '青椒', quantity: 2, unit: '个', category: '蔬菜' },
    ],
  },
  {
    id: 'dish-003',
    name: '蒜蓉西兰花',
    prepMinutes: 15,
    steps: [
      { title: '处理食材', content: '西兰花掰小朵后焯水 1 分钟，蒜切末。' },
      { title: '炒香蒜蓉', content: '热锅冷油，小火炒香蒜末。' },
      { title: '翻炒出锅', content: '下西兰花快速翻炒，调味后即可出锅。' },
    ],
    ingredients: [
      { name: '西兰花', quantity: 1, unit: '个', category: '蔬菜' },
      { name: '蒜', quantity: 4, unit: '瓣', category: '调料' },
    ],
  },
  {
    id: 'dish-004',
    name: '可乐鸡翅',
    prepMinutes: 30,
    steps: [
      { title: '预处理', content: '鸡翅两面划刀，冷水下锅焯去血沫。' },
      { title: '煎香上色', content: '鸡翅煎至两面金黄，加入生抽翻匀。' },
      { title: '焖煮收汁', content: '倒入可乐没过鸡翅，中火焖至收汁。' },
    ],
    ingredients: [
      { name: '鸡翅中', quantity: 500, unit: 'g', category: '肉禽' },
      { name: '生抽', quantity: 20, unit: 'g', category: '调料' },
    ],
  },
  {
    id: 'dish-005',
    name: '宫保鸡丁',
    prepMinutes: 30,
    steps: [
      { title: '备料', content: '鸡胸切丁腌制，黄瓜切丁，调好宫保汁。' },
      { title: '滑炒鸡丁', content: '热锅下油，先将鸡丁炒至变色。' },
      { title: '合炒调味', content: '加入配菜和宫保汁，大火翻炒收汁。' },
    ],
    ingredients: [
      { name: '鸡胸', quantity: 400, unit: 'g', category: '肉禽' },
      { name: '黄瓜', quantity: 1, unit: '个', category: '蔬菜' },
    ],
  },
  {
    id: 'dish-006',
    name: '香菇炒青菜',
    prepMinutes: 20,
    steps: [
      { title: '处理食材', content: '香菇切片，青菜洗净切段。' },
      { title: '先炒香菇', content: '热锅下油，将香菇炒软出香味。' },
      { title: '下青菜快炒', content: '加入青菜大火翻炒，调味后立即出锅。' },
    ],
    ingredients: [
      { name: '香菇', quantity: 250, unit: 'g', category: '蔬菜' },
      { name: '青菜', quantity: 400, unit: 'g', category: '蔬菜' },
    ],
  },
]

const getTemplateByDishId = (dishId) => {
  return dishTemplates.find((dish) => dish.id === dishId) || null
}

const resolveMealItemSteps = (mealItem) => {
  if (Array.isArray(mealItem.steps) && mealItem.steps.length) {
    return mealItem.steps
  }

  const template = getTemplateByDishId(mealItem.dishId)
  return template?.steps ?? []
}

const hydrateMealItem = (mealItem) => {
  const template = getTemplateByDishId(mealItem.dishId)
  return {
    ...mealItem,
    prepMinutes: mealItem.prepMinutes || template?.prepMinutes || 0,
    steps: resolveMealItemSteps(mealItem),
  }
}

export const normalizeName = (name) => {
  if (!name) {
    return ''
  }

  return ingredientAliasMap[name] ?? name.trim()
}

export const normalizeUnit = (unit) => {
  if (!unit) {
    return ''
  }

  return unit.trim().toLowerCase()
}

const buildInventoryDeductSourceId = (shoppingItemId) => `shopping-item:${shoppingItemId}:deduct`
const BACKUP_VERSION = 1
const DATA_TABLE_NAMES = ['plans', 'mealItems', 'shoppingItems', 'inventoryItems', 'inventoryLogs', 'weeklyReviews']

const buildId = (prefix) => `${prefix}-${crypto.randomUUID()}`

const toMonday = (dateInput = new Date()) => {
  const date = new Date(dateInput)
  const day = date.getDay()
  const offset = day === 0 ? 6 : day - 1
  date.setDate(date.getDate() - offset)
  date.setHours(0, 0, 0, 0)
  return date.toISOString().slice(0, 10)
}

export const formatWeekRange = (weekStartDate, days = 7, selectedDayIndexes = []) => {
  if (!weekStartDate) return ''
  const start = new Date(weekStartDate)
  const formatMD = (date) => `${date.getMonth() + 1}/${date.getDate()}`
  const normalizedSelectedDayIndexes = normalizeSelectedDayIndexes(selectedDayIndexes, days)
  if (normalizedSelectedDayIndexes.length && normalizedSelectedDayIndexes.length < 7) {
    return normalizedSelectedDayIndexes
      .map((dayIndex) => {
        const targetDate = new Date(weekStartDate)
        targetDate.setDate(targetDate.getDate() + dayIndex)
        return formatMD(targetDate)
      })
      .join('、')
  }

  const end = new Date(weekStartDate)
  end.setDate(end.getDate() + (days - 1))
  return `${formatMD(start)} - ${formatMD(end)}`
}

const formatDateByOffset = (weekStartDate, offsetDays) => {
  const date = new Date(weekStartDate)
  date.setDate(date.getDate() + offsetDays)
  return date.toISOString().slice(0, 10)
}

const normalizeSelectedDayIndexes = (selectedDayIndexes, fallbackDays = 7) => {
  if (Array.isArray(selectedDayIndexes) && selectedDayIndexes.length) {
    return [...new Set(selectedDayIndexes.map((value) => Number(value)).filter((value) => Number.isInteger(value) && value >= 0 && value <= 6))]
      .sort((left, right) => left - right)
  }

  const parsedFallbackDays = Number(fallbackDays)
  const dayCount = Number.isInteger(parsedFallbackDays) && parsedFallbackDays >= 1 && parsedFallbackDays <= 7 ? parsedFallbackDays : 7
  return Array.from({ length: dayCount }, (_, index) => index)
}

export const getNextWeekStartDate = (weekStartDate) => {
  return formatDateByOffset(weekStartDate, 7)
}

export const formatBackupFileName = (prefix = 'weekly-prep-backup') => {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  return `${prefix}-${stamp}.json`
}

export const parseBackupPayload = (rawText) => {
  const parsed = JSON.parse(rawText)
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('invalid_payload')
  }

  const tableData = parsed.tableData
  if (!tableData || typeof tableData !== 'object') {
    throw new Error('invalid_table_data')
  }

  DATA_TABLE_NAMES.forEach((tableName) => {
    if (!Array.isArray(tableData[tableName])) {
      throw new Error(`missing_table:${tableName}`)
    }
  })

  return {
    meta: parsed.meta ?? {},
    tableData,
  }
}

export const resolveMealDayIndex = (mealItem, weekStartDate) => {
  if (Number.isInteger(mealItem.dayIndex) && mealItem.dayIndex >= 0) {
    return mealItem.dayIndex
  }

  const mealDate = new Date(mealItem.date)
  const startDate = new Date(weekStartDate)
  const millisecondsPerDay = 24 * 60 * 60 * 1000
  const dayOffset = Math.round((mealDate.getTime() - startDate.getTime()) / millisecondsPerDay)
  return dayOffset >= 0 ? dayOffset : 0
}

export const normalizeIngredient = (ingredient) => {
  const normalizedName = normalizeName(ingredient.name)
  const normalizedUnit = normalizeUnit(ingredient.unit)
  const sourceQuantity = Number(ingredient.quantity) || 0

  if (!sourceQuantity) {
    return null
  }

  if (unitConvertMap[normalizedUnit]) {
    const { baseUnit, ratio } = unitConvertMap[normalizedUnit]
    return {
      ...ingredient,
      normalizedName,
      quantity: sourceQuantity * ratio,
      unit: baseUnit,
      needsManualConfirm: false,
    }
  }

  if (normalizedUnit === '个') {
    const gramPerPiece = pieceToGramMap[normalizedName]
    if (!gramPerPiece) {
      return {
        ...ingredient,
        normalizedName,
        quantity: sourceQuantity,
        unit: '个',
        needsManualConfirm: true,
      }
    }

    return {
      ...ingredient,
      normalizedName,
      quantity: sourceQuantity * gramPerPiece,
      unit: 'g',
      needsManualConfirm: false,
    }
  }

  return {
    ...ingredient,
    normalizedName,
    quantity: sourceQuantity,
    unit: normalizedUnit || ingredient.unit,
    needsManualConfirm: false,
  }
}

export const usePrepStore = defineStore('prep', {
  state: () => ({
    activePlanId: '',
    currentPlan: null,
    planCount: 0,
    mealItems: [],
    shoppingItems: [],
    inventoryItems: [],
    inventoryLogs: [],
    weeklyReview: null,
    shoppingListNeedsRefresh: false,
    lastRestoreAt: '',
    isLoading: false,
    lastError: '',
  }),
  getters: {
    dishTemplates: () => dishTemplates,
    hasActivePlan: (state) => Boolean(state.currentPlan?.id),
    shoppingStatusOptions: () => [
      { label: '待购买', value: SHOPPING_ITEM_STATUS.PENDING },
      { label: '已购买', value: SHOPPING_ITEM_STATUS.PURCHASED },
      { label: '冰箱已有', value: SHOPPING_ITEM_STATUS.IN_STOCK },
    ],
    inventoryItemCount: (state) => state.inventoryItems.length,
    shoppingItemsByCategory: (state) => {
      return state.shoppingItems.reduce((accumulator, item) => {
        const category = item.category || '其他'
        if (!accumulator[category]) {
          accumulator[category] = []
        }
        accumulator[category].push(item)
        return accumulator
      }, {})
    },
  },
  actions: {
    async bootstrap() {
      this.isLoading = true
      this.lastError = ''

      try {
        const weekStartDate = toMonday()
        const [plan, planCount] = await Promise.all([
          db.plans.where('weekStartDate').equals(weekStartDate).first(),
          db.plans.count(),
        ])
        this.planCount = planCount

        if (!plan) {
          this.activePlanId = ''
          this.currentPlan = null
          this.mealItems = []
          this.shoppingItems = []
          this.weeklyReview = null
          this.shoppingListNeedsRefresh = false
        } else {
          this.activePlanId = plan.id
          this.currentPlan = plan
          await this.loadPlanData(plan.id)
          await this.loadWeeklyReview(plan.id, plan.weekStartDate)
          this.shoppingListNeedsRefresh = false
        }

        await this.loadInventoryData()
      } catch (error) {
        this.lastError = '加载周计划失败，请重试。'
        console.error(error)
      } finally {
        this.isLoading = false
      }
    },
    async savePlan(payload) {
      this.isLoading = true
      this.lastError = ''

      try {
        const now = new Date().toISOString()
        const weekStartDate = toMonday()
        const existingPlan = await db.plans.where('weekStartDate').equals(weekStartDate).first()

        if (existingPlan) {
          const existingSelectedDayIndexes = normalizeSelectedDayIndexes(existingPlan.selectedDayIndexes, existingPlan.days)
          const normalizedSelectedDayIndexes = normalizeSelectedDayIndexes(
            payload.selectedDayIndexes ?? existingPlan.selectedDayIndexes,
            payload.days ?? existingPlan.days
          )
          const hasCookingDaysChanged =
            existingSelectedDayIndexes.join('|') !== normalizedSelectedDayIndexes.join('|')
          const updatedPlan = {
            ...existingPlan,
            ...payload,
            weekLabel: existingPlan.weekLabel || payload.weekLabel || `Week ${this.planCount || 1}`,
            days: normalizedSelectedDayIndexes.length,
            selectedDayIndexes: normalizedSelectedDayIndexes,
            updatedAt: now,
          }
          await db.plans.put(updatedPlan)
          this.activePlanId = updatedPlan.id
          this.currentPlan = updatedPlan
          if (hasCookingDaysChanged && this.mealItems.length) {
            this.shoppingListNeedsRefresh = true
          }
          return
        }

        const normalizedSelectedDayIndexes = normalizeSelectedDayIndexes(payload.selectedDayIndexes, payload.days)
        const newPlan = {
          id: buildId('plan'),
          weekStartDate,
          ...payload,
          weekLabel: payload.weekLabel || `Week ${this.planCount + 1}`,
          planName: payload.planName || '',
          days: normalizedSelectedDayIndexes.length,
          selectedDayIndexes: normalizedSelectedDayIndexes,
          status: 'draft',
          createdAt: now,
          updatedAt: now,
        }
        await db.plans.add(newPlan)
        this.activePlanId = newPlan.id
        this.currentPlan = newPlan
        this.planCount = await db.plans.count()
      } catch (error) {
        this.lastError = '保存周计划失败，请检查输入后重试。'
        console.error(error)
      } finally {
        this.isLoading = false
      }
    },
    async deleteCurrentPlan() {
      if (!this.currentPlan?.id) {
        return
      }

      this.isLoading = true
      this.lastError = ''

      try {
        const currentPlanId = this.currentPlan.id

        await db.transaction('rw', db.plans, db.mealItems, db.shoppingItems, db.weeklyReviews, async () => {
          await db.mealItems.where('planId').equals(currentPlanId).delete()
          await db.shoppingItems.where('planId').equals(currentPlanId).delete()
          await db.weeklyReviews.where('planId').equals(currentPlanId).delete()
          await db.plans.delete(currentPlanId)
        })

        this.activePlanId = ''
        this.currentPlan = null
        this.mealItems = []
        this.shoppingItems = []
        this.weeklyReview = null
        this.shoppingListNeedsRefresh = false
        this.planCount = await db.plans.count()
      } catch (error) {
        this.lastError = '删除周计划失败，请稍后重试。'
        console.error(error)
      } finally {
        this.isLoading = false
      }
    },
    async loadPlanData(planId) {
      if (!planId) {
        return
      }

      this.isLoading = true
      this.lastError = ''

      try {
        const [mealItems, shoppingItems] = await Promise.all([
          db.mealItems.where('planId').equals(planId).sortBy('date'),
          db.shoppingItems.where('planId').equals(planId).sortBy('category'),
        ])

        this.mealItems = mealItems.map((mealItem) => hydrateMealItem(mealItem))
        this.shoppingItems = shoppingItems
      } catch (error) {
        this.lastError = '加载计划详情失败，请稍后再试。'
        console.error(error)
      } finally {
        this.isLoading = false
      }
    },
    async loadInventoryData() {
      this.isLoading = true
      this.lastError = ''

      try {
        const [inventoryItems, inventoryLogs] = await Promise.all([
          db.inventoryItems.toArray(),
          db.inventoryLogs.orderBy('createdAt').reverse().limit(50).toArray(),
        ])
        this.inventoryItems = inventoryItems.sort((left, right) => left.name.localeCompare(right.name, 'zh-CN'))
        this.inventoryLogs = inventoryLogs
      } catch (error) {
        this.lastError = '加载库存数据失败，请稍后再试。'
        console.error(error)
      } finally {
        this.isLoading = false
      }
    },
    async loadWeeklyReview(planId, weekStartDate) {
      if (!planId || !weekStartDate) {
        this.weeklyReview = null
        return
      }

      this.isLoading = true
      this.lastError = ''

      try {
        const existingReview = await db.weeklyReviews
          .where('planId')
          .equals(planId)
          .filter((review) => review.weekStartDate === weekStartDate)
          .first()
        this.weeklyReview = existingReview ?? null
      } catch (error) {
        this.lastError = '加载周复盘失败，请稍后再试。'
        console.error(error)
      } finally {
        this.isLoading = false
      }
    },
    async saveWeeklyReview(payload) {
      if (!this.currentPlan?.id) {
        return
      }

      this.isLoading = true
      this.lastError = ''

      try {
        const now = new Date().toISOString()
        const existingReview = await db.weeklyReviews
          .where('planId')
          .equals(this.currentPlan.id)
          .filter((review) => review.weekStartDate === this.currentPlan.weekStartDate)
          .first()

        const reviewData = {
          planId: this.currentPlan.id,
          weekStartDate: this.currentPlan.weekStartDate,
          planningMinutes: Number(payload.planningMinutes || 0),
          shoppingMinutes: Number(payload.shoppingMinutes || 0),
          missedItemsCount: Number(payload.missedItemsCount || 0),
          wastedItemsCount: Number(payload.wastedItemsCount || 0),
          completionRate: Number(payload.completionRate || 0),
          actualCost: Number(payload.actualCost || 0),
          budget: Number(payload.budget || this.currentPlan.budget || 0),
          updatedAt: now,
        }

        if (existingReview) {
          const updatedReview = {
            ...existingReview,
            ...reviewData,
          }
          await db.weeklyReviews.put(updatedReview)
          this.weeklyReview = updatedReview
          return
        }

        const createdReview = {
          id: buildId('review'),
          createdAt: now,
          ...reviewData,
        }
        await db.weeklyReviews.add(createdReview)
        this.weeklyReview = createdReview
      } catch (error) {
        this.lastError = '保存周复盘失败，请稍后重试。'
        console.error(error)
      } finally {
        this.isLoading = false
      }
    },
    async generateMenu() {
      if (!this.currentPlan?.id) {
        return
      }

      this.isLoading = true
      this.lastError = ''

      try {
        const now = new Date().toISOString()
        const nextMealItems = []

        const selectedDayIndexes = normalizeSelectedDayIndexes(this.currentPlan.selectedDayIndexes, this.currentPlan.days)

        for (let selectedDayPosition = 0; selectedDayPosition < selectedDayIndexes.length; selectedDayPosition += 1) {
          const dayIndex = selectedDayIndexes[selectedDayPosition]
          for (let mealTypeIndex = 0; mealTypeIndex < DEFAULT_MEAL_TYPES.length; mealTypeIndex += 1) {
            const templateIndex = (selectedDayPosition * DEFAULT_MEAL_TYPES.length + mealTypeIndex) % dishTemplates.length
            const template = dishTemplates[templateIndex]
            nextMealItems.push({
              id: buildId('meal'),
              planId: this.currentPlan.id,
              date: formatDateByOffset(this.currentPlan.weekStartDate, dayIndex),
              dayIndex,
              mealType: DEFAULT_MEAL_TYPES[mealTypeIndex],
              dishId: template.id,
              dishName: template.name,
              prepMinutes: template.prepMinutes,
              steps: template.steps,
              ingredients: template.ingredients,
              status: MEAL_ITEM_STATUS.PENDING,
              createdAt: now,
              updatedAt: now,
            })
          }
        }

        await db.transaction('rw', db.mealItems, async () => {
          await db.mealItems.where('planId').equals(this.currentPlan.id).delete()
          await db.mealItems.bulkAdd(nextMealItems)
        })

        this.mealItems = nextMealItems
        this.shoppingListNeedsRefresh = true
      } catch (error) {
        this.lastError = '生成菜单失败，请稍后再试。'
        console.error(error)
      } finally {
        this.isLoading = false
      }
    },
    async replaceMealTemplate(mealItemId, nextDishId) {
      if (!mealItemId || !nextDishId) {
        return
      }

      const targetTemplate = dishTemplates.find((dish) => dish.id === nextDishId)
      if (!targetTemplate) {
        return
      }

      this.isLoading = true
      this.lastError = ''

      try {
        const targetMealItem = this.mealItems.find((item) => item.id === mealItemId)
        if (!targetMealItem) {
          return
        }

        const updatedItem = {
          ...targetMealItem,
          dishId: targetTemplate.id,
          dishName: targetTemplate.name,
          prepMinutes: targetTemplate.prepMinutes,
          steps: targetTemplate.steps,
          ingredients: targetTemplate.ingredients,
          updatedAt: new Date().toISOString(),
        }

        await db.mealItems.put(updatedItem)
        this.mealItems = this.mealItems.map((item) => (item.id === mealItemId ? updatedItem : item))
        this.shoppingListNeedsRefresh = true
      } catch (error) {
        this.lastError = '替换菜品失败，请重试。'
        console.error(error)
      } finally {
        this.isLoading = false
      }
    },
    async updateMealItemStatus(mealItemId, nextStatus) {
      if (!mealItemId || !Object.values(MEAL_ITEM_STATUS).includes(nextStatus)) {
        return
      }

      this.isLoading = true
      this.lastError = ''

      try {
        const targetMealItem = this.mealItems.find((item) => item.id === mealItemId)
        if (!targetMealItem) {
          return
        }

        const updatedMealItem = {
          ...targetMealItem,
          status: nextStatus,
          updatedAt: new Date().toISOString(),
        }

        await db.mealItems.put(updatedMealItem)
        this.mealItems = this.mealItems.map((item) => (item.id === mealItemId ? updatedMealItem : item))
      } catch (error) {
        this.lastError = '更新菜品状态失败，请稍后重试。'
        console.error(error)
      } finally {
        this.isLoading = false
      }
    },
    async removeMealItem(mealItemId) {
      if (!mealItemId) {
        return
      }

      this.isLoading = true
      this.lastError = ''

      try {
        await db.mealItems.delete(mealItemId)
        this.mealItems = this.mealItems.filter((item) => item.id !== mealItemId)
        this.shoppingListNeedsRefresh = true
      } catch (error) {
        this.lastError = '删除菜品失败，请稍后再试。'
        console.error(error)
      } finally {
        this.isLoading = false
      }
    },
    async generateShoppingList() {
      if (!this.currentPlan?.id) {
        return
      }

      this.isLoading = true
      this.lastError = ''

      try {
        const aggregateMap = new Map()
        const now = new Date().toISOString()

        this.mealItems.forEach((mealItem) => {
          ;(mealItem.ingredients ?? []).forEach((ingredient) => {
            const normalizedIngredient = normalizeIngredient(ingredient)
            if (!normalizedIngredient) {
              return
            }

            const key = `${normalizedIngredient.normalizedName}-${normalizedIngredient.unit}`
            const previousItem = aggregateMap.get(key)

            if (!previousItem) {
              aggregateMap.set(key, {
                id: buildId('shopping'),
                planId: this.currentPlan.id,
                category: normalizedIngredient.category || '其他',
                name: normalizedIngredient.normalizedName,
                normalizedName: normalizedIngredient.normalizedName,
                quantity: normalizedIngredient.quantity,
                unit: normalizedIngredient.unit,
                status: DEFAULT_ITEM_STATUS,
                sourceMealIds: [mealItem.id],
                needsManualConfirm: normalizedIngredient.needsManualConfirm,
                createdAt: now,
                updatedAt: now,
              })
              return
            }

            aggregateMap.set(key, {
              ...previousItem,
              quantity: previousItem.quantity + normalizedIngredient.quantity,
              needsManualConfirm: previousItem.needsManualConfirm || normalizedIngredient.needsManualConfirm,
              sourceMealIds: [...new Set([...previousItem.sourceMealIds, mealItem.id])],
              updatedAt: now,
            })
          })
        })

        const nextShoppingItems = Array.from(aggregateMap.values()).sort((left, right) => {
          if (left.category !== right.category) {
            return left.category.localeCompare(right.category, 'zh-CN')
          }
          return left.name.localeCompare(right.name, 'zh-CN')
        })

        await db.transaction('rw', db.shoppingItems, async () => {
          await db.shoppingItems.where('planId').equals(this.currentPlan.id).delete()
          if (nextShoppingItems.length) {
            await db.shoppingItems.bulkAdd(nextShoppingItems)
          }
        })

        this.shoppingItems = nextShoppingItems
        this.shoppingListNeedsRefresh = false
      } catch (error) {
        this.lastError = '生成购物清单失败，请稍后再试。'
        console.error(error)
      } finally {
        this.isLoading = false
      }
    },
    async addManualShoppingItem(payload) {
      if (!this.currentPlan?.id) {
        return
      }

      const normalizedName = normalizeName(payload.name)
      const parsedQuantity = Number(payload.quantity) || 0
      if (!normalizedName || !parsedQuantity || !payload.unit) {
        return
      }

      this.isLoading = true
      this.lastError = ''

      try {
        const now = new Date().toISOString()
        const normalizedUnit = normalizeUnit(payload.unit)
        const existedItem = this.shoppingItems.find(
          (item) =>
            item.planId === this.currentPlan.id &&
            item.normalizedName === normalizedName &&
            normalizeUnit(item.unit) === normalizedUnit
        )

        if (existedItem) {
          const mergedItem = {
            ...existedItem,
            quantity: existedItem.quantity + parsedQuantity,
            updatedAt: now,
          }
          await db.shoppingItems.put(mergedItem)
          this.shoppingItems = this.shoppingItems.map((item) => (item.id === mergedItem.id ? mergedItem : item))
          return
        }

        const newItem = {
          id: buildId('shopping'),
          planId: this.currentPlan.id,
          category: payload.category || '其他',
          name: normalizedName,
          normalizedName,
          quantity: parsedQuantity,
          unit: normalizedUnit,
          status: DEFAULT_ITEM_STATUS,
          sourceMealIds: [],
          needsManualConfirm: false,
          createdAt: now,
          updatedAt: now,
        }

        await db.shoppingItems.add(newItem)
        this.shoppingItems = [...this.shoppingItems, newItem].sort((left, right) => {
          if (left.category !== right.category) {
            return left.category.localeCompare(right.category, 'zh-CN')
          }
          return left.name.localeCompare(right.name, 'zh-CN')
        })
      } catch (error) {
        this.lastError = '新增清单项失败，请稍后重试。'
        console.error(error)
      } finally {
        this.isLoading = false
      }
    },
    async saveInventoryItem(payload) {
      const normalizedName = normalizeName(payload.name)
      const normalizedUnit = normalizeUnit(payload.unit)
      const deltaQuantity = Number(payload.quantity) || 0
      if (!normalizedName || !normalizedUnit || !deltaQuantity) {
        return
      }

      this.isLoading = true
      this.lastError = ''

      try {
        const now = new Date().toISOString()
        const existingItem = this.inventoryItems.find(
          (item) => item.name === normalizedName && normalizeUnit(item.unit) === normalizedUnit
        )

        if (existingItem) {
          const updatedItem = {
            ...existingItem,
            quantity: Number(existingItem.quantity || 0) + deltaQuantity,
            category: payload.category || existingItem.category || '其他',
            updatedAt: now,
          }
          await db.inventoryItems.put(updatedItem)
          this.inventoryItems = this.inventoryItems.map((item) => (item.id === updatedItem.id ? updatedItem : item))
          return
        }

        const newItem = {
          id: buildId('inventory'),
          name: normalizedName,
          category: payload.category || '其他',
          unit: normalizedUnit,
          quantity: deltaQuantity,
          createdAt: now,
          updatedAt: now,
        }
        await db.inventoryItems.add(newItem)
        this.inventoryItems = [...this.inventoryItems, newItem].sort((left, right) =>
          left.name.localeCompare(right.name, 'zh-CN')
        )
      } catch (error) {
        this.lastError = '保存库存失败，请稍后再试。'
        console.error(error)
      } finally {
        this.isLoading = false
      }
    },
    async applyInventoryDeductionByShoppingItem(shoppingItem) {
      const now = new Date().toISOString()
      const sourceId = buildInventoryDeductSourceId(shoppingItem.id)
      const existingDeductLog = await db.inventoryLogs
        .where('sourceId')
        .equals(sourceId)
        .filter((log) => log.changeType === 'deduct' && !log.rolledBackAt)
        .first()

      if (existingDeductLog) {
        return
      }

      let inventoryItem = await db.inventoryItems
        .where('name')
        .equals(shoppingItem.name)
        .filter((item) => normalizeUnit(item.unit) === normalizeUnit(shoppingItem.unit))
        .first()

      if (!inventoryItem) {
        inventoryItem = {
          id: buildId('inventory'),
          name: shoppingItem.name,
          category: shoppingItem.category || '其他',
          unit: shoppingItem.unit,
          quantity: 0,
          createdAt: now,
          updatedAt: now,
        }
        await db.inventoryItems.add(inventoryItem)
      }

      const beforeQuantity = Number(inventoryItem.quantity || 0)
      const requestedAmount = Number(shoppingItem.quantity || 0)
      const deductAmount = Math.min(beforeQuantity, requestedAmount)
      const afterQuantity = beforeQuantity - deductAmount

      await db.inventoryItems.put({
        ...inventoryItem,
        quantity: afterQuantity,
        updatedAt: now,
      })

      await db.inventoryLogs.add({
        id: buildId('inv-log'),
        sourceId,
        sourceType: 'shoppingItem',
        itemId: inventoryItem.id,
        shoppingItemId: shoppingItem.id,
        changeType: 'deduct',
        beforeQuantity,
        afterQuantity,
        requestedAmount,
        changeAmount: deductAmount,
        createdAt: now,
        rolledBackAt: '',
      })
    },
    async rollbackInventoryByShoppingItem(shoppingItemId) {
      const now = new Date().toISOString()
      const sourceId = buildInventoryDeductSourceId(shoppingItemId)
      const deductLog = await db.inventoryLogs
        .where('sourceId')
        .equals(sourceId)
        .filter((log) => log.changeType === 'deduct' && !log.rolledBackAt)
        .first()

      if (!deductLog) {
        return
      }

      const inventoryItem = await db.inventoryItems.get(deductLog.itemId)
      const rollbackAmount = Number(deductLog.changeAmount || 0)
      if (inventoryItem && rollbackAmount > 0) {
        await db.inventoryItems.put({
          ...inventoryItem,
          quantity: Number(inventoryItem.quantity || 0) + rollbackAmount,
          updatedAt: now,
        })
      }

      await db.inventoryLogs.put({
        ...deductLog,
        rolledBackAt: now,
      })

      await db.inventoryLogs.add({
        id: buildId('inv-log'),
        sourceId: `${sourceId}:rollback:${now}`,
        sourceType: 'shoppingItem',
        itemId: deductLog.itemId,
        shoppingItemId,
        changeType: 'rollback',
        beforeQuantity: inventoryItem ? Number(inventoryItem.quantity || 0) : 0,
        afterQuantity: inventoryItem ? Number(inventoryItem.quantity || 0) + rollbackAmount : rollbackAmount,
        requestedAmount: rollbackAmount,
        changeAmount: rollbackAmount,
        createdAt: now,
      })
    },
    async updateShoppingItemStatus(itemId, nextStatus) {
      if (!itemId || !SHOPPING_ITEM_STATUS_SET.has(nextStatus)) {
        return
      }

      this.isLoading = true
      this.lastError = ''

      try {
        const targetItem = this.shoppingItems.find((item) => item.id === itemId)
        if (!targetItem || targetItem.status === nextStatus) {
          return
        }

        const updatedItem = {
          ...targetItem,
          status: nextStatus,
          updatedAt: new Date().toISOString(),
        }

        await db.transaction('rw', db.shoppingItems, db.inventoryItems, db.inventoryLogs, async () => {
          await db.shoppingItems.put(updatedItem)

          if (shouldDeductInventory(targetItem.status, nextStatus)) {
            await this.applyInventoryDeductionByShoppingItem(updatedItem)
          }

          if (shouldRollbackInventory(targetItem.status, nextStatus)) {
            await this.rollbackInventoryByShoppingItem(targetItem.id)
          }
        })

        this.shoppingItems = this.shoppingItems.map((item) => (item.id === itemId ? updatedItem : item))
        await this.loadInventoryData()
      } catch (error) {
        this.lastError = '更新清单状态失败，请稍后重试。'
        console.error(error)
      } finally {
        this.isLoading = false
      }
    },
    async copyCurrentPlanToNextWeek() {
      if (!this.currentPlan?.id) {
        return
      }

      this.isLoading = true
      this.lastError = ''

      try {
        const now = new Date().toISOString()
        const nextWeekStartDate = getNextWeekStartDate(this.currentPlan.weekStartDate)
        const existingNextWeekPlan = await db.plans.where('weekStartDate').equals(nextWeekStartDate).first()
        if (existingNextWeekPlan) {
          this.lastError = '下周计划已存在，请先编辑已有计划。'
          return
        }

        const [sourceMeals, sourceShoppingItems] = await Promise.all([
          db.mealItems.where('planId').equals(this.currentPlan.id).toArray(),
          db.shoppingItems.where('planId').equals(this.currentPlan.id).toArray(),
        ])

        const nextPlanId = buildId('plan')
        const nextPlan = {
          id: nextPlanId,
          weekStartDate: nextWeekStartDate,
          weekLabel: this.currentPlan.weekLabel || '',
          planName: this.currentPlan.planName || '',
          status: 'draft',
          peopleCount: this.currentPlan.peopleCount,
          days: this.currentPlan.days,
          selectedDayIndexes: normalizeSelectedDayIndexes(this.currentPlan.selectedDayIndexes, this.currentPlan.days),
          budget: this.currentPlan.budget,
          preferences: this.currentPlan.preferences || '',
          createdAt: now,
          updatedAt: now,
        }

        const mealIdMap = new Map()
        const copiedMealItems = sourceMeals.map((mealItem) => {
          const nextMealId = buildId('meal')
          mealIdMap.set(mealItem.id, nextMealId)
          const dayIndex = resolveMealDayIndex(mealItem, this.currentPlan.weekStartDate)
          return {
            ...mealItem,
            id: nextMealId,
            planId: nextPlanId,
            dayIndex,
            date: formatDateByOffset(nextWeekStartDate, dayIndex),
            status: MEAL_ITEM_STATUS.PENDING,
            createdAt: now,
            updatedAt: now,
          }
        })

        const copiedShoppingItems = sourceShoppingItems.map((shoppingItem) => ({
          ...shoppingItem,
          id: buildId('shopping'),
          planId: nextPlanId,
          status: SHOPPING_ITEM_STATUS.PENDING,
          sourceMealIds: (shoppingItem.sourceMealIds || []).map((mealId) => mealIdMap.get(mealId)).filter(Boolean),
          createdAt: now,
          updatedAt: now,
        }))

        await db.transaction('rw', db.plans, db.mealItems, db.shoppingItems, async () => {
          await db.plans.add(nextPlan)
          if (copiedMealItems.length) {
            await db.mealItems.bulkAdd(copiedMealItems)
          }
          if (copiedShoppingItems.length) {
            await db.shoppingItems.bulkAdd(copiedShoppingItems)
          }
        })

        this.activePlanId = nextPlanId
        this.currentPlan = nextPlan
        this.mealItems = copiedMealItems.sort((left, right) => left.date.localeCompare(right.date, 'zh-CN'))
        this.shoppingItems = copiedShoppingItems.sort((left, right) => {
          if (left.category !== right.category) {
            return left.category.localeCompare(right.category, 'zh-CN')
          }
          return left.name.localeCompare(right.name, 'zh-CN')
        })
        this.shoppingListNeedsRefresh = false
      } catch (error) {
        this.lastError = '复制下周计划失败，请稍后重试。'
        console.error(error)
      } finally {
        this.isLoading = false
      }
    },
    async exportAllDataAsJson() {
      this.isLoading = true
      this.lastError = ''

      try {
        const tableData = {}
        for (let index = 0; index < DATA_TABLE_NAMES.length; index += 1) {
          const tableName = DATA_TABLE_NAMES[index]
          tableData[tableName] = await db.table(tableName).toArray()
        }

        const payload = {
          meta: {
            version: BACKUP_VERSION,
            exportedAt: new Date().toISOString(),
            app: PRODUCT_NAME,
          },
          tableData,
        }

        const fileName = formatBackupFileName()
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
        const objectUrl = URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = objectUrl
        anchor.download = fileName
        anchor.click()
        URL.revokeObjectURL(objectUrl)
      } catch (error) {
        this.lastError = '导出数据失败，请稍后重试。'
        console.error(error)
      } finally {
        this.isLoading = false
      }
    },
    async restoreAllDataFromJson(rawText) {
      this.isLoading = true
      this.lastError = ''

      try {
        const { tableData } = parseBackupPayload(rawText)
        const now = new Date().toISOString()
        const snapshotData = {}
        for (let index = 0; index < DATA_TABLE_NAMES.length; index += 1) {
          const tableName = DATA_TABLE_NAMES[index]
          snapshotData[tableName] = await db.table(tableName).toArray()
        }

        const snapshotRecord = {
          id: buildId('snapshot'),
          source: 'before_import',
          createdAt: now,
          payload: snapshotData,
        }

        await db.transaction(
          'rw',
          db.plans,
          db.mealItems,
          db.shoppingItems,
          db.inventoryItems,
          db.inventoryLogs,
          db.weeklyReviews,
          db.backupSnapshots,
          async () => {
            await db.backupSnapshots.add(snapshotRecord)

            for (let clearIndex = 0; clearIndex < DATA_TABLE_NAMES.length; clearIndex += 1) {
              const tableName = DATA_TABLE_NAMES[clearIndex]
              await db.table(tableName).clear()
            }

            for (let insertIndex = 0; insertIndex < DATA_TABLE_NAMES.length; insertIndex += 1) {
              const tableName = DATA_TABLE_NAMES[insertIndex]
              const rows = tableData[tableName]
              if (rows.length) {
                await db.table(tableName).bulkAdd(rows)
              }
            }
          }
        )

        this.lastRestoreAt = now
        await this.bootstrap()
      } catch (error) {
        this.lastError = '导入恢复失败，请确认 JSON 文件格式正确。'
        console.error(error)
      } finally {
        this.isLoading = false
      }
    },
  },
})
