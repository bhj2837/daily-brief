<script setup>
// ===== 뉴스 목록 =====
// 탭: 테크(Hacker News) · 우주/과학(Spaceflight News) · 종합(Mock).
// 강의 8장 Element Plus(el-tabs, el-empty) + 로딩/에러/빈 상태 처리.
import { onMounted, ref, watch } from 'vue'
import { useNews } from '@/composables/useNews'
import SectionHeader from '@/components/common/SectionHeader.vue'
import SourceBadge from '@/components/common/SourceBadge.vue'
import SkeletonBlock from '@/components/common/SkeletonBlock.vue'
import NewsCard from '@/components/news/NewsCard.vue'

const TABS = [
  { name: 'tech', label: '테크', desc: 'Hacker News' },
  { name: 'space', label: '우주·과학', desc: 'Spaceflight News' },
  { name: 'general', label: '종합', desc: '종합뉴스' },
]

const active = ref('tech')
const { articles, isLoading, error, source, load } = useNews()

const reload = () => load(active.value)
watch(active, reload)
onMounted(reload)
</script>

<template>
  <div class="news">
    <SectionHeader kicker="News" title="뉴스">
      <template #action>
        <SourceBadge v-if="!isLoading && !error" :source="source || 'mock'" />
      </template>
    </SectionHeader>

    <el-tabs v-model="active" class="tabs">
      <el-tab-pane v-for="t in TABS" :key="t.name" :name="t.name">
        <template #label>
          <span class="tab-label">{{ t.label }}<em>{{ t.desc }}</em></span>
        </template>
      </el-tab-pane>
    </el-tabs>

    <!-- 로딩 -->
    <div v-if="isLoading" class="list">
      <div v-for="n in 8" :key="n" class="skel-row">
        <div class="sk-body">
          <SkeletonBlock width="80px" height="12px" radius="4px" />
          <SkeletonBlock height="18px" :lines="2" />
        </div>
      </div>
    </div>

    <!-- 에러 -->
    <el-result
      v-else-if="error"
      icon="warning"
      title="뉴스를 불러오지 못했습니다"
      :sub-title="error"
    >
      <template #extra>
        <el-button type="primary" round @click="reload">다시 시도</el-button>
      </template>
    </el-result>

    <!-- 빈 상태 -->
    <el-empty v-else-if="!articles.length" description="표시할 기사가 없습니다" />

    <!-- 목록 -->
    <div v-else class="list">
      <NewsCard
        v-for="(a, i) in articles"
        :key="a.id"
        :article="a"
        :rank="active === 'tech' ? i + 1 : 0"
      />
    </div>
  </div>
</template>

<style scoped>
.news {
  display: grid;
  gap: 6px;
}
.tabs {
  margin-bottom: 6px;
}
.tab-label {
  display: inline-flex;
  align-items: baseline;
  gap: 7px;
  font-weight: 700;
}
.tab-label em {
  font-style: normal;
  font-size: 11px;
  font-weight: 600;
  color: var(--ink-mute);
}
.list {
  display: grid;
}
.skel-row {
  padding: 16px 0;
  border-bottom: 1px solid var(--border);
}
.sk-body {
  display: grid;
  gap: 8px;
}
:deep(.el-tabs__item) {
  font-size: 15px;
}
:deep(.el-tabs__active-bar) {
  background-color: var(--accent);
}
</style>
