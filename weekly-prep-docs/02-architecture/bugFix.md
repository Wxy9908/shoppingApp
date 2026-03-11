# 漏洞与风险修复清单（AI执行版）

## 文档元信息
- 文档版本：V2
- 适用范围：前端 MVP（本地数据模式）
- 执行周期：当前迭代（P0 必须落地）
- 统计口径：按“周”统一

## 全局策略
- 优先级顺序：`P0 -> P1 -> P2`
- 第一阶段目标：先保证正确性、可恢复、可追踪，不做复杂智能化能力。
- AI 执行输出要求：每个条目必须输出 `改造方案`、`文件清单`、`验收结果`、`风险说明`。

## 统一数据约束（必须遵守）

### 数据模型
- `InventoryItem`
  - `id`
  - `ingredientNameNormalized`
  - `quantity`
  - `unit`（基准单位：`g` / `ml`）
  - `updatedAt`
- `InventoryLog`
  - `id`
  - `ingredientNameNormalized`
  - `changeType`（`reserve` / `consume` / `rollback`）
  - `delta`
  - `unit`
  - `sourceType`（`shopping_item` / `manual`）
  - `sourceId`
  - `beforeQuantity`
  - `afterQuantity`
  - `createdAt`

### 状态约束
- 购物项状态统一为 `purchaseStatus`：`pending` / `purchased` / `from_inventory`（互斥）。
- `isFromInventory`、`isPurchased` 仅作为兼容派生字段，禁止业务双写。

---

## 修复项列表（结构化）

### FIX-001 库存变更不一致
- 优先级：P0
- 问题：
  - 勾选和反勾选“家里已有”时，存在重复扣减或回滚缺失风险。
- 处理规则：
  - 只能通过 `InventoryLog` 驱动库存变化，禁止直接改库存值。
  - 取消勾选必须写 `rollback` 日志并恢复库存。
  - 通过 `sourceId` 做幂等，重复点击不重复扣减。
- 验收标准：
  - 同一清单项连续勾选/取消多次后，库存数值正确且日志可追踪。

### FIX-002 清单聚合规则不完整
- 优先级：P0
- 问题：
  - 别名、单位、数量口径不一致导致合并错误。
- 处理规则：
  - 统一基准单位：固体 `g`、液体 `ml`。
  - 合并顺序固定：别名归一 -> 单位换算 -> 个转克/毫升 -> 聚合。
  - 手动新增食材时，同名同单位默认合并数量。
- 依赖映射：
  - `ingredientAliasMap`（别名归一）
  - `unitConvertMap`（单位换算）
  - `pieceToGramMap`（按食材定义个转克，不允许全局平均）
- 验收标准：
  - 别名和不同单位输入不影响最终合并正确性。

### FIX-003 周计划复制规则缺失
- 优先级：P0
- 问题：
  - 复制上周计划时，执行态字段可能被错误继承。
- 允许复制字段（白名单）：
  - `peopleCount`、`days`、`budget`、`preferenceTags`
  - 菜单字段：`date`、`mealType`、`dishName`、`servings`、`durationMinutes`、`difficulty`、`keyIngredients`、`steps`
- 禁止继承字段（复制后重置）：
  - `status` -> `draft`
  - `purchaseStatus` -> `pending`
  - `isFromInventory` / `isPurchased` -> `false`
  - 周复盘字段全部置空重建
- 验收标准：
  - 复制后新周执行态全部重置，结构字段正确保留。

### FIX-004 预算闭环不足
- 优先级：P1
- 问题：
  - 预算字段存在但无明确执行反馈。
- 处理规则：
  - 保留 `budget` 与 `actualCost`。
  - `actualCost > budget` 时，在计划页与复盘页高亮提示。
- 范围限制：
  - 本期不做自动估价与价格预测。
- 验收标准：
  - 超预算状态可被清晰识别与回看。

### FIX-005 数据丢失恢复机制不足
- 优先级：P0
- 问题：
  - 单用户本地模式下存在误删、设备切换导致的数据丢失风险。
- 处理规则：
  - IndexedDB 作为主存储（非 localStorage）。
  - 支持 JSON 导出（手动）与 JSON 导入恢复（全量覆盖）。
  - 导入前自动导出当前快照，执行覆盖前二次确认。
  - 导入完成后提示“恢复成功 + 恢复时间”。
- 验收标准：
  - 可在新环境导入并恢复计划、菜单、清单、库存核心数据。

### FIX-006 指标采集成本高
- 优先级：P1
- 问题：
  - 关键效果指标依赖人工记录，成本高且不稳定。
- 自动采集：
  - `planningMinutes`
  - `shoppingMinutes`
  - `missedItemsCount`
- 手动输入保留：
  - `wastedItemsCount`
  - `note`
- 验收标准：
  - 每周复盘可自动回填关键耗时与漏买指标。

### FIX-007 菜单来源策略不清
- 优先级：P1
- 处理规则：
  - MVP 固定“模板库 + 手动替换”。
  - 首版模板覆盖 30~50 道高频家常菜。
- 验收标准：
  - 用户可在不依赖智能推荐的情况下完成全链路。

### FIX-008 pieceToGramMap 成本控制
- 优先级：P1
- 处理规则：
  - 首版仅维护 30~50 高频食材映射。
  - 超出范围统一提示“需手动确认单位”。
  - 记录用户高频菜品，作为后续扩展依据。
- 验收标准：
  - 超范围食材不再静默误算，必须有提示。

---

## 本期发布门禁（Release Gate）
- P0 项全部完成且通过验收。
- 以下场景必须通过：
  - 同项重复勾选无重复扣减。
  - 复制周计划后执行态完全重置。
  - 导入恢复可用且有前置快照。
  - 别名和单位差异不影响聚合准确性。

## AI执行顺序建议
1. 先落地 `FIX-001` 和 `FIX-002`（数据正确性底座）。
2. 再处理 `FIX-003` 和 `FIX-005`（可复用与可恢复）。
3. 最后处理 `FIX-004`、`FIX-006`、`FIX-007`、`FIX-008`（体验增强）。

