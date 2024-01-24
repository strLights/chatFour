<script lang="ts" setup>
import { computed, h, ref } from 'vue'
import type { SelectRenderLabel, SelectRenderTag } from 'naive-ui'
import { NAvatar, NConfigProvider, NSelect } from 'naive-ui'
import { SvgIcon } from '@/components/common'
import { /* useAppStore, */ useChatStore } from '@/store'
// import { useBasicLayout } from '@/hooks/useBasicLayout'
// import { debounce } from '@/utils/functions/debounce'
import spark from '@/assets/spark-icon.ico'
import qianwen from '@/assets/qwen.png'
import baichuan from '@/assets/baichuan.png'
import chatglm from '@/assets/chatglm.png'

const props = defineProps<Props>()
const emit = defineEmits<Emit>()

// const { isMobile } = useBasicLayout()

interface Props {
  usingContext: boolean
  modelIcon: string
  modelItem: Chat.History
  modelIndex: number
}

interface Emit {
  // (ev: 'export'): void
  // (ev: 'toggleUsingContext'): void
  (ev: 'modelAdd'): void
  (ev: 'modelDelete'): void
}

interface OptionsArr {
  label: string
  value: string
  icon: string
}

interface SelectedOption {
  title: string
  uuid: number
  isEdit: boolean
}

// const appStore = useAppStore()
const chatStore = useChatStore()

const themeOverrides = {
  Select: {
    border: '0px solid rgba(111, 75, 41, 1)',
  },
}

// const collapsed = computed(() => appStore.siderCollapsed)
// const currentChatHistory = computed(() => chatStore.getChatHistoryByCurrentActive)
const dataSourcesData = computed(() => chatStore.history)
const modelInfo = ref(computed(() => props.modelItem))
const modelValue = ref(computed(() => modelInfo.value.title))
const ModelIndex = computed(() => chatStore.history.findIndex(item => item.title === props.modelItem.title))
const newModelOptions = ref<OptionsArr[]>([
  {
    label: 'chatglm3-6b',
    value: 'chatglm3-6b',
    icon: chatglm,
  },
  {
    label: '通义千问',
    value: '通义千问',
    icon: qianwen,
  },
  {
    label: '讯飞星火',
    value: '讯飞星火',
    icon: spark,
  },
  {
    label: '百川大模型',
    value: '百川大模型',
    icon: baichuan,
  },
])
const modelOptions = ref<OptionsArr[]>([
  {
    label: 'chatglm3-6b',
    value: 'chatglm3-6b',
    icon: chatglm,
  },
  {
    label: '通义千问',
    value: '通义千问',
    icon: qianwen,
  },
  {
    label: '讯飞星火',
    value: '讯飞星火',
    icon: spark,
  },
  {
    label: '百川大模型',
    value: '百川大模型',
    icon: baichuan,
  },
])

const renderSingleSelectTag: SelectRenderTag = ({ option }) => {
  return h(
    'div',
    {
      style: {
        display: 'flex',
        alignItems: 'center',
      },
    },
    [
      h(NAvatar, {
        src: option.icon as string,
        round: true,
        size: 24,
        style: {
          marginRight: '12px',
        },
      }),
      option.label as string,
    ],
  )
}

const renderLabel: SelectRenderLabel = (option) => {
  return h(
    'div',
    {
      style: {
        display: 'flex',
        alignItems: 'center',
      },
    },
    [
      h(NAvatar, {
        src: option.icon as string,
        round: true,
        size: 'medium',
        style: {
          backgroundColor: 'rgba(0, 0, 0, 0)',
        },
      }),
      h(
        'div',
        {
          style: {
            marginLeft: '12px',
            padding: '14px 0',
            color: '#d8d1c0',
          },
        },
        [
          h('div', null, [option.label as string]),
          // h(
          //   NText,
          //   { depth: 3, tag: 'div' },
          //   {
          //     default: () => 'description',
          //   },
          // ),
        ],
      ),
    ],
  )
}
function findUniqueItems(arr1: OptionsArr[], arr2: SelectedOption[]) {
  // 合并两个数组并筛选出只出现一次的条目
  newModelOptions.value = arr1.map((a1Item) => {
    const isUnique = arr2.some(a2Item => a2Item.title === a1Item.value)
    return isUnique ? { ...a1Item, disabled: true } : a1Item
  })
}

// function handleUpdateCollapsed() {
//   appStore.setSiderCollapsed(!collapsed.value)
// }

// function onScrollToTop() {
//   const scrollRef = document.querySelector('#scrollRef')
//   if (scrollRef)
//     nextTick(() => scrollRef.scrollTop = 0)
// }

// function handleExport() {
//   emit('export')
// }

// function toggleUsingContext() {
//   emit('toggleUsingContext')
// }
function handleAdd() {
  emit('modelAdd')
}
// function handleAdd() {
//   chatStore.addHistory({ title: 'New Chat', uuid: Date.now(), isEdit: false })
//   if (isMobile.value)
//     appStore.setSiderCollapsed(true)
// }
function getModel(value: string) {
  modelInfo.value.title = value
  // item.title = value
  // console.log(value, modelInfo.value)
  // event?.stopPropagation()
  chatStore.updateHistory(modelInfo.value.uuid, modelInfo.value)
  // debounce(location.reload(), 500)
  // location.reload()
}

// const handleDeleteDebounce = debounce(handleDelete, 600)
function handleDel() {
  emit('modelDelete')
}
</script>

<template>
  <header
    class="model_top sticky top-0 left-0 right-0 z-30 dark:border-neutral-800 bg-white/80 dark:bg-black/20 backdrop-blur"
  >
    <div class="w-full relative flex items-center justify-between min-w-0 overflow-hidden h-14">
      <!-- <div style="width: 40%;" class="flex items-center">
        <button class="flex items-center justify-center" @click="handleUpdateCollapsed">
          <NAvatar :src="modelIcon" style="background-color: rgba(0, 0, 0, 0); border-radius: 50%;" />
        </button>
        <h1
          class="model_name flex-1 pl-2 pr-6 overflow-hidden cursor-pointer select-none text-ellipsis whitespace-nowrap"
          @dblclick="onScrollToTop"
        >
          {{ modelName }}
        </h1>
      </div> -->
      <div style="width: 80%;height: 100%;">
        <NConfigProvider class="w-full h-full" :theme-overrides="themeOverrides">
          <NSelect
            v-model:value="modelValue"
            placeholder="请选择模型"
            :options="newModelOptions"
            :render-label="renderLabel"
            :render-tag="renderSingleSelectTag"
            style="--n-border: 0px solid rgb(0,0,0);"
            @update:show="findUniqueItems(modelOptions, dataSourcesData)"
            @update:value="getModel"
          />
        </NConfigProvider>
      </div>
      <div style="width: 20%; margin-left: 15px; border-left-width: 1px;border-left-color: rgba(87,59,37, 1);border-left-style: solid;padding-left: 20px;" class="flex items-center space-x-2">
        <!-- <HoverButton @click="toggleUsingContext"> -->
        <div @click="handleDel">
          <!-- <NPopconfirm placement="bottom" @positive-click="handleDel">
          <template #trigger>
            <button class="p-1 text-xl text-[#956f4c] dark:text-white">
              <SvgIcon icon="ic:round-close" />
            </button>
          </template>
          {{ $t('chat.deleteModelConfirm') }}
        </NPopconfirm> -->
          <span style="cursor: pointer;" class="text-xl text-[#956f4c] dark:text-white">
            <SvgIcon icon="ic:round-close" />
          </span>
        </div>
        <!-- </HoverButton> -->
        <!-- <HoverButton @click="handleExport"> -->
        <div v-if="modelIndex === 0" @click="handleAdd">
          <span style="cursor: pointer;" class="text-xl text-[#956f4c] dark:text-white">
            <SvgIcon icon="fluent:add-16-regular" />
          </span>
        </div>
        <!-- </HoverButton> -->
      </div>
    </div>
  </header>
</template>

<style lang="less" scoped>
.model_top {
  width: 100%;
  height: 56px;
  background: url('@/assets/chat/bg_chat_model.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .model_name {
    font-size: 14px;
    color: #D8D1C0;
  }
  .n-select {
    height: 100%;
  }
  //
  :deep(.n-base-select-menu .n-base-select-option) {
    height: 45px;
  }
  :deep(.n-base-selection) {
    height: 100%;
    color: #d8d1c0;
    --n-border: none !important;
    --n-border-hover: none !important;
    --n-border-active: none !important;
    --n-border-focus: none !important;
  }
  :deep(.n-base-selection .n-base-selection-label) {
    height: 100%;
    background-color: rgba(0, 0, 0, 0);
  }
  :deep(.n-base-selection .n-base-selection-label .n-base-selection-input) {
    height: 56px;
    line-height: 56px;
    font-size: 16px;
    color: #d8d1c0;
  }
}

:deep(.n-avatar) {
  background-color: rgba(0, 0, 0, 0);
  width: 36px;
  height: 36px;
}
:deep(.v-binder-follower-content .n-base-select-menu) {
  background-color: rgba(43,32,26,1) !important;
}
.n-select-menu {
  background-color: rgba(43,32,26,1) !important;
}
</style>
