<template>
  <div class="app-shell">
    <header class="app-header">
      <h1 class="brand">{{ PRODUCT_NAME }}</h1>
      <p class="slogan">每周快速备菜</p>
    </header>

    <main class="page-content" aria-label="应用主内容区域">
      <RouterView />
    </main>

    <van-tabbar route safe-area-inset-bottom>
      <van-tabbar-item to="/home">
        <span>首页</span>
        <template #icon>
          <div class="tab-icon icon-home"></div>
        </template>
      </van-tabbar-item>
      <van-tabbar-item to="/plan">
        <span>计划</span>
        <template #icon>
          <div class="tab-icon icon-plan"></div>
        </template>
      </van-tabbar-item>
      <van-tabbar-item to="/menu">
        <span>菜单</span>
        <template #icon>
          <div class="tab-icon icon-menu"></div>
        </template>
      </van-tabbar-item>
      <van-tabbar-item to="/shopping">
        <span>清单</span>
        <template #icon>
          <div class="tab-icon icon-shopping"></div>
        </template>
      </van-tabbar-item>
      <van-tabbar-item to="/review">
        <span>复盘</span>
        <template #icon>
          <div class="tab-icon icon-review"></div>
        </template>
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script>
import { PRODUCT_NAME } from './app/constants/brand'

export default {
  name: 'AppRoot',
  data() {
    return {
      PRODUCT_NAME,
    }
  },
}
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  max-width: var(--prep-page-max-width);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
}

.app-header {
  padding: 56px 24px 16px;
  background: #fff;
  border-bottom: 1px solid var(--prep-line);
}

.brand {
  margin: 0;
  color: var(--prep-text);
  font-size: var(--prep-font-2xl);
  font-weight: 600;
  letter-spacing: -0.3px;
}

.slogan {
  margin: 4px 0 0;
  color: var(--prep-text-muted);
  font-size: var(--prep-font-sm);
  font-weight: 400;
}

.page-content {
  flex: 1;
  padding: 20px 20px calc(90px + var(--prep-safe-bottom));
}
</style>
