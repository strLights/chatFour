<script lang="ts" setup>
import { computed, nextTick } from 'vue'
import { HoverButton, SvgIcon } from '@/components/common'
import { useAppStore, useChatStore } from '@/store'
import { NAvatar } from 'naive-ui'

interface Props {
  usingContext: boolean
  modelName: string
  modelIcon: string
}

interface Emit {
  (ev: 'export'): void
  (ev: 'toggleUsingContext'): void
}

defineProps<Props>()

const emit = defineEmits<Emit>()

const appStore = useAppStore()
const chatStore = useChatStore()

const collapsed = computed(() => appStore.siderCollapsed)
const currentChatHistory = computed(() => chatStore.getChatHistoryByCurrentActive)

function handleUpdateCollapsed() {
  appStore.setSiderCollapsed(!collapsed.value)
}

function onScrollToTop() {
  const scrollRef = document.querySelector('#scrollRef')
  if (scrollRef)
    nextTick(() => scrollRef.scrollTop = 0)
}

function handleExport() {
  emit('export')
}

function toggleUsingContext() {
  emit('toggleUsingContext')
}
</script>

<template>
  <header
    class="model_top sticky top-0 left-0 right-0 z-30 dark:border-neutral-800 bg-white/80 dark:bg-black/20 backdrop-blur">
    <div class="pl-4 relative flex items-center justify-between min-w-0 overflow-hidden h-14">
      <div class="flex items-center">
        <button class="flex items-center justify-center" @click="handleUpdateCollapsed">
          <!-- <SvgIcon v-if="collapsed" class="text-2xl" icon="ri:align-justify" />
          <SvgIcon v-else class="text-2xl" icon="ri:align-right" /> -->
          <NAvatar :src="modelIcon" style="background-color: rgba(0, 0, 0, 0); border-radius: 50%;" />
        </button>
      </div>
      <h1
        class="model_name flex-1 pl-2 pr-6 overflow-hidden cursor-pointer select-none text-ellipsis whitespace-nowrap"
        @dblclick="onScrollToTop"
      >
        {{ modelName }}
      </h1>
      <!-- <div class="flex items-center space-x-2">
        <HoverButton @click="toggleUsingContext">
          <span class="text-xl" :class="{ 'text-[#4b9e5f]': usingContext, 'text-[#a8071a]': !usingContext }">
            <SvgIcon icon="ri:chat-history-line" />
          </span>
        </HoverButton>
        <HoverButton @click="handleExport">
          <span class="text-xl text-[#4f555e] dark:text-white">
            <SvgIcon icon="ri:download-2-line" />
          </span>
        </HoverButton>
      </div> -->
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
}
</style>
