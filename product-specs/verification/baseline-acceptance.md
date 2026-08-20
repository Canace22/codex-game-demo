# 《归云录》基线验收报告

| 字段 | 值 |
| --- | --- |
| 工作单 ID | `BASELINE-20260820-001` |
| 验收版本 | `913f844` |
| 验收日期 | `2026-08-20` |
| 验收 Agent | `qa_agent` |
| 结论 | `PASS WITH DEVIATION` |

## 验收边界

本报告固化《归云录：江岸危局》在建立产物规格库前的可玩基线。它验证当前实现、资源和已发布页面已经具备可追溯证据，不代表本次新增的所有具体规格已经获得产品负责人批准。

本次基线只覆盖静态单机竖切：山门接援、山路探索、断桥轻功、村落求援、寺院防守、五人首领战、返程交付，以及桌面与手机触控适配。账号、服务端、真实网络多人、运行时 AI、正式音乐与配音不在验收范围内。

## 产物清单

| 规格族 | 已实现消费方 | 基线状态 |
| --- | --- | --- |
| `DSN.*.GUIYUN` | `src/config.js`、`src/core.js`、`src/combat.js`、`src/world.js` | `implemented` |
| `ENG.*.GUIYUN` | `index.html`、`src/*.js`、`vendor/three.min.js` | `implemented` |
| `VIS.*.GUIYUN` | `assets/generated/*`、`assets/textures/*`、程序化场景与特效 | `implemented` |
| `QA.*.GUIYUN` | QA Bridge、静态校验器及本地浏览器回归证据 | `implemented with gaps` |
| `OPS.*.GUIYUN` | `main` 根目录 GitHub Pages 发布链路 | `implemented` |

新增规格正文当前统一保持 `draft`。待产品负责人确认具体字段、关闭阻断性文案偏差并重跑发布门后，才能逐项更新为 `approved` 或 `verified`。

## 质量门结果

| 层级 | 检查项 | 结果 | 证据 |
| --- | --- | --- | --- |
| L0 | 静态结构、脚本顺序、阶段与角色合同、资源格式和规格链接 | `PASS` | `node scripts/validate-project.mjs`；[baseline-static-validation.json](baseline-static-validation.json) |
| L1 | 任务状态、轻功、战斗、治疗、首领、失败恢复与碰撞 | `PASS WITH DEVIATION` | `notes.md` 阶段 2–5；本地 `work/e2e-playthrough.mjs`、`work/boss-win.mjs`、`work/defense-win.mjs`、`work/collision-check.mjs` |
| L2 | `file://`、本地 HTTP、纹理双路径和无页面错误 | `PASS` | `notes.md` 阶段 1、4、5；`work/test-artifacts/textured-file-safe/*`、`work/test-artifacts/textured-http/*` |
| L3 | 桌面键鼠、844×390 横屏触控、390×844 竖屏提示、完整通关和 Pages | `PASS WITH DEVIATION` | `notes.md` 阶段 2、4、5；`work/test-artifacts/e2e-complete.png`、`work/test-artifacts/final-mobile-landscape.png`、`work/test-artifacts/final-mobile-portrait.png` |

## 已验证事实

- 完整浏览器状态回归从接取任务到达 `COMPLETE`；疾冲、空中疾冲、二段跳和六个落脚点均被记录，三种首领招式均出现。
- 玩家与四名队友都实际造成伤害，治疗量大于零；无秒杀或无敌辅助的首领战在 120.5 秒内完成，累计治疗 4387。
- 三波寺院防守在 80.75 秒内完成，并保住 1 名村民。
- 山路 AI 高度落在 `y=2.81～3.31`，寺院全队与首领稳定在 `y=0.76`；山门、村屋、寺院、树木和 NPC 碰撞专项通过。
- 鼠标左、中、右拖动均改变镜头；点击攻击与闪避仍能单独触发。
- 844×390 横屏下摇杆、镜头拖动和八个动作按钮可用；390×844 竖屏显示旋转提示且无横向溢出。
- `file://` 使用安全内存纹理，HTTP 与 Pages 使用生成 JPEG；两条加载路径均无页面错误或 `console.error`。
- `main` 根目录已启用 GitHub Pages，基线发布地址为 <https://canace22.github.io/codex-game-demo/>。

## 缺陷与偏差

| ID | 严重度 | 影响规格 | 状态 | 处理 |
| --- | --- | --- | --- | --- |
| `DEV-GUIYUN-001` | P2 | `DSN.INPUT.GUIYUN`、`ENG.INPUT_UI.GUIYUN`、`QA.INPUT.GUIYUN` | `open` | `src/ui.js` 的部分默认键帽与 `src/core.js` 实际键位不一致；修正并回归前，不把输入提示标为 `verified`。 |
| `DEV-GUIYUN-002` | P2 | `ENG.QA_BRIDGE.GUIYUN`、`QA.QUEST.GUIYUN` | `open` | 深入浏览器脚本位于本地忽略目录，新的克隆环境只能直接运行静态校验器；后续应将稳定 E2E 整理为可移植项目工具。 |
| `DEV-GUIYUN-003` | P2 | `DSN.SLICE.GUIYUN`、`QA.QUEST.GUIYUN` | `open` | 尚无多名新玩家、无测试辅助的 10–15 分钟人工通关样本；正式节奏结论保持待验证。 |
| `DEV-GUIYUN-004` | P3 | `ENG.MEDIA_RUNTIME.GUIYUN`、`VIS.TEXTURE.GUIYUN` | `accepted` | `file://` 与 HTTP/Pages 使用不同纹理来源，这是浏览器本地安全约束下的明确双路径设计；两条路径都必须保留验收。 |
| `DEV-GUIYUN-005` | P3 | `DSN.WORLD.GUIYUN`、`DSN.UICOPY.GUIYUN` | `open` | 玩家可见名称采用“照水寺”，`src/world.js` 仍保留“残月古寺”内部别名；后续统一命名时需回归标记和触发区。 |
| `DEV-GUIYUN-006` | P2 | `QA.BOSS.GUIYUN`、`QA.RUNTIME.GUIYUN` | `open` | 缺少首领战失败后完整重试的残留状态专项，以及 console warning 为零的明确门禁。 |
| `DEV-GUIYUN-007` | P3 | `QA.MOBILE.GUIYUN`、`QA.VISUAL.GUIYUN` | `open` | 尚缺 1080p、超宽屏、低端 Android、帧时间和显存专项证据；当前通过范围只代表已列视口。 |

## 回归范围

已覆盖的直接消费路径：

1. `file://.../index.html` 直接打开。
2. 本地静态 HTTP 打开并加载真实 JPEG 纹理。
3. 桌面键盘、鼠标拖动、鼠标点击和交互键。
4. 844×390 横屏触控与 390×844 竖屏提示。
5. `TITLE → COMPLETE` 主流程、断桥失败恢复、三波防守、自然首领战和返程交付。
6. 山门、山路、村落、寺院、NPC、队友和首领的地面贴合与碰撞。

未覆盖或证据不足：多人新手计时、低端 Android、1080p 与超宽屏、浏览器 warning 零容忍、首领失败重试残留，以及每次 Pages 发布后的线上完整流程。

## 最终结论

基线允许作为产物规格库 `1.0.0` 的实现参照，并允许继续进入具体规格评审。新批次必须使用稳定规格 ID、工作单、L0-L3 证据和偏差登记；不得把本报告中的局部原型限制自动继承为其他项目标准。

在 `DEV-GUIYUN-001`、`DEV-GUIYUN-002` 和 `DEV-GUIYUN-003` 关闭前，本项目可以继续作为可玩竖切和 Agent 生产示例，但不能宣称输入提示完全一致、QA 在全新克隆中完全可复现，或已用正式用户样本证明 10–15 分钟目标。
