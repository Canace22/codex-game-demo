# 可复用游戏产物规格流程

版本：`2.0.0`

这是一套从真实浏览器游戏竖切开发中抽取的轻量生产协议。它不保存某个项目的完整策划案，而是规定下一次项目如何定义产物、分配 Agent、推进实现、收集证据和完成验收。

旧版 `1.0.0` 将单个项目反向拆成大量具体规格，复用时仍需逐项删除项目名、角色、数值和路径。该结构已经废弃并从当前版本移除；历史只保留在 Git 提交 `168b399` 中。

## 这套流程解决什么

- 把自然语言需求变成游戏可消费、可验证的产物合同。
- 让设计、工程、视觉和 QA Agent 在同一套 ID、路径和质量门下协作。
- 先完成最小可启动版本，再逐段闭合主流程、失败恢复和跨端体验。
- 把“代码存在”“图片生成成功”和“玩家真的能完成”分开验收。
- 让任何新项目都能复制模板开始，而不用继承示例项目的技术栈和内容。

## 文件地图

| 文件 | 用途 |
| --- | --- |
| [01-artifact-contract.md](01-artifact-contract.md) | 产物类型、合同字段、ID、状态和依赖规则 |
| [02-production-process.md](02-production-process.md) | P0–P7 八阶段生产流程、提交点和返工规则 |
| [03-agent-definitions.md](03-agent-definitions.md) | 六类 Agent 的输入、权限、输出和交接协议 |
| [04-quality-gates.md](04-quality-gates.md) | L0–L3、发布门、证据包和高风险回归清单 |
| [05-adoption-guide.md](05-adoption-guide.md) | 新项目如何在一个批次内完成首次实例化 |
| [templates/project-profile-template.md](templates/project-profile-template.md) | 项目画像与能力边界 |
| [templates/artifact-spec-template.md](templates/artifact-spec-template.md) | 单项产物合同 |
| [templates/work-order-template.md](templates/work-order-template.md) | 单目标 Agent 工作单 |
| [templates/acceptance-report-template.md](templates/acceptance-report-template.md) | 验收报告 |
| [templates/deviation-register-template.md](templates/deviation-register-template.md) | 偏差登记表 |
| [examples/guiyun-vertical-slice.md](examples/guiyun-vertical-slice.md) | 当前游戏如何实例化该流程的示例 |

目录内 [AGENTS.md](AGENTS.md) 规定 Agent 修改本库时的最小规则。

## 最短使用路径

1. 复制 `product-specs/` 到目标游戏仓库。
2. 使用项目画像模板冻结平台、运行方式、核心闭环、非目标和真实消费方。
3. 从产物目录选择本批需要的基础规格，只实例化真正会被游戏消费的条目。
4. 每个工作单只包含一个可独立验收目标，并列出允许修改路径。
5. 按 P0–P7 推进；每个可预览阶段形成提交和开发记录。
6. 依次执行 L0、L1、L2、L3，最后执行独立发布门。
7. 将命令、状态、截图、错误、网络和版本写入证据包。
8. 只有消费方实际通过且偏差已关闭或批准，产物才可标记 `verified`。

## 核心原则

- 基础规格可复用，具体规格不可通过批量改名迁移。
- 规格描述目标，代码和资源描述现状；两者不一致时登记偏差。
- 先验证最小可启动版本，再扩展完整主流程。
- 生产 Agent 不承担最终验收；QA 必须重新读取规格并独立复现。
- 自动化证明状态可达，真实输入和目标视口证明体验可用。
- 外部平台提供公开合同和工具，游戏项目维护自己的消费适配。
- 未经授权不得发布、删除外部数据或扩大技术边界。

## 校验

无需安装依赖：

```bash
node scripts/validate-spec-process.mjs
```

该命令检查流程文件、模板字段、P0–P7、L0–L3、Agent ID、示例实例化、废弃文件残留和 Markdown 相对链接。
