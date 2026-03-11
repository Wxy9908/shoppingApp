# 文档总索引（给人和 AI 共用）

这个目录用于统一收纳“前期计划 / 原型 / 技术文档 / 开发记录”的入口信息。  
当前文档本体已统一迁移到 `weekly-prep-docs`，后续新增文档也建议继续放在本目录。

## 1) 需求与计划

- `./03-process/plan.md`：整体规划与里程碑
- `./03-process/开发计划与验收SOP.md`：开发与验收流程

## 2) 产品原型

- `./01-product/product-prototype.html`：桌面版原型
- `./01-product/product-prototype-mobile.html`：移动版原型
- `./01-product/demo.md`：演示说明

## 3) 技术与实现

- `./02-architecture/tech-architecture.md`：技术架构
- `./02-architecture/bugFix.md`：问题修复记录

## 4) AI 协作资料

- `./04-prompts/model-prompts-playbook.md`：提示词与协作手册

## 5) 目录规范（最终版）

建议新增文档按主题放入以下目录：

- `01-product/`：原型、演示、PRD 相关
- `02-architecture/`：技术架构、缺陷分析、设计决策
- `03-process/`：计划、SOP、里程碑与验收流程
- `04-prompts/`：AI 协作提示词、模板与实践手册

## 6) 开发时让 AI 稳定读取的用法

每次发起复杂需求时，先在提问里显式引用关键文档路径，例如：

`请基于 @weekly-prep-docs/README.md、@weekly-prep-docs/03-process/plan.md、@weekly-prep-docs/02-architecture/tech-architecture.md 继续实现购物清单模块`

这样可以降低上下文遗漏，保证 AI 按你沉淀的文档来开发。
