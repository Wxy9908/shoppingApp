# 技术架构文档（AI执行版）

## 文档元信息
- 文档版本：V2
- 适用阶段：MVP 本地模式优先（阶段 A）
- 对齐文档：`plan.md`、`bugFix.md`、`fileCheck.md`、`demo.md`、`开发计划与验收SOP.md`
- 架构目标：在 2 周内可交付、4 周内可验证、后续可平滑服务化

## 1. 架构原则
- 数据正确性优先于展示层优化。
- 业务规则集中在服务层与规则层，不散落在页面层。
- 所有关键状态变更必须可追踪、可回滚、可恢复。
- 先做单用户本地稳定，再考虑后端服务化。

## 2. 技术栈决策（ADR）
- `ADR-001` 前端：`Vue 3 + JavaScript + Vite`
- `ADR-002` 状态管理：`Pinia`
- `ADR-003` 路由：`Vue Router`
- `ADR-004` UI：`Vant + 项目统一样式层`
- `ADR-005` 存储：`IndexedDB`（`Dexie` 封装）
- `ADR-006` 测试：`Vitest + Playwright`
- `ADR-007` 后端阶段 B：`Fastify + JavaScript`（先 SQLite，后续按需 PostgreSQL）

## 3. 逻辑分层与职责

### 3.1 分层定义
- `UI Layer`：页面与组件，只处理展示、交互、用户反馈
- `App Service Layer`：编排业务流程（计划、菜单、清单、库存、备份、复盘）
- `Rule Engine Layer`：别名、换算、映射、复制白名单等纯规则
- `Repository Layer`：数据读写抽象（本地/服务化统一接口）
- `Infra Layer`：Dexie、表定义、导入导出、日志采集

### 3.2 禁止事项
- 页面层禁止直接访问数据库。
- 页面层禁止重复实现规则引擎逻辑。
- 兼容字段禁止业务双写（由标准字段派生）。

## 4. 建议目录结构
```txt
src/
  app/
    router/
    store/
    constants/
  modules/
    plan/
    menu/
    shopping/
    inventory/
    review/
    backup/
  shared/
    rules/
      ingredientAliasMap.ts
      unitConvertMap.ts
      pieceToGramMap.ts
    utils/
  infra/
    db/
      dexie.ts
      tables.ts
    backup/
```

## 5. 数据模型（统一口径）
- `Plan`
- `MealItem`
- `ShoppingItem`
- `InventoryItem`
- `InventoryLog`
- `WeeklyReview`

> 字段明细以 `bugFix.md` 与 `demo.md` 为主；此文档定义行为和约束。

## 6. 核心规则与状态机

### 6.1 清单聚合规则
- 顺序固定：`alias -> unitConvert -> pieceToBaseUnit -> aggregate`
- 聚合键：`ingredientNameNormalized + baseUnit`
- 映射缺失时：标记 `needsManualConfirm=true` 并提示用户确认

### 6.2 库存幂等与回滚
- 勾选“家里已有”：
  - 先按 `sourceId` 查重
  - 未处理过才执行扣减并写 `InventoryLog`
- 取消勾选：
  - 查找同 `sourceId` 有效日志
  - 写反向 `rollback` 日志并回滚库存

### 6.3 购物状态机
- 状态：`pending` / `purchased` / `from_inventory`（互斥）
- 关键迁移：
  - `pending -> purchased`：仅采购状态变更
  - `pending -> from_inventory`：触发库存扣减与日志
  - `from_inventory -> pending`：触发库存回滚与日志
  - `purchased -> pending`：仅采购状态回退
- `isFromInventory` / `isPurchased` 为派生兼容字段，不可双写

### 6.4 周复制规则
- 白名单复制：计划配置与菜单结构字段
- 重置字段：执行态与复盘字段
- 失败策略：复制失败不落库

## 7. 模块契约（Service 接口）
- `PlanService`：创建计划、读取计划、复制周计划
- `MenuService`：生成菜单、替换菜单、删除菜单项
- `ShoppingService`：生成清单、手动新增、状态切换
- `InventoryService`：库存扣减、回滚、幂等校验
- `BackupService`：导出、导入、快照、恢复提示
- `ReviewService`：写入复盘与指标汇总

## 8. 错误处理与恢复策略
- `ERR-001` 规则映射缺失：提示手动确认，不静默合并
- `ERR-002` 幂等冲突：阻断重复扣减并提示状态已处理
- `ERR-003` 导入失败：回退导入前自动快照
- `ERR-004` 数据不一致：阻断发布并进入 P0 修复

## 9. 非功能要求（NFR）
- 首屏可交互时间：< 2s（本地数据场景）
- 清单生成耗时：< 500ms（30~50 菜单规模）
- 导入导出耗时：< 3s（单用户数据量）
- 关键操作可追踪：库存、导入、复制必须有日志痕迹

## 10. 测试策略与门禁

### 10.1 单元测试（必须）
- 规则引擎：别名/单位/个转基准单位
- 库存服务：幂等、回滚、异常分支
- 状态机：三态互斥与迁移
- 复制规则：白名单与重置逻辑

### 10.2 集成测试（必须）
- 菜单生成 -> 清单生成 -> 库存扣减 -> 采购切换 -> 复制下周
- 导出 -> 清空 -> 导入 -> 核心数据一致性校验

### 10.3 E2E（最低要求）
- 至少 1 条主链路通过：
  - 创建计划 -> 菜单 -> 清单 -> 库存 -> 采购 -> 复制下周

## 11. 阶段化演进路线

### 阶段 A（当前）
- 纯前端本地模式（IndexedDB + JSON 备份恢复）
- 验证核心流程与指标有效性

### 阶段 B（后续）
- Repository 替换为 API 适配层
- 引入 `Fastify + JavaScript` 服务化
- 增加账号与多设备同步能力

## 12. AI执行指令
- 所有实现任务先检查是否触发 `bugFix.md` 的 P0 规则。
- 实现顺序：`数据正确性 -> 状态一致性 -> 恢复能力 -> 体验优化`
- 每次变更必须附：
  - 影响模块
  - 对应规则编号
  - 测试证据
  - 回滚策略
