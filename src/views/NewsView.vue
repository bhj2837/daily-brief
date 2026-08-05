<script setup>
// ===== 뉴스 목록 =====
// 탭: 테크(Hacker News) · 우주/과학(Spaceflight News) · 종합(GNews/Mock).
// 강의 8장 Element Plus(el-tabs, el-empty, el-result) + 로딩/에러/빈 상태 처리.
// 조판: 신문 섹션면처럼 굵은 섹션 룰 아래 기사가 괘선으로 구분되어 쌓인다.
import { computed, onMounted, ref, watch } from 'vue'
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

const activeTab = computed(() => TABS.find((t) => t.name === active.value))
const reload = () => load(active.value)
watch(active, reload)
onMounted(reload)
</script>

<template>
  <div class="news">
    <SectionHeader kicker="News" title="뉴스" size="lg" :sub="activeTab?.desc">
      <template #action>
        <SourceBadge v-if="!isLoading && !error" :source="source || 'mock'" />
      </template>
    </SectionHeader>

    <!-- 섹션 탭 -->
    <el-tabs v-model="active" class="tabs">
      <el-tab-pane v-for="t in TABS" :key="t.name" :name="t.name">
        <template #label>
          <span class="tab-label">
            <span class="tl-ko">{{ t.label }}</span>
            <em class="tl-en">{{ t.desc }}</em>
          </span>
        </template>
      </el-tab-pane>
    </el-tabs>

    <!-- 로딩 -->
    <div v-if="isLoading" class="list">
      <div v-for="n in 8" :key="n" class="skel-row">
        <SkeletonBlock width="76px" height="11px" radius="2px" />
        <SkeletonBlock height="18px" :lines="2" />
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
        v-reveal="{ index: i }"
        :article="a"
        :rank="active === 'tech' ? i + 1 : 0"
      />
    </div>
  </div>
</template>

<style scoped>
.news {
  display: grid;
  gap: 4px;
}
.list {
  display: grid;
  border-top: var(--rule-thin) solid var(--border);
}
.skel-row {
  display: grid;
  gap: 9px;
  padding: var(--sp-4) 0;
  border-bottom: var(--rule-thin) solid var(--border);
}

/* ===== 섹션 탭 (Element Plus 톤 재조판) ===== */
.tabs {
  margin-bottom: 2px;
}
.tab-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 2px 4px;
}
.tl-ko {
  font-family: var(--font-serif);
  font-size: 17px;
  font-weight: 700;
  line-height: 1.2;
}
.tl-en {
  font-style: normal;
  font-family: var(--font-sans);
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: var(--ink-faint);
  line-height: 1;
  transition: color var(--dur-fast) var(--ease);
}

:deep(.el-tabs__header) {
  margin-bottom: 10px;
}
:deep(.el-tabs__nav-wrap::after) {
  height: var(--rule-thin);
  background-color: var(--border-strong);
}
:deep(.el-tabs__item) {
  height: auto;
  padding: 10px 20px !important;
  color: var(--ink-sub);
}
:deep(.el-tabs__item:hover) {
  color: var(--ink);
}
:deep(.el-tabs__item.is-active) {
  color: var(--ink);
}
:deep(.el-tabs__item.is-active) .tl-en {
  color: var(--accent);
}
:deep(.el-tabs__active-bar) {
  height: var(--rule-med);
  background-color: var(--accent);
}

@media (max-width: 560px) {
  :deep(.el-tabs__item) {
    padding: 9px 12px !important;
  }
  .tl-ko {
    font-size: 15px;
  }
  .tl-en {
    display: none;
  }
}
</style>
