import qs from 'qs'
import { api } from '../api'

// 获取当前加载的模型，默认是chatglm2-6b
export const llmModels = (params: any) => {
  return api({
    url: '/llm_model/list_models',
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'post',
    data: qs.parse(params),
  })
}

// 切换指定的模型
export const changeModels = (params: any) => {
  return api({
    url: '/llm_model/change',
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'post',
    data: qs.parse(params),
    timeout: 30000,
  })
}
