import Dexie from 'dexie'
import { TABLE_SCHEMAS } from './tables'

const DB_NAME = 'weekly-meal-prep-assistant'
const DB_VERSION = 2

class AppDatabase extends Dexie {
  constructor() {
    super(DB_NAME)
    this.version(1).stores({
      plans: '&id, weekStartDate, status, createdAt, updatedAt',
      mealItems: '&id, planId, date, mealType, dishName, createdAt, updatedAt',
      shoppingItems: '&id, planId, category, name, status, createdAt, updatedAt',
      inventoryItems: '&id, name, category, unit, updatedAt',
      inventoryLogs: '&id, sourceId, sourceType, itemId, changeType, createdAt',
      weeklyReviews: '&id, planId, weekStartDate, completionRate, createdAt',
    })
    this.version(DB_VERSION).stores(TABLE_SCHEMAS)
  }
}

export const db = new AppDatabase()
