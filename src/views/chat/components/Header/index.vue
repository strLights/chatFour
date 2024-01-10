<script lang="ts" setup>
import { computed, h, nextTick, ref } from 'vue'
import { NAvatar, NSelect, NPopconfirm, SelectRenderTag, NText, SelectRenderLabel } from 'naive-ui'
import { SvgIcon } from '@/components/common'
import { useAppStore, useChatStore } from '@/store'
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
  modelName: string
  modelIcon: string
  // chatId: number
}

interface Emit {
  // (ev: 'export'): void
  // (ev: 'toggleUsingContext'): void
  (ev: 'modelAdd'): void
  (ev: 'modelDelete'): void
}

const appStore = useAppStore()
const chatStore = useChatStore()

const collapsed = computed(() => appStore.siderCollapsed)
const currentChatHistory = computed(() => chatStore.getChatHistoryByCurrentActive)

const modelValue = props.modelName
const modelOptions = [
  {
    label: 'chatglm2-6b',
    value: 'chatglm2-6b',
    icon: chatglm,
  },
  {
    label: '通义千问',
    value: 'qwen-api',
    icon: qianwen,
  },
  {
    label: '讯飞星火',
    value: 'xinghuo-api',
    icon: spark,
  },
  {
    label: '百川大模型',
    value: 'baichuan2-7b',
    icon: baichuan,
  },
]

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
        size: 'small',
      }),
      h(
        'div',
        {
          style: {
            marginLeft: '12px',
            padding: '4px 0',
          },
        },
        [
          h('div', null, [option.label as string]),
          h(
            NText,
            { depth: 3, tag: 'div' },
            {
              default: () => 'description',
            },
          ),
        ],
      ),
    ],
  )
}

function handleUpdateCollapsed() {
  appStore.setSiderCollapsed(!collapsed.value)
}

function onScrollToTop() {
  const scrollRef = document.querySelector('#scrollRef')
  if (scrollRef)
    nextTick(() => scrollRef.scrollTop = 0)
}

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
  console.log(value)
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
      <div style="width: 65%;height: 100%;">
        <NSelect
          v-model:value="modelValue"
          :options="modelOptions"
          :render-label="renderLabel"
          :render-tag="renderSingleSelectTag"
          @on-update:value="getModel(modelValue)"
          style="--n-text-color: #ff0"
        />
      </div>
      <div style="width: 24%; margin-left: 15px;" class="flex items-center space-x-2">
        <!-- <HoverButton @click="toggleUsingContext"> -->
        <!-- <div @click="handleDeleteDebounce(chatId, $event)"> -->
        <NPopconfirm placement="bottom" @positive-click="handleDel">
          <template #trigger>
            <button class="p-1 text-xl text-[#956f4c] dark:text-white">
              <SvgIcon icon="ic:round-close" />
            </button>
          </template>
          {{ $t('chat.deleteModelConfirm') }}
        </NPopconfirm>
        <!-- <span style="cursor: pointer;" class="text-xl text-[#956f4c] dark:text-white">
            <SvgIcon icon="ic:round-close" />
          </span> -->
        <!-- </div> -->
        <!-- </HoverButton> -->
        <!-- <HoverButton @click="handleExport"> -->
        <div @click="handleAdd">
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
}
</style>
