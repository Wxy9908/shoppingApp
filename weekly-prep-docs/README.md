# 文档总索引（AI执行导航版）

## 文档目标
- 本目录用于统一收纳“产品定义、技术规则、执行流程、AI协作”文档。
- 本 README 作为 AI 首入口：定义读取顺序、优先级、冲突处理、执行输出格式。
- 快速入口：`./00-quick-start.md`（1页速查与可复制模板）

## 1. 核心文档清单

### 1.1 产品与原型
- `./01-product/demo.md`：产品演示与功能范围说明
- `./01-product/product-prototype-mobile.html`：移动端视觉基线（优先）
- `./01-product/product-prototype.html`：桌面端原型参考

### 1.2 架构与规则
- `./02-architecture/tech-architecture.md`：技术架构与分层约束
- `./02-architecture/bugFix.md`：漏洞与风险修复清单（AI执行版）
- `./02-architecture/fileCheck.md`：前端体验与视觉优化清单（AI执行版）

### 1.3 计划与验收
- `./03-process/plan.md`：整体计划、里程碑、门禁与验收模板（AI执行版）
- `./03-process/开发计划与验收SOP.md`：开发执行与验收 SOP

### 1.4 AI 协作资料
- `./04-prompts/model-prompts-playbook.md`：提示词模板与协作实践

## 2. AI 推荐读取顺序（固定）
1. 先读 `README.md`（明确执行入口和规则）
2. 再读 `03-process/plan.md`（范围、优先级、里程碑）
3. 再读 `02-architecture/bugFix.md`（数据正确性与风险规则）
4. 再读 `02-architecture/fileCheck.md`（体验与样式目标）
5. 再读 `02-architecture/tech-architecture.md`（实现边界与分层）
6. 最后参考 `01-product/demo.md` 与原型文件（交互和视觉对齐）

## 3. 冲突优先级（必须遵守）
- 同一问题有冲突时，按以下优先级决策：
  1) 数据正确性与可恢复性（`bugFix.md`）
  2) 发布门禁与里程碑（`plan.md`）
  3) 架构边界（`tech-architecture.md`）
  4) 视觉一致性与体验（`fileCheck.md`）
  5) 原型细节（`01-product/*`）
- 若仍无法决策，默认选择“可维护 + 可回滚 + 最小范围改动”方案。

## 4. AI 标准执行流程
1. 明确任务归属模块（计划/菜单/清单/库存/复盘）。
2. 从 `plan.md` 提取对应任务包与验收标准。
3. 对照 `bugFix.md` 校验是否触发数据一致性规则。
4. 对照 `fileCheck.md` 校验是否触发体验与样式规范。
5. 按 `tech-architecture.md` 约束落地实现。
6. 输出变更结果：文件清单、核心逻辑、测试结果、风险与回滚点。

## 5. AI 输出格式要求（建议固定）
- 变更目标
- 影响文件列表
- 关键实现点
- 验收对照结果（逐条对应）
- 风险与回滚策略

## 6. 目录规范
- `01-product/`：原型、演示、PRD
- `02-architecture/`：架构、设计决策、风险修复、体验规范
- `03-process/`：计划、里程碑、SOP、验收清单
- `04-prompts/`：AI 提示词、模板、协作实践

## 7. 发起任务的推荐提问模板

### 模板 A（功能开发）
`请基于 @weekly-prep-docs/README.md、@weekly-prep-docs/03-process/plan.md、@weekly-prep-docs/02-architecture/bugFix.md 实现【模块名】的【功能点】，并按“变更目标/文件清单/验收结果/风险回滚”格式输出。`

### 模板 B（体验优化）
`请基于 @weekly-prep-docs/README.md、@weekly-prep-docs/02-architecture/fileCheck.md、@weekly-prep-docs/01-product/product-prototype-mobile.html 对【页面名】做体验优化，要求视觉风格与移动端原型对齐。`

### 模板 C（缺陷修复）
`请基于 @weekly-prep-docs/README.md、@weekly-prep-docs/02-architecture/bugFix.md 修复【问题描述】，并验证幂等、回滚、导入恢复相关门禁。`
