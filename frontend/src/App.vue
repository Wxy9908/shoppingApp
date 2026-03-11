<template>
  <div class="app-shell">
    <main class="page-content" aria-label="应用主内容区域">
      <RouterView />
    </main>

    <van-tabbar route>
      <van-tabbar-item to="/plan" icon="calendar-o">计划</van-tabbar-item>
      <van-tabbar-item to="/menu" icon="notes-o">菜单</van-tabbar-item>
      <van-tabbar-item to="/shopping" icon="shopping-cart-o">清单</van-tabbar-item>
      <van-tabbar-item to="/inventory" icon="shop-o">库存</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script>
export default {
  name: 'AppRoot',
}
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  background: #f7f8fa;
}

.page-content {
  padding: 16px 12px 70px;
}
</style>
