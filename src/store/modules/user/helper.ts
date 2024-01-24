import { ss } from '@/utils/storage'
import qianwen from '@/assets/qwen.png'
import defaultAvatar from '@/assets/avatar.jpg'

const LOCAL_NAME = 'userStorage'

export interface UserInfo {
  avatar: string
  name: string
  description: string
}

export interface ModelInfo {
  logo: string
  name: string
}

export interface UserState {
  userInfo: UserInfo
  modelInfo: ModelInfo
}

export function defaultSetting(): UserState {
  return {
    userInfo: {
      avatar: defaultAvatar,
      name: 'langchain-chatweb',
      description: 'Star on <a href="https://github.com/strLights/langchain-chatweb" class="text-blue-500" target="_blank" >GitHub</a>',
    },
    modelInfo: {
      logo: qianwen,
      name: 'Qwen-7B-Chat',
    },
  }
}

export function getLocalState(): UserState {
  const localSetting: UserState | undefined = ss.get(LOCAL_NAME)
  return { ...defaultSetting(), ...localSetting }
}

export function setLocalState(setting: UserState): void {
  ss.set(LOCAL_NAME, setting)
}
