<script lang="ts" setup>
import { computed, onMounted, onUnmounted, onUpdated, ref } from 'vue'
import { NCollapse, NCollapseItem } from 'naive-ui'
import MarkdownIt from 'markdown-it'
import mdKatex from '@traptitech/markdown-it-katex'
import mila from 'markdown-it-link-attributes'
import hljs from 'highlight.js'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { t } from '@/locales'
import { copyToClip } from '@/utils/copy'

interface Props {
  inversion?: boolean // 是否用户
  error?: boolean // 是否出错
  text?: string // 文本
  loading?: boolean
  asRawText?: boolean // 是否文本
  isKnowLedge?: boolean // 是否知识库对话
  source?: string[] // 知识库问答中的匹配结果来源 默认3条
}

const props = defineProps<Props>()

const { isMobile } = useBasicLayout()

const textRef = ref<HTMLElement>()

const mdi = new MarkdownIt({
  html: false,
  linkify: true,
  highlight(code, language) {
    const validLang = !!(language && hljs.getLanguage(language))
    if (validLang) {
      const lang = language ?? ''
      return highlightBlock(hljs.highlight(code, { language: lang }).value, lang)
    }
    return highlightBlock(hljs.highlightAuto(code).value, '')
  },
})

mdi.use(mila, { attrs: { target: '_blank', rel: 'noopener' } })
mdi.use(mdKatex, { blockClass: 'katexmath-block rounded-md p-[10px]', errorColor: ' #cc0000' })

const wrapClass = computed(() => {
  return [
    'text-wrap',
    'min-w-[20px]',
    'rounded-md',
    isMobile.value ? 'p-2' : 'py-2',
    // props.inversion ? '' : 'bg-[#fff]',
    props.inversion ? 'dark:bg-[#a1dc95]' : 'dark:bg-[#1e1e20]',
    props.inversion ? 'message-request' : 'message-reply',
    props.inversion ? 'text-user' : 'text-model',
    { 'text-red-500': props.error },
    { 'w-full': !props.inversion },
    { 'px-3': !props.inversion },
  ]
})

const text = computed(() => {
  const value = props.text ?? ''
  if (!props.asRawText)
    return mdi.render(value)
  return value
})

const result = computed(() => {
  const value = props.source ?? []
  const newVal: any[] = []
  if (!props.asRawText) {
    value.forEach((item) => {
      return newVal.push(mdi.render(item))
    })
  }
  return newVal
})

function highlightBlock(str: string, lang?: string) {
  return `<pre class="code-block-wrapper"><div class="code-block-header"><span class="code-block-header__lang">${lang}</span><span class="code-block-header__copy">${t('chat.copyCode')}</span></div><code class="hljs code-block-body ${lang}">${str}</code></pre>`
}

function addCopyEvents() {
  if (textRef.value) {
    const copyBtn = textRef.value.querySelectorAll('.code-block-header__copy')
    copyBtn.forEach((btn) => {
      btn.addEventListener('click', () => {
        const code = btn.parentElement?.nextElementSibling?.textContent
        if (code) {
          copyToClip(code).then(() => {
            btn.textContent = '复制成功'
            setTimeout(() => {
              btn.textContent = '复制代码'
            }, 1000)
          })
        }
      })
    })
  }
}

function removeCopyEvents() {
  if (textRef.value) {
    const copyBtn = textRef.value.querySelectorAll('.code-block-header__copy')
    copyBtn.forEach((btn) => {
      btn.removeEventListener('click', () => {})
    })
  }
}

onMounted(() => {
  addCopyEvents()
})

onUpdated(() => {
  addCopyEvents()
})

onUnmounted(() => {
  removeCopyEvents()
})
</script>

<template>
  <div class="text-black" :class="wrapClass">
    <div ref="textRef" class="leading-relaxed break-words">
      <div v-if="!inversion">
        <div v-if="!asRawText" class="markdown-body" v-html="text" />
        <div v-else class="whitespace-pre-wrap" v-text="text" />
      </div>
      <div v-else class="whitespace-pre-wrap" v-text="text" />
      <!-- <template> -->
      <span v-if="loading" class="dark:text-white w-[4px] h-[20px] block animate-blink" />
      <!-- </template> -->
    </div>
    <!-- 展示知识库对话的匹配结果 -->
    <div v-if="!inversion && isKnowLedge && source?.length" class="border_collapse">
      <NCollapse arrow-placement="right">
        <NCollapseItem title="知识库匹配结果" name="1">
          <div v-for="(item, index) in result" :key="index" class="flex flex-row items-center mb-4">
            <div v-if="!asRawText" class="markdown-body" v-html="item" />
          </div>
        </NCollapseItem>
      </NCollapse>
    </div>
  </div>
</template>

<style lang="less">
@import url(./style.less);
</style>
