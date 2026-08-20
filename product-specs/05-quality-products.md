# 05 质量产物规格

## 1. 文档目的与质量原则

本文定义《归云录：江岸危局》的质量产物、可执行验收门禁和 AI Agent 验证协议。

质量结论必须同时回答三个问题：

1. 静态文件、脚本和资源是否结构正确。
2. 任务、战斗、轻功、AI 和输入是否在结构化状态中正确运行。
3. 玩家是否能在真实浏览器和目标设备布局中完成完整体验。

本文使用以下证据状态：

- **已验证**：当前仓库存在可执行脚本、状态输出、截图或 `notes.md` 中的日期化结果。
- **本次只读复核**：生成规格时重新读取文件或执行无写入检查。
- **建议门禁**：发布前应执行，但当前没有完整合规证据，不能写成已完成。

当前质量基线：Git 提交 `913f8441a201d1067cc211261455a4953cb83828`。

## 2. 质量范围

覆盖 `file:///`、本地静态 HTTP 与 GitHub Pages；检查静态结构、资源、完整任务、轻功、队伍、首领、碰撞、桌面键鼠、手机横竖屏、控制台和截图证据。

不覆盖真实账号、服务器、网络多人、运行时 AI API、付费、存档和无障碍认证。

## 3. 正式质量产物目录

| 正式规格 ID | 产物类型 | 产物子类型 | 基础规格 | 《归云录》具体产物 |
| --- | --- | --- | --- | --- |
| `QA.STATIC.GUIYUN` | 静态质量 | 文件与语法 | 入口、依赖、脚本、资源可解析 | `index.html` + 8 个运行脚本 + Three.js r149 |
| `QA.ASSET.GUIYUN` | 契约质量 | 图像与纹理 | 路径、magic、尺寸、加载状态正确 | 2 PNG 主图、3 JPEG 纹理、file 安全回退 |
| `QA.STATE.GUIYUN` | 可观测质量 | 游戏状态桥 | 状态结构稳定，确定性步进可控 | `render_game_to_text()`、`advanceTime(ms)` |
| `QA.QUEST.GUIYUN` | 逻辑/集成质量 | 完整任务线 | 阶段顺序、目标反馈和交付闭合 | 山门→山路→断桥→村落→防守→首领→返程→完成 |
| `QA.LIGHTNESS.GUIYUN` | 体验质量 | 轻功与失败恢复 | 疾冲、二段跳、踏水、落脚、检查点 | 6 个落脚石、北/中/南检查点、落水复位 |
| `QA.PARTY.GUIYUN` | 战斗质量 | 五人队与村民 | 四职责参战、受击、治疗和队令有效 | 枪卫、弓手、医者、影行；集火/归队 |
| `QA.BOSS.GUIYUN` | 战斗质量 | 首领三式与通关 | 三式可辨、可躲、可破、可自然击败 | 断岳回风、焚脉落印、锁脉夺息 |
| `QA.COLLISION.GUIYUN` | 运行质量 | 地面、角色和世界碰撞 | 不沉地、不重叠、不穿墙、不穿 NPC | 山门、斜墙、村屋、寺院、角色分离 |
| `QA.INPUT.GUIYUN` | 交互质量 | 桌面键鼠 | 移动、镜头、点击动作不冲突 | 三键拖镜头、左击攻击、右击闪避 |
| `QA.MOBILE.GUIYUN` | 跨端质量 | 横屏与竖屏 | 横屏可玩、竖屏有引导、无溢出 | 844×390、390×844 |
| `QA.RUNTIME.GUIYUN` | 运行质量 | file/HTTP/Pages | 三种启动方式可进入并加载静态资源 | 本地直开、本地 HTTP、GitHub Pages |
| `QA.CONSOLE.GUIYUN` | 运行质量 | 控制台与网络 | page error、console error、资源失败为零 | 当前脚本已覆盖 error；warning 门禁待补 |
| `QA.VISUAL.GUIYUN` | 视觉质量 | 截图与状态证据 | 截图与 viewport、阶段、状态一一对应 | 1280×720、844×390、390×844 证据 |
| `QA.RELEASE.GUIYUN` | 发布质量 | 验证报告与复现 | 当前提交可独立复现，报告区分事实和建议 | Pages、完整任务、跨端、资源与错误汇总 |

治理信息如下。质量规格描述后续门禁合同；历史证据存在不等于新规格已经批准，因此统一保持 `draft`。

| 具体规格 ID | 基础规格 ID | 版本 | 状态 | 责任 Agent | 当前输出或证据目标 | 主要消费方 |
| --- | --- | --- | --- | --- | --- | --- |
| `QA.STATIC.GUIYUN` | `QA.STATIC` | `1.0.0` | `draft` | `qa_agent` | `scripts/validate-project.mjs`、静态结果 JSON | 实现与发布 Agent |
| `QA.ASSET.GUIYUN` | `QA.ASSET` | `1.0.0` | `draft` | `qa_agent` | 图像账本、加载状态 | 视觉与资源集成 Agent |
| `QA.STATE.GUIYUN` | `QA.STATE` | `1.0.0` | `draft` | `qa_agent` | QA Bridge 状态 JSON | 逻辑与浏览器 QA |
| `QA.QUEST.GUIYUN` | `QA.QUEST` | `1.0.0` | `draft` | `browser_qa_agent` | 完整流程状态、截图、错误记录 | 发布 Agent |
| `QA.LIGHTNESS.GUIYUN` | `QA.LIGHTNESS` | `1.0.0` | `draft` | `browser_qa_agent` | 断桥成功/失败状态与截图 | 玩法与关卡 Agent |
| `QA.PARTY.GUIYUN` | `QA.PARTY` | `1.0.0` | `draft` | `qa_agent` | 伤害、治疗、承伤和队令统计 | 战斗 Agent |
| `QA.BOSS.GUIYUN` | `QA.BOSS` | `1.0.0` | `draft` | `qa_agent` | 三招、破招、胜负与重置状态 | 战斗与发布 Agent |
| `QA.COLLISION.GUIYUN` | `QA.COLLISION` | `1.0.0` | `draft` | `browser_qa_agent` | 地面、分离、墙体与 NPC 断言 | World、Entity、Camera Agent |
| `QA.INPUT.GUIYUN` | `QA.INPUT` | `1.0.0` | `draft` | `browser_qa_agent` | 键鼠状态与截图 | 输入与 UI Agent |
| `QA.MOBILE.GUIYUN` | `QA.MOBILE` | `1.0.0` | `draft` | `browser_qa_agent` | 844×390、390×844 证据 | UI 与发布 Agent |
| `QA.RUNTIME.GUIYUN` | `QA.RUNTIME` | `1.0.0` | `draft` | `browser_qa_agent` | file/HTTP/Pages 运行记录 | 发布 Agent |
| `QA.CONSOLE.GUIYUN` | `QA.CONSOLE` | `1.0.0` | `draft` | `browser_qa_agent` | console、pageerror、network 摘要 | 全部运行时 Agent |
| `QA.VISUAL.GUIYUN` | `QA.VISUAL` | `1.0.0` | `draft` | `browser_qa_agent` | 截图与伴随状态 JSON | 视觉与产品评审 |
| `QA.RELEASE.GUIYUN` | `QA.RELEASE` | `1.0.0` | `draft` | `qa_agent` | `verification/baseline-acceptance.md` | 制作统筹、用户 |

## 4. `QA.STATIC.GUIYUN` 文件与脚本门禁

### 4.1 当前工程合同

- 项目没有 npm 构建步骤，根目录 `index.html` 是正式入口。
- 所有运行脚本使用经典 `<script>` 顺序加载，不依赖 ES Module 或服务端。
- Three.js r149 内置于 `vendor/three.min.js`。
- 运行时不请求 AI API。
- 静态入口顺序为：Three.js、配置、材质、实体、音频、世界、UI、战斗、核心。
- CSS 顺序为 `styles.css` 后 `ui.css`。

### 4.2 验收命令

```bash
node scripts/validate-project.mjs
```

### 4.3 当前事实

- 项目内 `scripts/validate-project.mjs` 使用 Node 内置能力检查必需文件、全部 8 个运行脚本语法、classic script 顺序、Three.js 版本、任务阶段、队友职责、QA Bridge、纹理协议、图像尺寸、规格 ID 和 Markdown 相对链接。
- 本次规格批次已执行该命令并退出 0；原始结果写入基线验收报告，后续发布仍需保存命令、退出码、Node 版本和提交号。
- 新增关键 DOM、资源键或公共状态字段时，应同步扩展校验器，不能只更新说明文字。

## 5. `QA.ASSET.GUIYUN` 资源契约门禁

### 5.1 当前资源账本

| 路径 | 实际格式 | 像素 | 字节数 |
| --- | --- | ---: | ---: |
| `assets/generated/title-hero.png` | PNG RGB | 1672×941 | 2,580,551 |
| `assets/generated/distant-valley.png` | PNG RGB | 1915×821 | 2,131,900 |
| `assets/textures/robe-cloth-512.jpg` | JPEG | 512×512 | 147,805 |
| `assets/textures/bluestone-512.jpg` | JPEG | 512×512 | 84,201 |
| `assets/textures/dark-cedar-512.jpg` | JPEG | 512×512 | 78,343 |

### 5.2 加载判定

- HTTP/Pages：`visualAssets.requested=3`、`loaded=3`、`fallback=0`。
- `file://`：三项状态应为 `local-safe`，不能产生 WebGL 跨域错误。
- 任一纹理失败时允许材质保留色块，但发布门禁不得将 `fallback>0` 当作线上通过。

### 5.3 当前事实

- 本次只读复核访问 Pages 根页面，返回 HTTP 200、`text/html`。
- Pages 三张纹理均返回 HTTP 200 和 `image/jpeg`。
- 线上下载字节数分别为 147,805、84,201、78,343，与本地账本一致。
- `work/test-artifacts/art-visual/*-state.json` 的 HTTP 回归记录三纹理 `loaded=3`。

## 6. `QA.STATE.GUIYUN` 结构化状态桥

### 6.1 正式观测接口

普通运行时提供：

```javascript
window.render_game_to_text() // JSON string
window.advanceTime(ms)       // 确定性步进并重绘
```

状态至少包含任务/检查点、玩家、轻功、四名队友、村民、敌人、首领、队令、治疗/伤害统计、viewport、camera、visualAssets 和 environmentMood。

### 6.2 调试与确定性要求

- URL 只有包含 `?debug=1` 时才挂载 `window.__GY_TEST__`。
- 调试动作包括传送、设置阶段、执行动作、清敌、伤害玩家/首领等。
- 调试接口用于缩短测试路径，不能代替至少一条真实用户输入流程。
- **建议门禁**：普通 Pages URL 断言 `window.__GY_TEST__ === undefined`。
- 首次调用 `advanceTime` 后进入确定性模式，避免 RAF 与测试步进重复推进。
- 每张关键截图保存同一时刻的状态 JSON 和错误 JSON。

## 7. `QA.QUEST.GUIYUN` 完整任务验收

### 7.1 阶段顺序

`GATE_OFFER → ROAD_TO_BRIDGE → BRIDGE_CROSSING → VILLAGE_ARRIVAL → TEMPLE_DEFENSE → BOSS_INTRO → BOSS_FIGHT → RETURN_TO_GATE → COMPLETE`。

### 7.2 必须证明的行为

1. 山门靠近执事后出现 `gate-master`，交互进入山路阶段。
2. 山路至少由玩家和一名队友造成真实伤害。
3. 清除两名影徒后到达断桥，任务目标和进度更新。
4. 断桥失败会复位，不会跳过轻功阶段。
5. 到村落后与里正交互，目标更新到照水寺。
6. 寺院三波防守完成，至少一名村民存活。
7. 首领登场后进入首领战，三式均出现。
8. 首领败北进入返程，归云流光桥出现。
9. 返回山门出现 `return-gate`，交付后 `questStage=COMPLETE`、`mode=complete`。

### 7.3 当前证据

- `work/e2e-playthrough.mjs` 在 1280×720 依次断言上述阶段并保存道路、断桥、首领、完成截图。
- `notes.md` 记录完整回归到达 `COMPLETE`，六落脚点和三招均出现，控制台 error 为 0。
- 当前自动流程使用调试传送与清敌来压缩时长，因此证明状态闭合，不单独证明 10–15 分钟纯手工节奏。
- **建议门禁**：补一条不使用传送、清敌、无敌或首领伤害辅助的完整实机录像/trace。

## 8. `QA.LIGHTNESS.GUIYUN` 轻功与失败恢复

### 8.1 必测能力

- 地面疾冲设置 `bridge.usedDash=true`。
- 空中疾冲设置 `bridge.usedAirDash=true`。
- 二段跳设置 `bridge.usedDoubleJump=true`。
- 六个窄落脚点全部进入 `bridge.visited`，`steppingLandings=6`。
- 水面只提供短时踏水宽限，不能形成持续隐形地面。
- 检查点顺序至少覆盖 `BRIDGE_NORTH`、`BRIDGE_MID`、`BRIDGE_SOUTH`。

### 8.2 失败恢复断言

`work/e2e-playthrough.mjs` 把玩家放在 `(7,0.8,-5)` 的水域，推进 2200ms 后要求：

- 阶段仍为 `BRIDGE_CROSSING`。
- 检查点仍为 `BRIDGE_NORTH`。
- 玩家 z 大于 7，说明已回到北岸附近安全处。

失败恢复不得倒退已完成任务阶段，也不得把玩家复活在水面或墙体内。

## 9. `QA.PARTY.GUIYUN` 五人队与治疗

### 9.1 队伍职责门禁

玩家剑客必须使用普攻、闪避和双技能；陆沉舟控场并参与破招，闻雁远程输出，苏叶真实治疗，越青崖突袭后回到安全距离。

### 9.2 结构化断言

- `damageStats.player > 0`。
- `damageStats.spear/archer/healer/scout` 在自然首领战结束时全部大于 0。
- 先伤害玩家，再推进医者 AI，`healingDone > 0` 且目标 HP 上升。
- 队友可被首领攻击、倒地并重新起身，不得永久消失。
- `partyOrder` 在 `focus` 和 `follow` 间切换，集火缩短攻击间隔并增加破招贡献。
- 寺院防守结束至少一名村民 `alive=true`。

### 9.3 当前证据

- `work/boss-win.mjs` 不使用秒杀或无敌辅助，在 150 秒预算内要求自然胜利、0 次重置、治疗量大于 0、五个伤害来源全大于 0。
- `notes.md` 记录自然首领战 120.5 秒获胜、治疗量 4387。
- `work/defense-win.mjs` 在 120 秒预算内要求三波防守进入 `BOSS_INTRO` 且至少一名村民存活。
- `notes.md` 记录防守 80.75 秒通过，存活村民 1 名。

## 10. `QA.BOSS.GUIYUN` 首领三式与通关

### 10.1 三式验收

| 招式 | 类型 | 必须证明 |
| --- | --- | --- |
| 断岳回风 | 近身范围 | 名称进入 `seenAttacks`，近身目标承受威胁，预警与伤害顺序正确 |
| 焚脉落印 | 地面预警 | 地面危险区域可辨，离开区域能避免或降低伤害 |
| 锁脉夺息 | 引导/破招 | 优先锁定医者或低血量目标，集火+穿云刺使 `breakSuccesses>=1` |

### 10.2 数值与结果门禁

- 首领初始 HP 为 7200。
- `seenAttacks` 最终集合严格包含三种招式。
- 锁脉期间首领和目标间有光束，破绽条从 0 向 260 推进。
- 破招成功使引导提前结束；失败时首领恢复 450 HP。
- 玩家不使用测试无敌/秒杀时，合理使用闪避、双技能、治疗和集火能在 150 秒内获胜。
- 玩家失败只重置当前遭遇，不倒退任务线。

### 10.3 当前证据与缺口

- `work/e2e-playthrough.mjs` 断言三式集合和 `breakSuccesses>=1`。
- `work/boss-win.mjs` 断言自然击败、0 次重置、治疗和五人输出。
- **建议门禁**：增加“焚脉落印”站圈/出圈伤害对照和“断岳回风”边界距离断言。
- **建议门禁**：补首领失败后完整重试，无残留预警、光束、血条或冷却。

## 11. `QA.COLLISION.GUIYUN` 地面与碰撞

### 11.1 角色地面和分离

- 山路队友和敌人 y 必须随坡面变化并大于 1。
- 寺院队伍与首领 y 必须在 `0.76±0.02`。
- 战斗角色两两最小中心距必须不小于 1.5 米。
- 影行突袭后不能停在首领体内。
- 村民在首领战时退到场外，不与战斗队形重叠。

`work/collision-check.mjs` 覆盖以上门禁；`notes.md` 记录道路 y 为 2.81–3.31、寺院 y 为 0.76、最近中心距 2.35 米。

### 11.2 世界碰撞

`work/walk-collision-check.mjs` 断言：

- 山门后墙阻止 z 越过 84.53。
- 斜向移动能沿墙滑动，仍不穿墙。
- 闪避扫掠不穿过薄墙。
- 旋转村屋阻挡移动。
- 寺院主殿阻挡移动。
- 山门执事 NPC 阻挡移动。

碰撞失败必须记录起点、输入、终点、阻挡体名称和截图，不允许只写“有穿模”。

## 12. `QA.INPUT.GUIYUN` 桌面输入

键盘覆盖 WASD/方向键、Space、Shift、J/K、Q/E、R、F/Enter、G、Esc；失焦后必须清空持续输入。

- 左、中、右键拖动均改变 yaw；垂直拖动改变 pitch。
- 左/右键移动超过 4px 判定为拖动，不能误触攻击/闪避。
- 左键单击触发攻击，镜头不转。
- 右键单击触发闪避。
- 中键拖动不触发动作；右键菜单被阻止。

`work/mouse-camera.mjs` 在 1280×720 使用真实 Playwright 鼠标输入断言上述行为，并要求 console error/page error 为空。

## 13. `QA.MOBILE.GUIYUN` 手机布局与输入

### 13.1 横屏 844×390

`work/mobile-e2e.mjs` 使用 `isMobile=true`、`hasTouch=true`、DPR 2，必须证明：

- 摇杆可见且向前拖动后玩家 z 至少减少 4 米。
- 镜头区可见，拖动后 camera yaw 变化。
- 移动攻击按钮可点击并开始冷却。
- `.gy-action--mobile` 数量严格为 8。
- 控制台 error 和 page error 为空。

截图像素为 1688×780 是 DPR 2 的结果；逻辑 viewport 仍是 844×390，报告必须同时记录两者。

### 13.2 竖屏 390×844

- `.gy-rotate` 可见。
- 文案包含“请横屏游玩”。
- `document.documentElement.scrollWidth - innerWidth <= 0`。
- 底层操作不应穿透旋转提示。
- DPR 2 截图像素为 780×1688。

## 14. `QA.RUNTIME.GUIYUN` 三种启动方式

| 模式 | 入口 | 放行标准 | 当前事实 |
| --- | --- | --- | --- |
| `file:///` | 根目录 `index.html` | 无服务端、无 fetch 内容；三纹理 `local-safe` | 主要回归脚本默认使用 file URL |
| 本地 HTTP | `python3 -m http.server 4173` | 页面进入；三 JPEG `loaded` | `live-texture-check.mjs` 可记录响应/失败 |
| GitHub Pages | `https://canace22.github.io/codex-game-demo/` | 页面与资源 200，关键流程通过 | 本次页面/三纹理 200；线上全流程建议补跑 |

Pages 从 `main` 根目录部署，当前基线为 `913f844`；每次发布不能只以 HTTP 200 代替完整流程。

## 15. `QA.CONSOLE.GUIYUN` 控制台与网络

### 15.1 当前脚本行为

现有主要 Playwright 脚本收集：

- `page.on('console')` 中 type 为 `error` 的消息。
- `page.on('pageerror')` 的未捕获异常。
- `live-texture-check.mjs` 额外收集纹理响应与 `requestfailed`。

当前 `notes.md`、E2E 断言和 `art-visual/*-errors.json` 均记录 console error/page error 为 0。

### 15.2 建议增强门禁

- 同时收集 console warning，并建立明确允许清单；默认新增 warning 阻塞发布。
- 收集所有同源 4xx/5xx，不限于纹理路径。
- 收集 `requestfailed`、CSP、mixed content、WebGL context lost。
- 报告只保存消息摘要和 URL，不泄露凭据或超长堆栈中的敏感值。

因此当前可以确认“error 为 0”，不能把它扩大表述为“warning 也为 0”。

## 16. `QA.VISUAL.GUIYUN` 截图与状态证据

### 16.1 当前正式可读证据

| 路径 | 文件像素 | 证明范围 |
| --- | ---: | --- |
| `outputs/美术优化-晴岚山门.png` | 1280×720 | 日景、队伍、材质、目标与桌面 HUD |
| `outputs/美术优化-雨夜寺院.png` | 1280×720 | 夜景、雨丝、队形、首领 HUD |
| `outputs/归云录-实机首领战.png` | 1280×720 | 首领战空间与状态层 |
| `outputs/归云录-鼠标镜头预览.png` | 1280×720 | 第三人称镜头构图 |
| `outputs/归云录-手机横屏.png` | 1688×780 | 844×390、DPR 2 横屏 UI |
| `work/test-artifacts/mobile-portrait.png` | 780×1688 | 390×844、DPR 2 旋转提示 |

现有文件经本次只读复核均为真实 PNG，扩展名与编码一致。

`work/test-artifacts/art-visual/` 为桌面山门/断桥/寺院和手机寺院分别保存 full PNG、canvas PNG、state JSON、errors JSON；状态包含阶段、viewport、镜头、纹理与氛围，四个错误文件均为空数组。

### 16.2 建议证据矩阵

- 桌面：1280×720 与 1920×1080。
- 手机：844×390 横屏、390×844 竖屏。
- 路径：标题、接任务、山路、断桥失败/成功、村口、三波防守、首领三式、破招、失败重试、返程、完成。
- 每张截图附同名 state、console、network 和操作序列。
- 禁止用调试传送后的截图冒充真实路线耗时证据。

## 17. 可执行测试清单

| 脚本 | 层级 | 当前主要断言 |
| --- | --- | --- |
| `work/e2e-playthrough.mjs` | L1-L3 | 完整任务、落水恢复、六落脚、治疗、三招、破招、完成 |
| `work/boss-win.mjs` | L2-L3 | 自然首领战、0 重置、治疗、五人输出 |
| `work/defense-win.mjs` | L2-L3 | 三波防守、村民存活、五人输出 |
| `work/collision-check.mjs` | L2 | 地面贴合与角色分离 |
| `work/walk-collision-check.mjs` | L2-L3 | 墙、滑墙、闪避、旋转屋、寺院、NPC |
| `work/mouse-camera.mjs` | L3 | 三键拖镜头、单击动作、拖动不误触 |
| `work/mobile-e2e.mjs` | L3 | 横屏摇杆/镜头/8 按钮、竖屏提示/溢出 |
| `work/live-texture-check.mjs` | L0-L2 | 纹理加载状态、响应、请求失败和错误 |
| `work/art-visual-check.mjs` | L2-L3 | 四个场景/视口的 PNG、状态和错误证据 |

## 18. 工业化发布门禁

| Gate | 进入条件 | 必须执行 | 放行标准 | 当前状态 |
| --- | --- | --- | --- | --- |
| G0 范围冻结 | 设计/工程/视觉规格齐全 | 核对任务、平台、资源边界 | 需求与实现边界一致 | 建议门禁 |
| G1 静态结构 | G0 通过 | `node scripts/validate-project.mjs`、资源账本 | 退出 0，路径/magic/尺寸正确 | 本次通过 |
| G2 状态契约 | G1 通过 | 校验 state schema、普通/调试接口 | 字段稳定，非 debug 无写接口 | 建议门禁 |
| G3 逻辑与集成 | G2 通过 | 任务、轻功、队伍、首领、碰撞脚本 | 全断言通过，error 0 | 历史已验证 |
| G4 真实体验 | G3 通过 | 桌面实输入、手机横竖屏、视觉矩阵 | 无软锁、穿模、遮挡和溢出 | 历史已验证，矩阵待扩 |
| G5 三环境运行 | G4 通过 | file、HTTP、Pages 关键流程 | 三环境可启动，资源正确 | 启动/资源已验证 |
| G6 发布复现 | G5 通过 | 干净副本全命令、Pages 回归、报告 | 当前提交证据闭合，无凭据 | 建议门禁 |

## 19. AI QA Agent 标准工作单

```yaml
spec_id: QA.QUEST.GUIYUN
version: 1.0.0
status: draft
baseline_commit: 913f8441a201d1067cc211261455a4953cb83828
environment:
  launch_mode: file
  viewport: 1280x720
steps:
  - gate_to_complete_with_bridge_failure_and_boss_break
assertions:
  - questStage == COMPLETE
  - bridge.steppingLandings == 6
  - healingDone > 0
  - all_five_damage_sources > 0
  - seenAttacks == [断岳回风, 焚脉落印, 锁脉夺息]
  - consoleErrors == 0
evidence:
  - command_and_exit_code
  - state_and_screenshot
  - console_and_network
```

## 20. 缺陷记录协议

每个阻塞缺陷至少记录 ID/基线/环境、viewport/DPR、最短复现、前后状态、预期/实际、错误与网络摘要、截图，以及修复后的回归证据。

禁止只用“穿模”“镜头不好用”“手机不行”等不可复现描述关闭缺陷。

## 21. 当前已验证结论

仓库证据确认三种入口可用、任务到达 `COMPLETE`、断桥失败/能力/六落脚闭合、治疗和五人输出有效、三招与破招出现、自然首领战和三波防守可胜、碰撞/镜头/手机横竖屏通过，主要脚本要求 console error/page error 为 0。

## 22. 当前证据缺口

以下项目不得写成已通过：

1. 静态校验器已有统一入口，但其标准输出尚未定义稳定问题码与机器可消费 schema 版本。
2. 尚未证明 console warning 为 0；现有浏览器脚本主要只阻塞 error。
3. 尚未形成全同源 4xx/5xx、WebGL context lost 和 CSP 的统一网络报告。
4. 尚未提供无传送、无清敌、无无敌、无首领伤害辅助的完整 10–15 分钟实机 trace。
5. 尚未形成首领失败后重试的残留 VFX/状态专项证据。
6. 尚未覆盖 1920×1080、超宽屏、平板和低端 Android 性能。
7. 尚未记录帧率、长任务内存、纹理显存和 WebGL context 恢复。
8. `work/` 当前更像开发证据目录；建议把发布证据迁入版本化 `verification/`。
9. Pages 当前只做了本次 HTTP/资源只读复核；每次发布仍需运行线上完整流程。

建议使用 `verification/runs/<date>-<commit>/` 保存 commands、state trace、console、network、performance 和分视口截图；`verification/ACCEPTANCE.md` 只汇总原始证据，不复制 Base64 或凭据。

## 23. 主要来源索引

| 来源 | 证明内容 |
| --- | --- |
| `index.html` | 静态入口、脚本/CSS 顺序与无服务端结构 |
| `src/config.js` | 阶段、数值、角色职责和首领 HP |
| `src/materials.js` | 纹理资产表、file 安全回退与加载状态 |
| `src/entities.js` | 角色、武器和 VFX 生命周期 |
| `src/world.js` | 地面、断桥、检查点、碰撞和场景区域 |
| `src/combat.js` | 队伍 AI、治疗、防守、三式首领和统计 |
| `src/core.js` | 任务状态机、输入、镜头、复活、状态桥和调试接口 |
| `src/ui.js`、`ui.css` | 桌面/手机 UI、触控与旋转提示 |
| `notes.md` | 已执行浏览器结果、问题与修复闭环 |
| `work/*.mjs` | 当前可执行 QA 场景与断言 |
| `work/test-artifacts/` | 截图、状态和错误文件 |
| `outputs/*.png` | 用户可见预览证据 |
| `README.md` | 启动方式、操作、玩法与 Pages 地址 |
