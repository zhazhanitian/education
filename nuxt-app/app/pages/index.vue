<script setup lang="ts">
definePageMeta({ layout: 'default' })
useSeoMeta({ title: '教学成果奖申报平台 - 首页' })
useScrollReveal()
</script>

<template>
  <div>
    <HeroSection />
    <VideoSection />
    <AchievementSection />
    <StatsSection />
    <ModulesSection />
    <NewsSection />
  </div>
</template>
