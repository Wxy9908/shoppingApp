# AI 提示词手册（AI执行版）

## 文档元信息
- 文档版本：V2
- 目标：让 AI 在本项目中稳定执行“开发/修复/优化/验收”
- 对齐文档：`README.md`、`demo.md`、`tech-architecture.md`、`bugFix.md`、`fileCheck.md`、`plan.md`、`开发计划与验收SOP.md`

## 1. 固定使用规则
- 每次提问必须显式引用 `README.md` + 至少 2 个目标文档。
- 需求描述必须包含：目标、范围、约束、输出格式、验收标准。
- 让 AI 直接修改文件，不要只给建议。
- 输出必须包含：影响文件、变更原因、验收对照、风险回滚。

## 2. 文档编号速查（统一引用）
- 产品功能：`FEAT-*`（见 `demo.md`）
- 风险修复：`FIX-*`（见 `bugFix.md`）
- 体验优化：`ITEM-*`（见 `fileCheck.md`）
- 验收标准：`AC-*`（见 `demo.md`）
- 里程碑：`M*`（见 `plan.md` / `SOP.md`）

## 3. 通用提问骨架（建议固定）
```text
【目标】
要达成什么业务结果？

【范围】
涉及哪个模块和页面？本次不做什么？

【约束】
技术栈、时间、兼容性、数据规则限制是什么？

【参考文档】
@weekly-prep-docs/README.md
@weekly-prep-docs/01-product/demo.md
@weekly-prep-docs/02-architecture/bugFix.md
@weekly-prep-docs/02-architecture/tech-architecture.md
@weekly-prep-docs/03-process/plan.md

【输出要求】
1) 直接改代码
2) 按“变更目标/文件清单/验收结果/风险回滚”输出
3) 对应标注 FEAT/FIX/ITEM/AC 编号
```

## 4. 场景模板（可直接复制）

### 4.1 功能开发模板
```text
请基于 @weekly-prep-docs/README.md、@weekly-prep-docs/01-product/demo.md、@weekly-prep-docs/02-architecture/tech-architecture.md、@weekly-prep-docs/03-process/plan.md，
实现【模块名】的【功能点】。

要求：
- 必须满足 FEAT-___ 与 AC-___
- 必须遵守 RULE-___ 与 FIX-___
- 若触发样式改动，需对齐 ITEM-___
- 直接修改代码并补充必要测试

输出：
- 变更目标
- 影响文件列表
- 关键实现点
- 验收对照（逐条对应 AC）
- 风险与回滚策略
```

### 4.2 缺陷修复模板
```text
请基于 @weekly-prep-docs/README.md、@weekly-prep-docs/02-architecture/bugFix.md、@weekly-prep-docs/03-process/开发计划与验收SOP.md，
修复【问题描述】。

要求：
- 先给复现路径，再给最小修复方案
- 必须包含幂等、回滚、导入恢复相关校验（如适用）
- 标注对应 FIX-ID 与里程碑 M-ID

输出：
- 根因分析
- 代码改动与文件清单
- 回归测试点（至少 3 条）
- 上线风险与回滚方案
```

### 4.3 体验优化模板
```text
请基于 @weekly-prep-docs/README.md、@weekly-prep-docs/02-architecture/fileCheck.md、@weekly-prep-docs/01-product/product-prototype-mobile.html，
优化【页面名】体验。

要求：
- 对齐移动端原型视觉风格
- 不改变核心业务流程
- 优先复用统一样式资产，不在页面散写重复样式
- 标注对应 ITEM-ID

输出：
- 页面问题清单
- 改动文件与改动点
- 验收对照（对应 ITEM 验收标准）
```

### 4.4 计划排期模板
```text
请基于 @weekly-prep-docs/README.md、@weekly-prep-docs/03-process/plan.md、@weekly-prep-docs/03-process/开发计划与验收SOP.md，
输出【本周/本迭代】执行计划。

每项任务必须包含：
- 输入依赖
- 输出交付物
- 负责人角色
- DoD
- 风险与缓冲

并标注：
- 关键路径任务
- 可并行任务
- 阻塞关系
```

### 4.5 文档一致性模板
```text
请基于 @weekly-prep-docs/README.md，检查以下文档是否一致：
@weekly-prep-docs/01-product/demo.md
@weekly-prep-docs/02-architecture/bugFix.md
@weekly-prep-docs/02-architecture/fileCheck.md
@weekly-prep-docs/02-architecture/tech-architecture.md
@weekly-prep-docs/03-process/plan.md
@weekly-prep-docs/03-process/开发计划与验收SOP.md

输出：
1) 冲突清单（字段、规则、口径）
2) 建议修正项（按优先级）
3) 可直接应用的修订内容
```

## 5. 输出质量门禁（提问时可附加）
- 必须给出可执行结论，不能只有分析。
- 必须说明影响范围与回滚点。
- 涉及数据状态改动时，必须说明幂等与回滚。
- 涉及导入恢复时，必须包含“导入前快照”策略。
- 涉及发布时，必须对照 `M1-M6` 里程碑门禁。

## 6. 成本控制建议
- 复杂任务拆 2-3 轮：先方案、再实现、再验收。
- 每轮只聚焦一个目标模块，避免上下文污染。
- 大文档不整份重复投喂，优先给目标段落 + 编号引用。
- 连续两轮未解决再升级为“问题复盘+重做方案”。

## 7. 最佳实践（项目内）
- 开发任务：优先用“功能开发模板 + FIX/AC 编号”。
- 修复任务：优先用“缺陷修复模板 + M 里程碑”。
- 体验任务：优先用“体验优化模板 + ITEM 验收标准”。
- 周会任务：优先用“计划排期模板”生成可跟踪清单。
