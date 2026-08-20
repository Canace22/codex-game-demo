# 《归云录》产物规格库

- 版本：`1.0.0`
- 项目基线：`913f844`
- 基线日期：2026-08-20
- 在线消费方：[GitHub Pages](https://canace22.github.io/codex-game-demo/)

## 目标

本目录把已经构建、浏览器验证并发布的原创 3D 武侠 MMORPG 竖切《归云录：江岸危局》，拆成 AI Agent 可选型、可批次生产、可确定性集成、可追溯验收的产物合同。

每项产物使用同一四层结构：

```text
产物类型 → 产物子类型 → 产物基础规格 → 《归云录》具体规格
```

- 基础规格保存同类游戏产物的稳定输入、输出、不变量和质量门。
- 具体规格保存当前项目真实阶段键、角色、数值、路径、尺寸、消费方和证据。
- 新项目可以继承基础规格，但必须重新批准具体规格，不能只替换游戏名或角色名。

## 独立性边界

- 本库只以当前仓库的代码、资源、迭代记录、测试结果和已发布版本为《归云录》实例证据。
- 参考库只用于抽取四层模型、工作单、Agent 路由和 L0-L3 门禁结构；其项目名、框架、角色、资源、数值和平台结论没有进入本项目具体规格。
- 规格是游戏可消费产物的公开合同；当前游戏仍由 `index.html` 和 `src/*.js` 直接消费项目资源。
- 外部 GCP、Agent 或编辑器接入时，应通过已批准工作单、稳定 ID、路径和检查命令交接，不应直接理解并任意重写游戏内部文件。
- 本项目不包含账号、服务端、真实网络多人或运行时 AI API；这些能力不能由 Agent 作为实现捷径引入。

## 规格地图

| 文档 | 覆盖范围 | 何时读取 |
| --- | --- | --- |
| [01-specification-model.md](01-specification-model.md) | 四层模型、ID、状态、继承、L0-L3 与完成定义 | 所有 Agent 首先读取 |
| [02-design-content-products.md](02-design-content-products.md) | 世界、角色、任务、关卡、轻功、战斗、首领与 UI 文案 | 定义玩法和内容时 |
| [03-engineering-products.md](03-engineering-products.md) | 静态工程、运行时、世界、实体、战斗、输入、媒体、QA Bridge 与 Pages | 实现和集成时 |
| [04-visual-products.md](04-visual-products.md) | 风格、主视觉、远景、纹理、程序化模型、材质、VFX、天气和 HUD | 生产或接入美术时 |
| [05-quality-products.md](05-quality-products.md) | 静态检查、逻辑、浏览器、完整流程、视口、发布和偏差 | 验收和发布时 |
| [06-agent-production-workflow.md](06-agent-production-workflow.md) | 玩法、内容、视觉和发布工作流及并行边界 | 编排批次时 |
| [07-agent-definitions.md](07-agent-definitions.md) | 统筹、规格、内容、视觉、实现、QA 和浏览器 QA 定义 | 下发 Agent 工作单时 |
| [templates/artifact-spec-template.md](templates/artifact-spec-template.md) | 单项具体规格模板 | 新增产物时 |
| [templates/work-order-template.md](templates/work-order-template.md) | 单目标生产工作单 | 启动批次时 |
| [templates/acceptance-report-template.md](templates/acceptance-report-template.md) | L0-L3 验收报告 | 关闭批次时 |
| [verification/baseline-acceptance.md](verification/baseline-acceptance.md) | 当前基线事实、测试、偏差和发布证据 | 评估现状时 |
| [verification/baseline-static-validation.json](verification/baseline-static-validation.json) | 当前基线静态门禁机器可读摘要 | 自动化或审计读取时 |

目录内 `AGENTS.md` 是未来 Agent 修改本规格库时的路由规则。

## 当前项目基线

| 域 | 《归云录》具体产物 |
| --- | --- |
| 任务 | 10 个阶段，从 `TITLE` 到 `COMPLETE`；山门接援、山路、断桥、村落、寺院防守、首领、返程 |
| 角色 | 1 名持剑玩家、4 名职责不同的 AI 队友、1 名首领、3 名受保护村民及分波敌人 |
| 移动 | 第三人称、WASD/方向键、鼠标镜头、跳跃/二段跳、疾冲、踏水、落水检查点、碰撞与滑墙 |
| 战斗 | 普攻、闪避、两项技能、治疗、集火/归队、三种首领招式、破招、倒地与重置 |
| 平台 | 桌面键鼠、844×390 手机横屏触控、390×844 竖屏旋转提示 |
| 工程 | 8 个 `window.GY` classic script 模块、内置 Three.js r149、无构建和服务端 |
| 视觉 | 2 张生成式 PNG、3 张 512×512 主题 JPEG、程序化低多边形世界/角色/VFX、晴岚与雨夜两种气氛 |
| 声音 | Web Audio 合成反馈，无外部音频文件 |
| 发布 | 根目录静态站点，`main` 自动发布到 GitHub Pages |
| 自动化 | `render_game_to_text`、`advanceTime`、debug bridge、项目本地静态契约检查 |

这些数量是已实现基线，不是所有后续武侠项目的默认下限。任何新增任务、角色、地图或资源都必须通过新工作单具体化。

## 使用方法

1. 从工作单模板创建一个单目标批次，写明版本、平台、允许路径和非目标。
2. 读取 `01-specification-model.md`，在相关分类文档中选择基础规格。
3. 复制基础规格并填写完整具体规格；所有实例字段批准后才进入生产。
4. 按 `07-agent-definitions.md` 选择主责 Agent，并为共享文件指定唯一所有者。
5. 先执行 L0 结构和 L1 逻辑检查，再执行 L2 静态集成，最后执行 L3 真实浏览器体验。
6. 使用验收报告登记命令、提交、状态、视口、截图、缺陷与偏差。
7. 证据齐全且真实消费方通过后，才把产物标记为 `verified`。

项目本地静态检查入口：

```bash
node scripts/validate-project.mjs
```

## 类型级依赖

```text
用户需求与原创边界
  → DSN 世界 / 角色 / 任务 / 关卡 / 战斗
    ├─ VIS 风格 / 图像 / 纹理 / 模型 / VFX / HUD
    └─ ENG 静态运行时 / 世界 / 实体 / 战斗 / 输入 / 媒体
         → index.html 确定性集成
           → QA 静态 / 逻辑 / 浏览器 / 视口 / 发布
             → OPS 验收、归档与下一批工作单
```

阶段键、角色 ID、资源路径、脚本顺序、状态字段、输入映射和战斗数值属于跨产物接口。修改这些字段必须做影响分析和相邻回归。

## 当前偏差与风险

本库保留现状事实，不把原型限制提升为通用标准：

- 角色是程序化低多边形几何并共享基础体型，没有骨骼模型、动作剪辑或面部表现；它满足当前可读性，不代表正式量产角色标准。
- `file://` 受浏览器本地图像安全策略限制，运行时使用同色系 CanvasTexture；HTTP 与 Pages 使用生成 JPEG。两条路径视觉细节不同，但都必须无控制台错误。
- Web Audio 只提供合成提示音，没有音乐、配音、环境循环或可单独验收的音频资源包。
- 完整流程已通过自动化状态与真实输入混合回归；“新玩家稳定在 10–15 分钟通关”仍缺少正式人工计时样本。
- 既有深入浏览器脚本保存在本地忽略目录，当前仓库只提供 `scripts/validate-project.mjs` 的可移植静态检查；下一 QA 工业化批次应把跨端流程脚本整理成可克隆运行的项目工具。
- 当前 UI 帮助文案与运行时个别键位存在已登记差异；修正前相关提示规格不能标为完全 `verified`。

偏差详情见 `03-engineering-products.md`、`05-quality-products.md` 与基线验收报告。

## 工业化完成标准

一个批次只有同时满足以下条件才完成：

- 输出符合已批准具体规格。
- 上下游 ID、路径和引用闭合。
- 所需 L0-L3 门禁全绿。
- `file://`、HTTP、桌面和手机的受影响消费路径通过。
- Pages 版本与发布提交一致。
- 偏差经过批准并有责任人、期限或失效条件。
- 报告可从规格追溯到文件、运行状态和证据。
