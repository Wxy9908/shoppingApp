import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    activePlanId: '',
  }),
  actions: {
    setActivePlanId(planId) {
      this.activePlanId = planId
    },
    clearActivePlanId() {
      this.activePlanId = ''
    },
  },
})
