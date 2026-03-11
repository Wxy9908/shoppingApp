# 漏洞与风险修复方案（v1 可执行版）

## 基础原则
- 计划最小粒度为“周”，统计口径也统一到“周”。
- 第一阶段优先保证数据正确与可持续使用，不做复杂智能推荐。

## 1. 数据一致性漏洞（必须本期落地）

### 1.1 新增数据模型
- `InventoryItem`
  - `id`
  - `ingredientNameNormalized`
  - `quantity`
  - `unit`（统一为 `g` 或 `ml`）
  - `updatedAt`
- `InventoryLog`
  - `id`
  - `ingredientNameNormalized`
  - `changeType`（`reserve`/`consume`/`rollback`）
  - `delta`
  - `unit`
  - `sourceType`（`shopping_item`/`manual`）
  - `sourceId`
  - `beforeQuantity`
  - `afterQuantity`
  - `createdAt`

### 1.2 行为约束
- 勾选“家里已有”时，只能通过 `InventoryLog` 写入扣减，不允许直接改库存值。
- 取消勾选时，必须生成反向 `rollback` 日志并回滚库存。
- 同一条清单项重复点击时，通过 `sourceId` 幂等控制，避免重复扣减。
- 购物项状态采用三态互斥：`pending`（待购买）/ `purchased`（已购买）/ `from_inventory`（冰箱已有）。
- `isFromInventory`、`isPurchased` 仅作为兼容字段，由 `purchaseStatus` 派生，禁止双写。

## 2. 食材合并规则不完整（必须本期落地）

### 2.1 单位标准
- 统一基准单位：固体 `g`，液体 `ml`。
- 清单展示可保留“个”，但计算时必须转为基准单位。

### 2.2 必备映射表
- `ingredientAliasMap`：别名归一（如 `西红柿` -> `番茄`）。
- `unitConvertMap`：单位换算（`kg -> g`，`L -> ml`）。
- `pieceToGramMap`：按食材定义“个 -> g”（如鸡蛋、土豆分别配置，禁止全局平均值）。

### 2.3 合并流程
- 先做别名归一 -> 再做单位换算 -> 最后按 `ingredientNameNormalized + baseUnit` 聚合。
- 手动新增食材时，若同名同单位已存在清单项，默认合并数量而非新建重复项。

## 3. 计划复制规则缺失（必须本期落地）

### 3.1 复制白名单（允许复制）
- `peopleCount`
- `days`
- `budget`
- `preferenceTags`
- 菜单结构字段：`date`、`mealType`、`dishName`、`servings`、`durationMinutes`、`difficulty`、`keyIngredients`、`steps`

### 3.2 重置字段（禁止继承）
- 计划状态：`status` 重置为 `draft`
- 购物执行态：`purchaseStatus` 重置为 `pending`（兼容字段 `isFromInventory`、`isPurchased` 重置为 `false`）
- 周复盘字段全部新建为空，不复制历史值

## 4. 预算约束未闭环（本期做最小闭环）
- 保留 `budget` 与 `actualCost` 两个字段。
- 增加“超预算提示”：
  - `actualCost > budget` 时在计划页和复盘页高亮提示。
- 本期不做价格预测和自动估价。

## 5. 单用户阶段数据丢失风险（必须本期落地）

### 5.1 存储策略
- 本地存储使用 IndexedDB（不使用 localStorage 作为主存储）。

### 5.2 备份策略（最小可行）
- 提供“导出 JSON”功能（手动触发）。
- 提供“导入 JSON”恢复功能（覆盖前需二次确认）。
- 每周复盘页提示用户执行一次备份。

## 6. 验证指标采集成本高（本期部分自动化）
- 自动采集：
  - `planningMinutes`（创建计划开始到保存）
  - `shoppingMinutes`（进入购物页到最后一次勾选）
  - `missedItemsCount`（用户标记漏买次数）
- 手动输入保留：
  - `wastedItemsCount`
  - `note`

## 7. 本期验收补充
- 反复勾选同一购物项，不会出现重复扣减库存。
- 复制上周计划后，新周采购状态全部重置。
- 导出文件可在新环境导入并恢复周计划、菜单、清单和库存。
- 食材别名与单位差异不影响清单合并结果。

## 8. 菜单生成来源未明确（新增）
- MVP 固定“模板库 + 手动替换”，避免把时间花在智能生成上。
- 前期提供 30~50 道高频家常菜模板，覆盖常见午/晚餐场景。

## 9. pieceToGramMap 维护成本（新增）
- 首版只覆盖高频 30~50 食材，超出范围直接提示“需手动确认单位”。
- 同时需要记录用户常用菜品，可将其标记为高频菜品，记录其中（作为用户画像的一点，后续迭代）

## 10. 预算字段仍偏弱闭环（新增）
- 在 Plan 或 WeeklyReview 明确加 actualCost，并定义超预算提示逻辑。

## 11. 导入恢复的冲突策略未写清（新增）
- v1 先只支持“全量覆盖恢复”，减少歧义。
- 恢复前自动导出当前数据快照，再执行覆盖恢复。
- 覆盖完成后给出“恢复成功”提示和恢复时间。

