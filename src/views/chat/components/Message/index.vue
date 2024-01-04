<script setup lang='ts'>
import { computed, ref } from 'vue'
import { NDropdown, useMessage } from 'naive-ui'
import AvatarComponent from './Avatar.vue'
import TextComponent from './Text.vue'
import { SvgIcon } from '@/components/common'
import { useIconRender } from '@/hooks/useIconRender'
import { t } from '@/locales'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { copyToClip } from '@/utils/copy'

interface Props {
  dateTime?: string
  text?: string
  inversion?: boolean
  error?: boolean
  loading?: boolean
  knowledge?: boolean
  source?: string[]
  image?: string
}

interface Emit {
  (ev: 'regenerate'): void
  (ev: 'delete'): void
}

const props = defineProps<Props>()

const emit = defineEmits<Emit>()

const { isMobile } = useBasicLayout()

const { iconRender } = useIconRender()

const message = useMessage()

const textRef = ref<HTMLElement>()

const asRawText = ref(props.inversion)

const messageRef = ref<HTMLElement>()

const options = computed(() => {
  const common = [
    {
      label: t('chat.copy'),
      key: 'copyText',
      icon: iconRender({ icon: 'ri:file-copy-2-line' }),
    },
    {
      label: t('common.delete'),
      key: 'delete',
      icon: iconRender({ icon: 'ri:delete-bin-line' }),
    },
  ]

  if (!props.inversion) {
    common.unshift({
      label: asRawText.value ? t('chat.preview') : t('chat.showRawText'),
      key: 'toggleRenderType',
      icon: iconRender({ icon: asRawText.value ? 'ic:outline-code-off' : 'ic:outline-code' }),
    })
  }

  return common
})
// 对话下more更多功能
function handleSelect(key: 'copyText' | 'delete' | 'toggleRenderType') {
  switch (key) {
    case 'copyText':
      handleCopy()
      return
    case 'toggleRenderType':
      asRawText.value = !asRawText.value
      return
    case 'delete':
      emit('delete')
  }
}
// 重新生成
function handleRegenerate() {
  messageRef.value?.scrollIntoView()
  emit('regenerate')
}

async function handleCopy() {
  try {
    await copyToClip(props.text || '')
    message.success('复制成功')
  }
  catch {
    message.error('复制失败')
  }
}
</script>

<template>
  <div
    ref="messageRef"
    class="flex w-full mb-6 overflow-hidden"
  >
    <!-- flex-row-reverse -->
    <div
      class="flex items-center justify-center flex-shrink-0 h-8 overflow-hidden rounded-full basis-8 mr-2"
    >
      <!-- 头像模块 -->
      <AvatarComponent :image="inversion" :customed="image" />
    </div>
    <div class="overflow-hidden text-sm w-full items-start">
      <!-- <p class="text-xs text-[#b4bbc4]" :class="[inversion ? 'text-right' : 'text-left']">
        {{ dateTime }}
      </p> -->
      <div
        class="flex items-end gap-1"
      >
        <!-- 对话内容 -->
        <TextComponent
          ref="textRef"
          :inversion="inversion"
          :error="error"
          :text="text"
          :loading="loading"
          :as-raw-text="asRawText"
          :is-know-ledge="knowledge"
          :source="source"
        />
        <!-- <div class="flex flex-col">
          <button
            v-if="!inversion"
            class="mb-2 transition text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-300"
            @click="handleRegenerate"
          >
            <SvgIcon icon="ri:restart-line" />
          </button>
          <NDropdown
            :trigger="isMobile ? 'click' : 'hover'"
            :placement="!inversion ? 'right' : 'left'"
            :options="options"
            @select="handleSelect"
          >
            <button class="transition text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-200">
              <SvgIcon icon="ri:more-2-fill" />
            </button>
          </NDropdown>
        </div> -->
      </div>
      <div v-if="!inversion " class="flex items-center justify-left cursor-pointer mt-1 ml-3" @click="handleRegenerate">
        <SvgIcon icon="lucide:rotate-ccw" class="text-[#ABA494] font-bold" />
        <button class="text-xs text-[#ABA494] font-sans font-bold">
          重新生成
        </button>
      </div>
    </div>
  </div>
</template>
