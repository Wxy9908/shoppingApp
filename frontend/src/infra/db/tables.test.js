import { describe, expect, it } from 'vitest'
import { TABLE_SCHEMAS } from './tables'

describe('TABLE_SCHEMAS', () => {
  it('contains required MVP tables', () => {
    expect(Object.keys(TABLE_SCHEMAS)).toEqual(
      expect.arrayContaining([
        'plans',
        'mealItems',
        'shoppingItems',
        'inventoryItems',
        'inventoryLogs',
        'weeklyReviews',
        'backupSnapshots',
      ])
    )
  })
})
