export const TABLE_SCHEMAS = {
  plans: '&id, weekStartDate, status, createdAt, updatedAt',
  mealItems: '&id, planId, date, mealType, dishName, createdAt, updatedAt',
  shoppingItems: '&id, planId, category, name, status, createdAt, updatedAt',
  inventoryItems: '&id, name, category, unit, updatedAt',
  inventoryLogs: '&id, sourceId, sourceType, itemId, changeType, createdAt',
  weeklyReviews: '&id, planId, weekStartDate, completionRate, createdAt',
  backupSnapshots: '&id, createdAt, source',
}
