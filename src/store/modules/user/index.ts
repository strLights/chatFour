import { defineStore } from 'pinia'
import type { ModelInfo, UserInfo, UserState } from './helper'
import { defaultSetting, getLocalState, setLocalState } from './helper'

export const useUserStore = defineStore('user-store', {
  state: (): UserState => getLocalState(),
  actions: {
    updateUserInfo(modelInfo: Partial<ModelInfo>, userInfo?: Partial<UserInfo>) {
      this.userInfo = { ...this.userInfo, ...userInfo }
      this.modelInfo = { ...this.modelInfo, ...modelInfo }
      this.recordState()
    },

    resetUserInfo() {
      this.userInfo = { ...defaultSetting().userInfo }
      this.recordState()
    },

    recordState() {
      setLocalState(this.$state)
    },
  },
})
