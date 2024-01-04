import type { App } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHashHistory } from 'vue-router'
import { ChatLayout } from '@/views/chat/layout'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Root',
    component: ChatLayout,
    redirect: '/chat',
    children: [
      {
        path: '/chat',
        name: 'Chat',
        component: () => import('@/views/chat4/index.vue'),
      },
    ],
  },
  {
    path: '/knowledge',
    name: 'knowledge',
    component: ChatLayout,
    redirect: '/knowledge',
    children: [
      {
        path: '/knowledge/base',
        name: 'base',
        component: () => import('@/views/knowledge_base/home.vue'),
      },
    ],
  },
  {
    path: '/404',
    name: '404',
    component: () => import('@/views/exception/404/index.vue'),
  },

  {
    path: '/500',
    name: '500',
    component: () => import('@/views/exception/500/index.vue'),
  },

  {
    path: '/:pathMatch(.*)*',
    name: 'notFound',
    redirect: '/404',
  },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ left: 0, top: 0 }),
})

// setupPageGuard(router)

export async function setupRouter(app: App) {
  app.use(router)
  await router.isReady()
}
