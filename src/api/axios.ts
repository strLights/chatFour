/* eslint-disable prefer-promise-reject-errors */
import type { AxiosResponse } from 'axios'
import axios from 'axios'

import { useMessage } from 'naive-ui'
const createAPI = () => {
  const instance = axios.create({
    // process.env.NODE_ENV === 'development' 来判断是否开发环境
    baseURL: '',
    /*  process.env.USAGE === 'development'
        ?
        window.baseApi ?? '/api'
        : 'http://192.168.1.99:51798', */
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    },
    // timeout: 5000,
  })
  const message = useMessage()
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response
    },
    async (error) => {
      if (error.response) {
        switch (error.response.status) {
          case 401:
            // 返回 401 清除token信息并跳转到登录页面
            message.error('401')
            sessionStorage.removeItem('xtoken')
            break
          case 403:
            message.error('403')
            break
          case 404:
            message.error('404')
            break
          case 500:
            message.error('500')
        }
      }
      return await Promise.reject()
    },
  )
}

export default createAPI
