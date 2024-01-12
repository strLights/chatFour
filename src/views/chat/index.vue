<script setup lang='ts'>
import type { Ref } from 'vue'
import { computed, defineExpose, onMounted, onUnmounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { NAutoComplete, NButton, NInput, NModal, NSpin, useDialog, useMessage } from 'naive-ui'
import html2canvas from 'html2canvas'
import { Message } from './components'
import { useScroll } from './hooks/useScroll'
import { useChat } from './hooks/useChat'
import { useUsingContext } from './hooks/useUsingContext'
import HeaderComponent from './components/Header/index.vue'
import { SvgIcon } from '@/components/common'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { useAppStore, useChatStore, usePromptStore, useUserStore } from '@/store'
import { t } from '@/locales'
import { modelsStore } from '@/store/modules/models/models-setting'
import { debounce } from '@/utils/functions/debounce'
import spark from '@/assets/spark-icon.ico'
import qianwen from '@/assets/qwen.png'
import chatgpt from '@/assets/baichuan.png'
import chatglm from '@/assets/chatglm.png'

interface Props {
  chatId: number // 对话id
  chatIndex: number // 对话序号
  modelName: string // 模型名称
  inputValue: string // 对话框文本内容
  inputComplete: boolean // 是否完成文本输入
  modelModule: Chat.History // 循环的dataSourcesData的item
}
interface Emit {
  (ev: 'getInputValue'): void
}
const props = defineProps<Props>()
// 定义是否清空input
const emit = defineEmits<Emit>()

let controller = new AbortController()

// const openLongReply = import.meta.env.VITE_GLOB_OPEN_LONG_REPLY === 'true'

const store = modelsStore()
const userStore = useUserStore()
const dialog = useDialog()
const ms = useMessage()
const chatStore = useChatStore()
const appStore = useAppStore()

const { isMobile } = useBasicLayout()
const { addChat, updateChat, updateChatSome, getChatByUuidAndIndex } = useChat()
const { scrollRef, scrollToBottom, scrollToBottomIfAtBottom } = useScroll()
const { usingContext, toggleUsingContext } = useUsingContext()

// const { uuid } = route.params as { uuid: string }
const uuid = props.chatId
// const modelName = props.modelName
const dataSourcesData = computed(() => chatStore.history)

const dataSources = computed(() => chatStore.getChatByUuid(+uuid))
const conversationList = computed(() => dataSources.value.filter(item => (!item.inversion && !!item.conversationOptions)))

// 页面加载spin
const show = ref(false)

const prompt = ref<string>('')
const myModel = ref<string>('')
const currentIcon = ref<string>('')
const loading = ref<boolean>(false)
const inputRef = ref<Ref | null>(null)

// 添加PromptStore
const promptStore = usePromptStore()

// 历史记录相关
const history: any = ref([])
// 使用storeToRefs，保证store修改后，联想部分能够重新渲染
const { promptList: promptTemplate } = storeToRefs<any>(promptStore)

// 是否开启知识库问答
const active = ref<boolean>(false)
watch(
  () => props.inputValue,
  (newVal: string) => {
    // prompt.value = newVal
    if (newVal.length > 0 && myModel.value) {
      prompt.value = newVal
      handleSubmit()
    }
  },
  {
    immediate: true,
    deep: true,
  },
)
// 语言模型列表
// const loadModel = ref([])
const LlmData = ref([
  {
    label: 'chatglm2-6b',
    value: 'chatglm2-6b',
    icon: chatglm,
    status: false,
  },
  {
    label: '通义千问',
    value: 'qwen-api',
    icon: qianwen,
    status: false,
  },
  {
    label: '讯飞星火',
    value: 'xinghuo-api',
    icon: spark,
    status: false,
  },
  {
    label: '百川大模型',
    value: 'baichuan2-7b',
    icon: chatgpt,
    status: false,
  },
])
const pickLlm = ref('')
const resultData = ref([])
const getModel = (val: string): any => {
  LlmData.value.forEach((item) => {
    if (item.label === val) {
      // console.log(item.value)
      myModel.value = item.value
      currentIcon.value = item.icon
    }
  })
}
watch(
  () => props.modelName,
  (newVal: string) => {
    getModel(newVal)
    // console.log(newVal)
  },
  {
    immediate: true,
    deep: true,
  },
)

watch(
  () => props.inputComplete,
  (newVal: boolean) => {
    if (newVal)
      console.log(newVal)
      // console.log(prompt.value)
      // onConversation()
  },
  {
    immediate: true,
    deep: true,
  },
)
// 未知原因刷新页面，loading 状态不会重置，手动重置
dataSources.value.forEach((item, index) => {
  if (item.loading)
    updateChatSome(+uuid, index, { loading: false })
})
// 提交文本
function handleSubmit() {
  // if (store.Chatgpt)
  //   onConversation2()
  // if (store.chatglm)
  onConversation()
}
// 对话模型
async function onConversation() {
  if (!myModel.value)
    return
  const message = prompt.value
  if (usingContext.value) {
    for (let i = 0; i < dataSources.value.length; i = i + 2) { // 获取历史记录
      if (i % 2 === 1) {
        history.value.push({
          role: 'assistant',
          content: dataSources.value[i].text,
        })
      }
      else {
        history.value.push({
          role: 'user',
          content: dataSources.value[i].text,
        })
      }
    }
    // history.value.push({ 'Human': dataSources.value[i].text, 'Assistant': dataSources.value[i + 1].text.split('\n\n数据来源：\n\n')[0] })
  }
  else { history.value.length = 0 }
  if (!message || message.trim() === '')
    return

  controller = new AbortController()

  addChat(
    +uuid,
    {
      dateTime: new Date().toLocaleString(),
      text: message,
      knowledge: false,
      inversion: true,
      error: false,
      conversationOptions: null,
      requestOptions: { prompt: message, options: null },
    },
  )
  scrollToBottom()

  loading.value = true
  prompt.value = ''

  let options: Chat.ConversationRequest = {}
  const lastContext = conversationList.value[conversationList.value.length - 1]?.conversationOptions

  if (lastContext && usingContext.value)
    options = { ...lastContext }

  addChat(
    +uuid,
    {
      dateTime: new Date().toLocaleString(),
      text: '',
      loading: true,
      knowledge: false,
      inversion: false,
      error: false,
      conversationOptions: null,
      requestOptions: { prompt: message, options: { ...options } },
    },
  )
  scrollToBottom()

  try {
    const lastText = ''
    const api1Data = {
      query: message,
      history: [],
      // history: history.value,
      model_name: myModel.value,
      stream: true,
      temperature: Number(0.7),
    }
    const api2Data = {
      query: message,
      // history: history.value,
      history: [],
      model_name: myModel.value,
      stream: true,
      temperature: Number(0.7),
      prompt_name: 'llm_chat',
    }
    const fetchChatAPIOnce = async () => {
      emit('getInputValue')
      let result = ''
      if (props.modelName === 'chatglm2-6b' || props.modelName === '讯飞星火') {
        const response = await fetch('glmapi/chat/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(api1Data),
        })
        if (!response.body)
          return
        const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
        while (true) {
          const { value, done } = await reader.read()
          if (done)
            break
          // value = value?.replace('undefined', '')
          // console.log('knowledge data -', JSON.parse(value))
          // if (JSON.parse(value).answer)
          //   result += JSON.parse(value).answer
          // resultData.value = JSON.parse(value).docs
          result += value
          // output.value += value?.replace('undefined', '')
          try {
            updateChat(
              +uuid,
              dataSources.value.length - 1,
              {
                dateTime: new Date().toLocaleString(),
                text: lastText + (result ?? ''),
                source: resultData.value,
                knowledge: true,
                inversion: false,
                error: false,
                loading: false,
                conversationOptions: null,
                requestOptions: { prompt: message, options: { ...options } },
              },
            )
          }
          catch (error: any) { }
        }
      }
      else {
        const resData = {
          text: '',
        }
        const response = await fetch('api/chat/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(api2Data),
        })
        if (!response.body)
          return
        const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
        while (true) {
          const { value, done } = await reader.read()
          if (done)
            break
          // value = value?.replace('undefined', '')
          // console.log('received data -', value)
          resData.text += value
          // resdata = value
          // resData = JSON.parse(resData)
          // output.value += value?.replace('undefined', '')
          try {
            updateChat(
              +uuid,
              dataSources.value.length - 1,
              {
                dateTime: new Date().toLocaleString(),
                text: lastText + (resData.text ?? ''),
                knowledge: false,
                inversion: false,
                error: false,
                loading: false,
                conversationOptions: null,
                requestOptions: { prompt: message, options: { ...options } },
              },
            )
          }
          catch (error: any) { }
        }
      }
      scrollToBottomIfAtBottom()
      loading.value = false
      updateChatSome(+uuid, dataSources.value.length - 1, { loading: false })
    }

    await fetchChatAPIOnce()
  }
  catch (error: any) {
    const errorMessage = error?.message ?? t('common.wrong')

    if (error.message === 'canceled') {
      updateChatSome(
        +uuid,
        dataSources.value.length - 1,
        {
          loading: false,
        },
      )
      scrollToBottomIfAtBottom()
      return
    }

    const currentChat = getChatByUuidAndIndex(+uuid, dataSources.value.length - 1)

    if (currentChat?.text && currentChat.text !== '') {
      updateChatSome(
        +uuid,
        dataSources.value.length - 1,
        {
          text: `${currentChat.text}\n[${errorMessage}]`,
          error: false,
          loading: false,
        },
      )
      return
    }

    updateChat(
      +uuid,
      dataSources.value.length - 1,
      {
        dateTime: new Date().toLocaleString(),
        text: errorMessage,
        inversion: false,
        knowledge: false,
        error: true,
        loading: false,
        conversationOptions: null,
        requestOptions: { prompt: message, options: { ...options } },
      },
    )
    scrollToBottomIfAtBottom()
  }
  finally {
    loading.value = false
  }
}

async function handleRegenerate(index: number) {
  if (!myModel.value)
    return
  if (loading.value)
    return

  controller = new AbortController()

  const { requestOptions } = dataSources.value[index]

  const message = requestOptions?.prompt ?? ''

  let options: Chat.ConversationRequest = {}

  if (requestOptions.options)
    options = { ...requestOptions.options }

  loading.value = true

  updateChat(
    +uuid,
    index,
    {
      dateTime: new Date().toLocaleString(),
      text: '',
      inversion: false,
      knowledge: false,
      error: false,
      loading: true,
      conversationOptions: null,
      requestOptions: { prompt: message, options: { ...options } },
    },
  )

  try {
    const lastText = ''
    const api1Data = {
      query: message,
      history: [],
      model_name: myModel.value,
      stream: true,
      temperature: Number(0.7),
    }
    const api2Data = {
      query: message,
      history: [],
      model_name: myModel.value,
      stream: true,
      temperature: Number(0.7),
      prompt_name: 'llm_chat',
    }
    const fetchChatAPIOnce = async () => {
      let result = ''
      if (props.modelName === 'chatglm2-6b' || props.modelName === '讯飞星火') {
        const response = await fetch('glmapi/chat/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(api1Data),
        })
        if (!response.body)
          return
        const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
        while (true) {
          const { value, done } = await reader.read()
          if (done)
            break
          // value = value?.replace('undefined', '')
          // console.log('knowledge data -', JSON.parse(value))
          // if (JSON.parse(value).answer)
          //   result += JSON.parse(value).answer
          // resultData.value = JSON.parse(value).docs
          result += value
          // output.value += value?.replace('undefined', '')
          try {
            updateChat(
              +uuid,
              index,
              {
                dateTime: new Date().toLocaleString(),
                text: lastText + (result ?? ''),
                source: resultData.value,
                knowledge: true,
                inversion: false,
                error: false,
                loading: false,
                conversationOptions: null,
                requestOptions: { prompt: message, options: { ...options } },
              },
            )
          }
          catch (error: any) { }
        }
      }
      // else if (localStorage.getItem('chatMode') === 'LLM' || null) {
      else {
        const resData = {
          text: '',
        }
        const response = await fetch('api/chat/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(api2Data),
        })
        if (!response.body)
          return
        const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
        while (true) {
          const { value, done } = await reader.read()
          if (done)
            break
          // value = value?.replace('undefined', '')
          // console.log('received data -', value)
          resData.text += value
          // resdata = value
          // resData = JSON.parse(resData)
          // output.value += value?.replace('undefined', '')
          try {
            updateChat(
              +uuid,
              index,
              {
                dateTime: new Date().toLocaleString(),
                text: lastText + (resData.text ?? ''),
                knowledge: false,
                inversion: false,
                error: false,
                loading: false,
                conversationOptions: null,
                requestOptions: { prompt: message, options: { ...options } },
              },
            )
          }
          catch (error: any) { }
        }
      }
      scrollToBottomIfAtBottom()
      loading.value = false
      updateChatSome(+uuid, index, { loading: false })
    }

    await fetchChatAPIOnce()
  }
  catch (error: any) {
    if (error.message === 'canceled') {
      updateChatSome(
        +uuid,
        index,
        {
          loading: false,
        },
      )
      return
    }
    const errorMessage = error?.message ?? t('common.wrong')
    if (localStorage.getItem('chatMode') === 'knowledge') {
      updateChat(
        +uuid,
        index,
        {
          dateTime: new Date().toLocaleString(),
          text: errorMessage,
          inversion: false,
          knowledge: true,
          source: [],
          error: true,
          loading: false,
          conversationOptions: null,
          requestOptions: { prompt: message, options: { ...options } },
        },
      )
    }
    else {
      updateChat(
        +uuid,
        index,
        {
          dateTime: new Date().toLocaleString(),
          text: errorMessage,
          inversion: false,
          knowledge: false,
          error: true,
          loading: false,
          conversationOptions: null,
          requestOptions: { prompt: message, options: { ...options } },
        },
      )
    }
  }
  finally {
    loading.value = false
  }
}

function handleExport() {
  if (loading.value)
    return

  const d = dialog.warning({
    title: t('chat.exportImage'),
    content: t('chat.exportImageConfirm'),
    positiveText: t('common.yes'),
    negativeText: t('common.no'),
    onPositiveClick: async () => {
      try {
        d.loading = true
        const ele = document.getElementById('image-wrapper')
        const canvas = await html2canvas(ele as HTMLDivElement, {
          useCORS: true,
        })
        const imgUrl = canvas.toDataURL('image/png')
        const tempLink = document.createElement('a')
        tempLink.style.display = 'none'
        tempLink.href = imgUrl
        tempLink.setAttribute('download', 'chat-shot.png')
        if (typeof tempLink.download === 'undefined')
          tempLink.setAttribute('target', '_blank')

        document.body.appendChild(tempLink)
        tempLink.click()
        document.body.removeChild(tempLink)
        window.URL.revokeObjectURL(imgUrl)
        d.loading = false
        ms.success(t('chat.exportSuccess'))
        Promise.resolve()
      }
      catch (error: any) {
        ms.error(t('chat.exportFailed'))
      }
      finally {
        d.loading = false
      }
    },
  })
}

function handleDelete(index: number) {
  if (loading.value)
    return

  dialog.warning({
    title: t('chat.deleteMessage'),
    content: t('chat.deleteMessageConfirm'),
    positiveText: t('common.yes'),
    negativeText: t('common.no'),
    onPositiveClick: () => {
      chatStore.deleteChatByUuid(+uuid, index)
    },
  })
}

function modelAdd() {
  if (dataSourcesData.value.length >= 4) {
    ms.warning('最多选择4个模型进行对话')
  }
  else {
    chatStore.addHistory({ title: '请选择模型', uuid: Date.now(), isEdit: false })
    if (isMobile.value)
      appStore.setSiderCollapsed(true)
    debounce(location.reload(), 500)
  }
}

function modelDelete(index: number, event?: MouseEvent | TouchEvent) {
  // console.log('删的除模型', index)
  if (dataSourcesData.value.length === 1) {
    ms.warning('最少需保留一个模型进行对话')
  }
  else {
    event?.stopPropagation()
    chatStore.deleteHistory(index)
    if (isMobile.value)
      appStore.setSiderCollapsed(true)
    debounce(location.reload(), 500)
  }
}

const handleDeleteDebounce = debounce(modelDelete, 600)
// function handleClear() {
//   if (loading.value)
//     return

//   dialog.warning({
//     title: t('chat.clearChat'),
//     content: t('chat.clearChatConfirm'),
//     positiveText: t('common.yes'),
//     negativeText: t('common.no'),
//     onPositiveClick: () => {
//       chatStore.clearChatByUuid(+uuid)
//     },
//   })
// }
// 回车输入文本对话
function handleEnter(event: KeyboardEvent) {
  if (!isMobile.value) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSubmit()
    }
  }
  else {
    if (event.key === 'Enter' && event.ctrlKey) {
      event.preventDefault()
      handleSubmit()
    }
  }
}
// 停止返回对话
function handleStop() {
  if (loading.value) {
    controller.abort()
    loading.value = false
  }
}

// 可优化部分
// 搜索选项计算，这里使用value作为索引项，所以当出现重复value时渲染异常(多项同时出现选中效果)
// 理想状态下其实应该是key作为索引项,但官方的renderOption会出现问题，所以就需要value反renderLabel实现
const searchOptions = computed(() => {
  if (prompt.value.startsWith('/')) {
    return promptTemplate.value.filter((item: { key: string }) => item.key.toLowerCase().includes(prompt.value.substring(1).toLowerCase())).map((obj: { value: any }) => {
      return {
        label: obj.value,
        value: obj.value,
      }
    })
  }
  else {
    return []
  }
})

// value反渲染key
const renderOption = (option: { label: string }) => {
  for (const i of promptTemplate.value) {
    if (i.value === option.label)
      return [i.key]
  }
  return []
}

const placeholder = computed(() => {
  if (isMobile.value)
    return t('chat.placeholderMobile')
  return t('chat.placeholder')
})

const buttonDisabled = computed(() => {
  return loading.value || !prompt.value || prompt.value.trim() === ''
})

const footerClass = computed(() => {
  let classes = ['p-4']
  if (isMobile.value)
    classes = ['sticky', 'left-0', 'bottom-0', 'right-0', 'p-2', 'pr-3', 'overflow-hidden']
  return classes
})

onMounted(() => {
  scrollToBottom()
  // getLoadModel()
  if (inputRef.value && !isMobile.value)
    inputRef.value?.focus()
})

onUnmounted(() => {
  if (loading.value)
    controller.abort()
})

defineExpose({
  handleSubmit,
})
</script>

<template>
  <div class="flex flex-col w-full chat_main">
    <HeaderComponent
      :model-item="$props.modelModule"
      :model-name="modelName"
      :model-icon="currentIcon"
      :using-context="usingContext" @export="handleExport"
      @toggle-using-context="toggleUsingContext" @model-delete="handleDeleteDebounce(chatIndex, $event)"
      @model-add="modelAdd"
    />
    <!-- <div class="LLM-list" style="width: 200px; margin-top: 5rem;">
      <div v-for="(item, index) in LlmData" :key="index" class="btn" :class="{ btn_actived: item.value === pickLlm }">
        <NImage
          v-show="item.icon" width="30" :src="item.icon"
          :previewed-img-props="{ style: { marginRight: '13px' } }"
        />
        <NButton text style="font-size: 15px;font-weight: 400;" @click="changeModel(item)">
          {{ item.label }}
        </NButton>
      </div>
    </div> -->
    <div class="chat_box">
      <main class="flex flex-col overflow-hidden mainer">
        <div id="scrollRef" ref="scrollRef" class="flex overflow-hidden overflow-y-auto">
          <!-- <div
            v-for="(item, index) of dataSourcesData" id="image-wrapper" :key="index"
            class="w-full max-w-screen-xl m-auto dark:bg-[#101014]"
            :class="[isMobile ? 'p-2' : 'p-4']"
          > -->
          <div
            id="image-wrapper" class="w-full max-w-screen-xl m-auto dark:bg-[#101014]"
            :class="[isMobile ? 'p-2' : 'p-4']"
          >
            <!-- <div>
              <NImage
                v-show="item.icon" width="30" :src="item.icon"
                :previewed-img-props="{ style: { marginRight: '13px' } }"
              />
              <NButton text style="font-size: 15px;font-weight: 400;">
                {{ item.title }}
              </NButton>
            </div> -->
            <template v-if="!dataSources.length">
              <div class="flex items-center justify-center mt-4 text-center text-neutral-300">
                <SvgIcon icon="ri:bubble-chart-fill" class="mr-2 text-3xl" />
                <span>Say something~</span>
              </div>
            </template>
            <template v-else>
              <div>
                <Message
                  v-for="(item, index) of dataSources" :key="index" :date-time="item.dateTime" :text="item.text"
                  :knowledge="item.knowledge" :inversion="item.inversion" :image="currentIcon" :source="item.source" :error="item.error"
                  :loading="item.loading" @delete="handleDelete(index)" @regenerate="handleRegenerate(index)"
                />
                <div class="sticky bottom-0 left-0 flex justify-center">
                  <NButton v-if="loading" type="warning" @click="handleStop">
                    <template #icon>
                      <SvgIcon icon="ri:stop-circle-line" />
                    </template>
                    Stop Responding
                  </NButton>
                </div>
              </div>
            </template>
          </div>
        </div>
        <!-- <footer :class="footerClass">
          <div class="w-full max-w-screen-xl m-auto p-4">
            <div class="flex items-center justify-between space-x-2 ml-8">
              <NAutoComplete v-model:value="prompt" :options="searchOptions" :render-label="renderOption">
                <template #default="{ handleInput, handleBlur, handleFocus }">
                  <NInput
                    ref="inputRef" v-model:value="prompt" type="textarea" :placeholder="placeholder" size="large"
                    :autosize="{ minRows: 1, maxRows: isMobile ? 4 : 8 }" @input="handleInput" @focus="handleFocus"
                    @blur="handleBlur" @keypress="handleEnter"
                  />
                </template>
              </NAutoComplete>
              <NButton class="sendBtn" type="primary" size="large" :disabled="buttonDisabled" @click="handleSubmit">
                <template #icon>
                  <span class="dark:text-black">
                    <SvgIcon icon="ri:send-plane-fill" />
                  </span>
                </template>
              </NButton>
            </div>
          </div>
        </footer> -->
      </main>
    </div>
    <NModal v-model:show="show" :mask-closable="false" class="modal">
      <NSpin size="large">
        <template #description>
          正在切换模型，请稍后...
        </template>
      </NSpin>
    </NModal>
  </div>
</template>

<style scoped lang="less">
.chat_main {
  padding: 20px;
  width: 25%;
}
.btn {
  display: flex;
  padding: 2rem;
  margin-left: 15px;
  align-items: center;
}

.btn:hover,
.btn_actived {
  border-top-left-radius: 15px;
  border-bottom-left-radius: 15px;
  background: #f2f3f7;
}

:deep(.n-image img) {
  border-radius: 8px;
  margin-right: 5px;
}

.chat_box {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  // padding: 15px;
  width: 100%;
  height: 500px;

  .mainer {
    background-color: rgba(10, 4, 1, 0.7);
    border-radius: 1rem;
    height: 100%;
  }
}

.modal {
  background-color: rgba(255, 255, 255, 0);
  box-shadow: none;
  margin: 0;
  width: 100%;
  color: #fff;
}

:deep(.n-spin-description) {
  color: #fff;
}
:deep(.n-auto-complete) {
  display: none;
}
.sendBtn {
  display: none;
}
</style>
