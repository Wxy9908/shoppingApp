# 快速开始（1页速查）

## 1. 先读这 3 份（固定顺序）
1. `README.md`（入口与冲突优先级）
2. `03-process/plan.md`（任务与里程碑）
3. `02-architecture/bugFix.md`（数据正确性硬约束）

## 2. 文档编号速查
- `FEAT-*`：功能点（`01-product/demo.md`）
- `AC-*`：验收标准（`01-product/demo.md`）
- `FIX-*`：风险修复项（`02-architecture/bugFix.md`）
- `ITEM-*`：体验优化项（`02-architecture/fileCheck.md`）
- `M*`：里程碑（`03-process/plan.md` / `03-process/开发计划与验收SOP.md`）

## 3. 冲突时怎么判定（固定）
1. 数据正确性与可恢复性（`bugFix.md`）
2. 发布门禁与里程碑（`plan.md` / `SOP.md`）
3. 架构边界（`tech-architecture.md`）
4. 视觉与体验（`fileCheck.md`）
5. 原型细节（`01-product/*`）

## 4. 一键提问模板（开发）
```text
请基于 @weekly-prep-docs/README.md、@weekly-prep-docs/01-product/demo.md、@weekly-prep-docs/02-architecture/bugFix.md、@weekly-prep-docs/02-architecture/tech-architecture.md、@weekly-prep-docs/03-process/plan.md，
实现【模块名】的【功能点】。

要求：
- 必须满足 FEAT-___ 与 AC-___
- 必须遵守 FIX-___ 与 RULE-___
- 直接改代码，不只给建议

输出：
- 变更目标
- 影响文件列表
- 验收结果（逐条对应 AC）
- 风险与回滚策略
```

## 5. 一键提问模板（修复）
```text
请基于 @weekly-prep-docs/README.md、@weekly-prep-docs/02-architecture/bugFix.md、@weekly-prep-docs/03-process/开发计划与验收SOP.md，
修复【问题描述】并给出最小改动方案。

要求：
- 标注对应 FIX-ID 与 M-ID
- 说明幂等、回滚、导入恢复是否受影响
- 直接修改代码并给回归测试点
```

## 6. 一键提问模板（体验）
```text
请基于 @weekly-prep-docs/README.md、@weekly-prep-docs/02-architecture/fileCheck.md、@weekly-prep-docs/01-product/product-prototype-mobile.html，
优化【页面名】体验并对齐原型。

要求：
- 标注对应 ITEM-ID
- 优先复用统一样式，不散写重复样式
- 输出验收对照结果
```

## 7. 交付前自检（最少）
- [ ] 是否明确对应 FEAT/FIX/ITEM/AC/M 编号
- [ ] 是否覆盖 P0 规则
- [ ] 是否给出测试结果（至少主链路）
- [ ] 是否给出风险与回滚点
