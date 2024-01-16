<script setup lang='ts'>
import type { Ref } from 'vue'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { NConfigProvider, NAutoComplete, NButton, NInput, useDialog, useMessage } from 'naive-ui'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { useChatStore, usePromptStore, useUserStore } from '@/store'
import { modelsStore } from '@/store/modules/models/models-setting'
import { SvgIcon } from '@/components/common'
import ChatComponent from '../chat/index.vue'
const store = modelsStore()
const userStore = useUserStore()
const route = useRoute()
const dialog = useDialog()
const ms = useMessage()
const chatStore = useChatStore()
const themeOverrides = {
  Input: {
    paddingTiny: '0 8px',
    color: 'rgba(0, 0, 0, 0.1)',
    colorFocus: 'rgba(0, 0, 0, 0.5)',
    textColor: 'rgba(255, 255, 255, 0.82)',
    border: '1px solid rgba(111, 75, 41, 1)',
  },
}
const { isMobile } = useBasicLayout()

const { uuid } = route.params as { uuid: string }
const dataSourcesData = ref<Chat.History[]>([])

const dataSources = computed(() => chatStore.getChatByUuid(+uuid))
const conversationListLen = computed(() => chatStore.history.length)

const annoListRef = ref<any>([])
const childRef = (el: any) => {
  annoListRef.value.push(el)
}
// 页面加载spin
// const show = ref(false)

const prompt = ref<string>('')
const inputValue = ref<string>('')
const status = ref<boolean>(false)
const inputRef = ref<Ref | null>(null)

// 添加PromptStore
// const promptStore = usePromptStore()
const buttonDisabled = computed(() => {
  return !prompt.value || prompt.value.trim() === ''
})
// 历史记录相关
// const history: any = ref([])
// 使用storeToRefs，保证store修改后，联想部分能够重新渲染
// const { promptList: promptTemplate } = storeToRefs<any>(promptStore)

const getDataFromLocalStorage = () => {
  return JSON.parse(localStorage.getItem('chatStorage') || '[]').data.history
}

watch(
  () => conversationListLen,
  (newVal: any) => {
    dataSourcesData.value = getDataFromLocalStorage()
    console.log(newVal.value + '\n' + JSON.parse(localStorage.getItem('chatStorage')))
  },
  {
    immediate: true,
    deep: true,
  },
)

const handleSubmit = () => {
  // annoListRef.value.map((item: { handleSubmit: (arg0: string) => void }): void => {
  //   // return console.log(item) // 打印效果在下方
  //   if (prompt.value) {
  //     inputValue.value = prompt.value
  //     status.value = true
  //     // console.log("123")
  //     return item.handleSubmit(inputValue.value)
  //   }
  // })
  if (prompt.value)
    inputValue.value = prompt.value
  prompt.value = ''
  //   // status.value = true
  //   // console.log("123")
  // }
}
const footerClass = computed(() => {
  let classes = ['p-4']
  if (isMobile.value)
    classes = ['sticky', 'left-0', 'bottom-0', 'right-0', 'p-2', 'pr-3', 'overflow-hidden']
  return classes
})
function handleEnter(event: KeyboardEvent) {
  if (!isMobile.value) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSubmit()
      // prompt.value = ''
    }
  }
  else {
    if (event.key === 'Enter' && event.ctrlKey) {
      event.preventDefault()
      handleSubmit()
      // prompt.value = ''
    }
  }
}

function handleClearInput() {
  prompt.value = ''
}
</script>

<template>
  <div class="chat_bg flex flex-row w-full h-full">
    <div class="chat_box">
      <main class="flex flex-col overflow-hidden mainer">
        <div id="scrollRef" ref="scrollRef" class="flex h-full overflow-hidden overflow-y-auto">
          <template v-for="(item, index) of dataSourcesData" :key="index">
            <ChatComponent
              :ref="childRef" :chat-id="item.uuid" :model-name="item.title" :input-value="inputValue"
              :input-complete="status" :chat-index="index" :model-module="item"
            />
          </template>
        </div>
        <footer :class="footerClass">
          <div class="w-full m-auto p-4">
            <div class="flex items-center justify-between space-x-2">
              <NConfigProvider class="w-full" :theme-overrides="themeOverrides">
                <NAutoComplete v-model:value="prompt">
                  <template #default="{ handleInput, handleBlur, handleFocus }">
                    <NInput
                      ref="inputRef" v-model:value="prompt" class="input_value" type="textarea" clearable placeholder="请输入对话内容，换行请使用Shift+Enter" size="large"
                      :autosize="{ minRows: 2, maxRows: isMobile ? 4 : 8 }" @input="handleInput" @focus="handleFocus"
                      @blur="handleBlur" @keypress="handleEnter"
                    />
                  </template>
                </NAutoComplete>
              </NConfigProvider>
              <NButton class="sendBtn" type="primary" size="medium" color="rgb(255,225,151)" :disabled="buttonDisabled" @click="handleSubmit">
                <template #icon>
                  <span class="dark:text-black">
                    <SvgIcon icon="ri:send-plane-fill" />
                  </span>
                </template>
              </NButton>
            </div>
          </div>
        </footer>
      </main>
    </div>
  </div>
</template>

<style scoped lang="less">
.chat_bg {
  width: 100%;
  height: 100%;
  background: url('@/assets/chat/bg_bigmodel.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
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
  padding: 15px;
  width: 100%;
  margin-top: 60px;
  .mainer {
    // background-color: rgb(242, 243, 247);
    border-radius: 1rem;
    height: 100%;
  }
}
.sendBtn {
  position: absolute;
  right: 5%;
  --n-text-color: #000 !important;
  --n-text-color-hover: #000 !important;
  --n-text-color-disabled: #000 !important;
  --n-text-color-pressed: #000 !important;
  --n-text-color-focus: #000 !important;
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
// .input_value {
//   background-color: rgba(10, 4, 1, 1);
//   border: 1px solid rgba(111, 75, 41, 1);
// }
</style>
