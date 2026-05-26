<script setup lang="ts">
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: { lang: 'zh-CN' }
})

useSeoMeta({
  title: '教学成果奖申报平台',
  description: '高校教学成果奖申报展示平台，汇聚成果申报、人才培养、产业合作等多维度内容',
  ogTitle: '教学成果奖申报平台',
  ogDescription: '高校教学成果奖申报展示平台'
})
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
