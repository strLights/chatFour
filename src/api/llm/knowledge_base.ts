import qs from 'qs'
import { api } from '../api'

// 获取知识库列表
export const getKnowledge = () => {
  return api({
    url: '/knowledge_base/list_knowledge_bases',
    method: 'get',
  })
}

// 创建知识库
export const createKnowledge = (params: any) => {
  return api({
    url: '/knowledge_base/create_knowledge_base',
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'post',
    data: qs.parse(params),
  })
}

// 删除知识库
export const deleteKnowledge = (params: any) => {
  return api({
    url: '/knowledge_base/delete_knowledge_base',
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'post',
    data: params,
  })
}

// 获取知识库内的文件列表
export const getKnowledgeDocs = (params: any) => {
  return api({
    url: '/knowledge_base/list_files',
    method: 'get',
    params,
  })
}

// 搜索知识库
export const searchKnowledge = (params: any) => {
  return api({
    url: '/knowledge_base/search_docs',
    method: 'post',
    data: qs.stringify(params),
  })
}

// 上传文件到知识库，并/或进行向量化
export const uploadDocs = (params: any) => {
  return api({
    url: '/knowledge_base/upload_docs',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    method: 'post',
    data: params,
  })
}

// 删除知识库内指定文件
export const deleteDocs = (params: any) => {
  return api({
    url: '/knowledge_base/delete_docs',
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'post',
    data: qs.parse(params),
  })
}

// 更新现有文件到知识库
export const updateDocs = (params: any) => {
  return api({
    url: '/knowledge_base/update_docs',
    method: 'post',
    data: qs.stringify(params),
  })
}

// 下载对应的知识文件
export const downloadDoc = (param: any) => {
  return api({
    url: '/knowledge_base/download_doc',
    method: 'get',
    param,
  })
}

// 根据content中文档重建向量库，流式输出处理进度。
export const recreateVectorStore = (params: any) => {
  return api({
    url: '/knowledge_base/recreate_vector_store',
    method: 'post',
    data: qs.stringify(params),
  })
}
