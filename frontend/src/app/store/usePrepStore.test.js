import { describe, expect, it } from 'vitest'
import {
  formatBackupFileName,
  SHOPPING_ITEM_STATUS,
  getShoppingStatusLabel,
  getNextWeekStartDate,
  normalizeIngredient,
  parseBackupPayload,
  resolveMealDayIndex,
  shouldDeductInventory,
  shouldRollbackInventory,
} from './usePrepStore'

describe('normalizeIngredient', () => {
  it('normalizes alias before unit conversion', () => {
    const result = normalizeIngredient({
      name: '西红柿',
      quantity: 2,
      unit: '个',
      category: '蔬菜',
    })

    expect(result.normalizedName).toBe('番茄')
    expect(result.unit).toBe('g')
    expect(result.quantity).toBe(240)
    expect(result.needsManualConfirm).toBe(false)
  })

  it('converts kg to g', () => {
    const result = normalizeIngredient({
      name: '牛肉',
      quantity: 0.5,
      unit: 'kg',
      category: '肉禽',
    })

    expect(result.unit).toBe('g')
    expect(result.quantity).toBe(500)
  })

  it('marks item when piece conversion map is missing', () => {
    const result = normalizeIngredient({
      name: '生姜',
      quantity: 2,
      unit: '个',
      category: '调料',
    })

    expect(result.unit).toBe('个')
    expect(result.quantity).toBe(2)
    expect(result.needsManualConfirm).toBe(true)
  })
})

describe('getShoppingStatusLabel', () => {
  it('returns readable labels for three-way shopping status', () => {
    expect(getShoppingStatusLabel(SHOPPING_ITEM_STATUS.PENDING)).toBe('待购买')
    expect(getShoppingStatusLabel(SHOPPING_ITEM_STATUS.PURCHASED)).toBe('已购买')
    expect(getShoppingStatusLabel(SHOPPING_ITEM_STATUS.IN_STOCK)).toBe('冰箱已有')
  })
})

describe('shopping status transitions', () => {
  it('deducts inventory only when status enters in_stock', () => {
    expect(shouldDeductInventory(SHOPPING_ITEM_STATUS.PENDING, SHOPPING_ITEM_STATUS.IN_STOCK)).toBe(true)
    expect(shouldDeductInventory(SHOPPING_ITEM_STATUS.PURCHASED, SHOPPING_ITEM_STATUS.IN_STOCK)).toBe(true)
    expect(shouldDeductInventory(SHOPPING_ITEM_STATUS.IN_STOCK, SHOPPING_ITEM_STATUS.IN_STOCK)).toBe(false)
    expect(shouldDeductInventory(SHOPPING_ITEM_STATUS.IN_STOCK, SHOPPING_ITEM_STATUS.PENDING)).toBe(false)
  })

  it('rolls back inventory only when status leaves in_stock', () => {
    expect(shouldRollbackInventory(SHOPPING_ITEM_STATUS.IN_STOCK, SHOPPING_ITEM_STATUS.PENDING)).toBe(true)
    expect(shouldRollbackInventory(SHOPPING_ITEM_STATUS.IN_STOCK, SHOPPING_ITEM_STATUS.PURCHASED)).toBe(true)
    expect(shouldRollbackInventory(SHOPPING_ITEM_STATUS.PENDING, SHOPPING_ITEM_STATUS.PURCHASED)).toBe(false)
    expect(shouldRollbackInventory(SHOPPING_ITEM_STATUS.PURCHASED, SHOPPING_ITEM_STATUS.IN_STOCK)).toBe(false)
  })
})

describe('week copy helpers', () => {
  it('calculates next week start date by +7 days', () => {
    expect(getNextWeekStartDate('2026-03-09')).toBe('2026-03-16')
  })

  it('resolves meal day index with fallback from date', () => {
    expect(resolveMealDayIndex({ dayIndex: 3, date: '2026-03-12' }, '2026-03-09')).toBe(3)
    expect(resolveMealDayIndex({ date: '2026-03-11' }, '2026-03-09')).toBe(2)
  })
})

describe('backup helpers', () => {
  it('generates backup filename with json extension', () => {
    const fileName = formatBackupFileName('demo')
    expect(fileName.startsWith('demo-')).toBe(true)
    expect(fileName.endsWith('.json')).toBe(true)
  })

  it('parses backup payload and validates required tables', () => {
    const payload = {
      tableData: {
        plans: [],
        mealItems: [],
        shoppingItems: [],
        inventoryItems: [],
        inventoryLogs: [],
        weeklyReviews: [],
      },
    }
    const result = parseBackupPayload(JSON.stringify(payload))
    expect(result.tableData.plans).toEqual([])
  })
})
