# 周备有谱（weekly-prep-hub）前端

`周备有谱` 是一个面向移动端的每周备菜助手。  
当前前端聚焦两类核心能力：

- 备菜执行：计划、菜单、购物清单、库存四个业务页面
- 文档查看：可从前端项目快速跳转到产品文档中心

## 功能模块

- 计划页：管理每周/每日备菜与做饭安排
- 菜单页：查看和维护菜品项
- 购物清单页：管理待购买食材
- 库存页：管理家中食材库存状态
- 底部导航：通过 TabBar 在四个核心模块间切换

路由入口与页面映射见：

- `src/app/router/index.js`

## 技术栈

- 核心框架：`Vue 3`
- 构建工具：`Vite`
- 路由：`vue-router`
- 状态管理：`Pinia`
- UI 组件：`Vant`
- 本地数据库：`Dexie`（IndexedDB）
- 数据校验：`zod`
- 代码规范：`ESLint` + `Prettier`
- 测试：`Vitest` + `Playwright`

## 启动方式

在 `frontend` 目录执行：

```bash
pnpm install
pnpm dev
```

默认本地开发地址（Vite）：

- `http://localhost:5173`

## 常用命令

```bash
pnpm build
pnpm preview
pnpm lint
pnpm format
pnpm format:write
pnpm test
pnpm test:watch
pnpm test:e2e
```

## 产品文档入口

- `../weekly-prep-docs/README.md`
