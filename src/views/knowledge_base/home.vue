<!-- eslint-disable no-template-curly-in-string -->
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { UploadCustomRequestOptions, UploadFileInfo, UploadInst } from 'naive-ui'
import { NButton, NCheckbox, NCollapse, NCollapseItem, NDataTable, NDivider, NInput, NInputNumber, NP, NSelect, NTag, NUpload, NUploadDragger, useMessage } from 'naive-ui'
import { createKnowledge, deleteDocs, deleteKnowledge, getKnowledge, getKnowledgeDocs, uploadDocs } from '../../api/llm/knowledge_base'
import { SvgIcon } from '@/components/common'

const message = useMessage()

const columns = ref([
  {
    title: '序号',
    key: 'no',
    width: 100,
  },
  {
    title: '文档名称',
    key: 'title',
    resizable: true,
  },
])
const fileListLength = ref(0)
const tableData = ref([])
const type = ref('')
const maxText = ref(250)
const length = ref(0)
const inputValue = ref('')
const chinese = ref(false)
const options = ref([])
const pickDoc = ref('')
const uploadData = ref({
  override: false,
  knowledge_base_name: type,
  to_vector_store: true,
  chunk_size: maxText,
  chunk_overlap: length,
  zh_title_enhance: chinese,
  not_refresh_vs_cache: false,
  docs: '',
})
// 向量库类型
const pickedVector = ref('faiss')
const vectorType = [
  {
    label: 'faiss',
    value: 'faiss',
  },
  {
    label: 'milvus',
    value: 'milvus',
  },
  {
    label: 'pg',
    value: 'pg',
  },
]
const changeVector = (val: string) => {
  pickedVector.value = val
}
// Embedding 模型
const pickedEmbedding = ref('text2vec-base')
const EmbeddingModel = [
  {
    label: 'ernie-tiny',
    value: 'ernie-tiny',
  },
  {
    label: 'ernie-base',
    value: 'ernie-base',
  },
  {
    label: 'text2vec-base',
    value: 'text2vec-base',
  },
  {
    label: 'text2vec',
    value: 'text2vec',
  },
  {
    label: 'text2vec-paraphrase',
    value: 'text2vec-paraphrase',
  },
  {
    label: 'text2vec-sentence',
    value: 'text2vec-sentence',
  },
  {
    label: 'text2vec-multilingual',
    value: 'text2vec-multilingual',
  },
  {
    label: 'text2vec-bge-large-chinese',
    value: 'text2vec-bge-large-chinese',
  },
  {
    label: 'm3e-small',
    value: 'm3e-small',
  },
  {
    label: 'm3e-base',
    value: 'm3e-base',
  },
  {
    label: 'm3e-large',
    value: 'm3e-large',
  },
  {
    label: 'bge-small-zh',
    value: 'bge-small-zh',
  },
  {
    label: 'bge-base-zh',
    value: 'bge-base-zh',
  },
  {
    label: 'bge-large-zh',
    value: 'bge-large-zh',
  },
  {
    label: 'bge-large-zh-noinstruct',
    value: 'bge-large-zh-noinstruct',
  },
  {
    label: 'piccolo-base-zh',
    value: 'piccolo-base-zh',
  },
  {
    label: 'piccolo-large-zh',
    value: 'piccolo-large-zh',
  },
  {
    label: 'text-embedding-ada-002',
    value: 'text-embedding-ada-002',
  },
]
const changeEmbedding = (val: string) => {
  pickedEmbedding.value = val
}
// 上传文档
const fileList = ref()
const uploadRef = ref<UploadInst | null>(null)
const handleChange = (options: { fileList: UploadFileInfo[] }) => {
  fileList.value = options.fileList
  fileListLength.value = options.fileList.length
}
const myUpload = () => {
  if (fileListLength.value) {
    const formData = new FormData()
    if (uploadData.value) {
      Object.keys(uploadData.value).forEach((key) => {
        formData.append(
          key,
          uploadData.value[key as keyof UploadCustomRequestOptions['data']],
        )
      })
    }
    fileList.value.forEach((item: { file: string | Blob }) => {
      formData.append('files', item.file)
    })
    // console.log(file)
    uploadDocs(formData).then((res) => {
      const { code, msg } = res.data
      if (code === 200) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        getBaseDocs()
        message.success(JSON.stringify(msg))
      }
      else {
        message.error(JSON.stringify(msg))
      }
    }).catch((err) => {
      message.error(err)
    })
  }
}
// 获取知识库名称
const getKnowledgeBase = async (status?: boolean) => {
  options.value = []
  getKnowledge().then((res) => {
    const { code, msg, data } = res.data
    if (code === 200) {
      if (status)
        type.value = data[0]
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      getBaseDocs()
      data.forEach((ele: any) => {
        options.value.push({
          label: ele,
          value: ele,
        })
      })
      options.value.push({
        label: '新建知识库',
        value: 'create',
      })
    }
    else {
      message.error(msg)
    }
  }).catch((err) => {
    // console.log(err)
    message.error(err)
  })
}
// 获取知识库中文档
const getBaseDocs = async () => {
  tableData.value = []
  const param = {
    knowledge_base_name: type.value,
  }
  getKnowledgeDocs(param).then((res) => {
    const { code, msg, data } = res.data
    if (code === 200) {
      data.forEach((element, index) => {
        tableData.value.push({
          no: index + 1,
          title: element,
        })
      })
    }
    else {
      message.error(msg)
    }
  }).catch((err) => {
    message.error(err)
  })
}
const rowProps = (row: RowData) => {
  return {
    style: 'cursor: pointer; background: red;',
    onClick: () => {
      pickDoc.value = row.title
      message.info(`已选中${pickDoc.value}`)
    },
  }
}
// 下载
const download = () => {
  // const date = {
  //   knowledge_base_name: type.value,
  //   file_name: pickDoc.value,
  // }
  const url = `http://120.133.83.144:7861/knowledge_base/download_doc?knowledge_base_name=${type.value}&file_name=${pickDoc.value}`
  const link: HTMLAnchorElement = document.createElement('a')
  link.href = url
  // link.download = `chat-store_${date}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
// 删除文档
const delDoc = () => {
  const param = {
    knowledge_base_name: type.value,
    file_names: [pickDoc.value],
    delete_content: false,
    not_refresh_vs_cache: false,
  }
  deleteDocs(param).then((res) => {
    const { code, msg } = res.data
    if (code === 200) {
      getBaseDocs()
      message.success(msg)
    }
    else {
      message.error(msg)
    }
  }).catch((err) => {
    message.error(err)
  })
}
// 选择或新建知识库
const changeBase = () => {
  tableData.value = []
  pickDoc.value = ''
  if (type.value !== 'create')
    getBaseDocs()
}
// 创建知识库
const createBase = () => {
  const param = {
    knowledge_base_name: inputValue.value,
    vector_store_type: pickedVector.value,
    embed_model: pickedEmbedding.value,
  }
  createKnowledge(param).then((res) => {
    const { code, msg } = res.data
    if (code === 200) {
      getKnowledgeBase(false)
      type.value = inputValue.value
      getBaseDocs()
      message.success(msg)
    }
    else {
      message.error(msg)
    }
  }).catch((err) => {
    message.error(err)
  })
}
// 删除知识库
const delBase = () => {
  deleteKnowledge(type.value).then((res) => {
    const { code, msg } = res.data
    if (code === 200) {
      message.success(msg)
      getKnowledgeBase(true)
    }
    else {
      message.error(msg)
    }
  }).catch((err) => {
    message.error(err)
  })
}
onMounted(() => {
  getKnowledgeBase(true)
  getBaseDocs()
})
</script>

<template>
  <div class="flex flex-col w-full h-full">
    <main class="container">
      <div id="scrollRef" ref="scrollRef" class="h-full overflow-hidden overflow-y-auto">
        <div>
          <label class="label">请选择或新建知识库：</label>
          <NSelect
            v-model:value="type" style="border-radius: 0.5rem; margin-top: 0.5rem; height: 40px;"
            :options="options" @update:value="changeBase"
          />
        </div>
        <div v-if="type === 'create'">
          <div class="border">
            <div>
              <label class="label">新建知识库名称</label>
              <NInput v-model:value="inputValue" style="margin-top: 10px;" placeholder="新知识库名称，不支持中文命名" />
            </div>
            <div class="flex between mt-4">
              <div style="width: 49%;">
                <label class="label">向量库类型</label>
                <NSelect
                  v-model:value="pickedVector" style="border-radius: 0.5rem; margin-top: 0.5rem; height: 40px;"
                  :options="vectorType" @update:value="changeVector(pickedVector)"
                />
              </div>
              <div style="width: 49%;">
                <label class="label">Embedding模型</label>
                <NSelect
                  v-model:value="pickedEmbedding" style="border-radius: 0.5rem; margin-top: 0.5rem; height: 40px;"
                  :options="EmbeddingModel" @update:value="changeEmbedding(pickedEmbedding)"
                />
              </div>
            </div>
            <div style="margin-top: 15px;">
              <NButton style="width: 100%; font-size: 16px;border-radius: 0.5rem;" @click="createBase">
                新建
              </NButton>
            </div>
          </div>
        </div>
        <div v-else class="management">
          <div class="add">
            <div class="upload mt-4">
              <label>上传知识文件：</label>
              <NUpload
                ref="uploadRef" multiple directory-dnd action="api/knowledge_base/upload_docs" :max="15" style="margin-top: 10px; border-radius: 0.5rem;"
                :default-upload="false" @change="handleChange"
              >
                <NUploadDragger class="flex">
                  <div class="flex justify-between items-center" style="margin-right: 24px;">
                    <SvgIcon class="text-4xl" icon="icons8:upload-2" />
                  </div>
                  <div>
                    <NP style="font-size: 16px;margin: 8px 0 0 0;text-align: left;">
                      Drag and drop files here
                    </NP>
                    <NP depth="3" style="margin: 8px 0 0 0;text-align: left;">
                      Limit 200MB per file • HTML, MD, JSON, CSV, PDF, PNG, JPG, JPEG, BMP, EML, MSG, RST, RTF, TXT, XML,
                      DOCX, EPUB, ODT, PPT, PPTX, TSV, HTM
                    </NP>
                  </div>
                  <NButton style="background-color: #fff;">
                    Browse files
                  </NButton>
                </NUploadDragger>
              </NUpload>
            </div>
            <div class="file-config border">
              <NCollapse arrow-placement="right" :default-expanded-names="['1']">
                <NCollapseItem title="文件处理配置" name="1">
                  <div class="flex justify-between items-center">
                    <div style="width: 32%;">
                      <label>单段文本最大长度：</label>
                      <NInputNumber v-model:value="maxText" style="margin-top: 0.5rem;" :max="1000" />
                    </div>
                    <div style="width: 32%;">
                      <label for="">相邻文本重合长度：</label>
                      <NInputNumber v-model:value="length" style="margin-top: 0.5rem;" :max="1000" />
                    </div>
                    <div style="width: 32%; margin-top: 24px;">
                      <NCheckbox v-model:checked="chinese">
                        开启中文标题加强
                      </NCheckbox>
                    </div>
                  </div>
                </NCollapseItem>
              </NCollapse>
            </div>
            <NButton :disabled="!fileListLength" style="margin-top: 20px;padding: 12px 24px;" @click="myUpload">
              添加文件到知识库
            </NButton>
          </div>
          <NDivider />
          <div class="docs">
            <NP style="font-size: 16px;margin: 8px 0 0 0;text-align: left;">
              知识库<code class="code">{{ type }}</code>中已有文件：
            </NP>
            <NTag
              :bordered="false" type="info"
              style="--n-padding: 16px;line-height:24px; height: auto; width: 100%; border-radius: 0.5rem; font-size: 16px; margin-top: 15px;"
            >
              知识库中包含源文件与向量库，请从下表中选择文件后操作
            </NTag>
            <NDataTable striped :columns="columns" :data="tableData" :row-props="rowProps" style="margin-top: 15px;" />
            <div class="flex justify-between mt-6">
              <NButton :disabled="!pickDoc" style="padding: 12px 24px;" @click="download">
                下载选中文档
              </NButton>
              <!-- <NButton :disabled="!pickDoc">
                添加至向量库
              </NButton>
              <NButton :disabled="!pickDoc">
                从向量库删除
              </NButton> -->
              <NButton type="info" style="padding: 12px 24px;" @click="delDoc">
                从知识库中删除
              </NButton>
            </div>
          </div>
          <NDivider />
          <div class="flex between">
            <NButton type="info" style="padding: 12px 24px;">
              依据源文件重建向量库
            </NButton>
            <NButton style="padding: 12px 24px;" @click="delBase">
              删除知识库
            </NButton>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style lang="less" scoped>
.container {
  width: 100%;
  padding: 6rem 1rem 10rem;
  max-width: 46rem;
  margin: 0 auto;

  .border {
    border: 1px solid rgba(0, 0, 0, 0.2);
    border-radius: 0.5rem;
    padding: 1rem;
    margin-top: 20px;
  }

  .between {
    margin-bottom: 20px;
    justify-content: space-between;
  }

  :deep(.n-upload-dragger) {
    border-radius: 0.5rem;
  }

  :deep(.n-button) {
    padding: 0 8px;
    height: auto;
    border-radius: 0.5rem;
  }

  .code {
    color: rgb(9, 171, 59);
    overflow-wrap: break-word;
    padding: 0.2em 0.4em;
    border-radius: 0.25rem;
    background-color: rgb(248, 249, 251);
  }
}
</style>
