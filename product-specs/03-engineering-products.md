# 03 工程产物规格

## 1. 文档目的与适用范围

本文把《归云录：江岸危局》当前可运行竖切拆成可复用、可检查、可由 Agent 稳定生产的工程产物。
规格以项目根目录中的静态源码、内置依赖、资源和现有浏览器测试脚本为事实依据。
本文不套用构建型框架项目的目录、场景系统或测试数量，也不引入项目中不存在的服务端、账号和联网多人能力。

当前发布形态是无需构建的浏览器 3D 游戏：

- `index.html` 以固定顺序加载 classic scripts。
- Three.js r149 内置于 `vendor/three.min.js`。
- 业务模块通过 `window.GY` 共享稳定接口。
- 正式运行支持 `file://` 直接打开和 HTTP(S) 静态托管。
- GitHub Pages 从仓库默认分支根目录消费同一批静态文件。
- 桌面和手机横屏属于发布范围，手机竖屏必须显示旋转提示。

四层分类含义如下：

- **产物类型**：工程交付物的一级门类。
- **产物子类型**：可独立生产、评审和替换的工程单元。
- **产物基础规格**：同类无服务端 3D 动作 RPG 竖切都必须满足的通用契约。
- **具体产物规格**：《归云录：江岸危局》当前实例必须达到的路径、数值、流程和浏览器行为。

验收层级统一解释为：L0 检查文件、语法、命名和静态引用；L1 检查确定性逻辑；L2 检查模块集成和两种加载协议；L3 检查真实浏览器中的完整体验。

## 2. 四层分类总表

| 目录 ID | 正式规格 ID | 产物类型 | 产物子类型 | 产物基础规格 | 本项目具体规格 |
| --- | --- | --- | --- | --- | --- |
| E-01 | `ENG.PROJECT.GUIYUN` | 可执行软件 | 静态 Web 游戏工程包 | 无构建即可启动，依赖和许可随包交付，相对路径闭合 | `index.html` 入口；Three.js r149 内置；支持 `file://` 与 GitHub Pages |
| E-02 | `ENG.RUNTIME.GUIYUN` | 运行时架构 | classic script 启动器与共享命名空间 | 加载顺序唯一，模块接口显式，入口最后组装运行时 | 九段脚本按固定顺序加载；统一使用 `window.GY` |
| E-03 | `ENG.QUEST_FLOW.GUIYUN` | 流程工程 | 任务状态与主循环 | 状态迁移单向、目标可见、失败可恢复、完成可判定 | 十阶段任务；山门至照水寺再返回山门；内存单局状态 |
| E-04 | `ENG.WORLD_RUNTIME.GUIYUN` | 世界运行时 | 固定 3D 世界、地面与碰撞 | 坐标、出生点、区域、地表和阻挡可查询；镜头不可穿模 | 单一连续山谷；断桥六个落脚石；圆形/旋转矩形阻挡 |
| E-05 | `ENG.ENTITY_PRESENTATION.GUIYUN` | 表现系统 | 程序化人物、武器与即时特效 | 实体脚锚一致，资源可释放，武器绑定稳定，反馈可辨认 | 玩家、四队友、村民、影徒和首领共享低多边形骨架 |
| E-06 | `ENG.COMBAT_PARTY.GUIYUN` | 玩法实现 | 五人队伍、遭遇与首领战 | 战斗状态可观测，队友真实参战受击，治疗和指令改变结果 | 路战、三波守卫、7200 HP 首领、三种招式和破招 |
| E-07 | `ENG.INPUT_UI.GUIYUN` | 交互系统 | 第三人称输入与响应式 HUD | 桌面和触控映射分离，HUD 只消费快照，竖屏有明确引导 | WASD/方向键、鼠标拖镜头、八个移动按钮、横屏主布局 |
| E-08 | `ENG.MEDIA_RUNTIME.GUIYUN` | 资源集成 | 主题材质、图像与程序化音频 | 静态资源相对路径有效，本地协议有降级，生成来源可追溯 | 三张 512 纹理、两张概念表现图、Web Audio 合成提示音 |
| E-09 | `ENG.QA_BRIDGE.GUIYUN` | 可测试性 | 确定性浏览器桥与回归脚本 | 状态可文本化，时间可步进，测试能力不污染正式操作 | `render_game_to_text`、`advanceTime`、`?debug=1` 调试桥 |
| E-10 | `ENG.DEPLOYMENT.GUIYUN` | 发布工程 | 静态发布与 GitHub Pages | 同一目录可本地和线上运行，不依赖运行时 API 或服务端 | 仓库根目录发布；所有 URL 使用相对路径；Pages 可完整通关 |

正式治理信息如下。本文由现有实现反向提取，首次状态为 `draft`。

| 正式规格 ID | 基础规格版本 | 具体规格版本 | 状态 | 责任 Agent | 精确输出路径 | 主要消费方 | 要求层级 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `ENG.PROJECT.GUIYUN` | `1.0.0` | `1.0.0` | `draft` | 工程实现 Agent | `index.html`、`styles.css`、`ui.css`、`vendor/three.min.js`、`vendor/THREE-LICENSE.txt` | 浏览器、静态服务器、发布 Agent | L0、L2、L3 |
| `ENG.RUNTIME.GUIYUN` | `1.0.0` | `1.0.0` | `draft` | 工程实现 Agent | `index.html`、`src/config.js`、`src/core.js` | 全部运行时模块、浏览器 | L0、L1、L2 |
| `ENG.QUEST_FLOW.GUIYUN` | `1.0.0` | `1.0.0` | `draft` | 玩法实现 Agent | `src/config.js`、`src/core.js` | World、Combat、UI、QA bridge | L0、L1、L2、L3 |
| `ENG.WORLD_RUNTIME.GUIYUN` | `1.0.0` | `1.0.0` | `draft` | 世界实现 Agent | `src/world.js` | Core、Combat、Camera、浏览器 QA | L0、L1、L2、L3 |
| `ENG.ENTITY_PRESENTATION.GUIYUN` | `1.0.0` | `1.0.0` | `draft` | 表现实现 Agent | `src/entities.js` | Core、Combat、World、玩家 | L0、L2、L3 |
| `ENG.COMBAT_PARTY.GUIYUN` | `1.0.0` | `1.0.0` | `draft` | 战斗实现 Agent | `src/combat.js`、`src/config.js` | Core、UI、QA bridge、玩家 | L0、L1、L2、L3 |
| `ENG.INPUT_UI.GUIYUN` | `1.0.0` | `1.0.0` | `draft` | UI 实现 Agent | `src/ui.js`、`src/core.js`、`styles.css`、`ui.css` | 玩家、浏览器、移动设备 | L0、L2、L3 |
| `ENG.MEDIA_RUNTIME.GUIYUN` | `1.0.0` | `1.0.0` | `draft` | 资源集成 Agent | `src/materials.js`、`src/audio.js`、`assets/generated/*`、`assets/textures/*` | Entity、World、Core、AudioContext | L0、L2、L3 |
| `ENG.QA_BRIDGE.GUIYUN` | `1.0.0` | `1.0.0` | `draft` | 浏览器 QA Agent | `src/core.js`、`work/*.mjs`、`work/mouse-actions.json` | Playwright、测试客户端、发布门 | L0、L1、L2、L3 |
| `ENG.DEPLOYMENT.GUIYUN` | `1.0.0` | `1.0.0` | `draft` | 发布 Agent | 仓库根目录静态文件、GitHub Pages 站点 | 玩家、浏览器 QA、GitHub Pages | L0、L2、L3 |

## 3. E-01 静态 Web 游戏工程包

### 产物基础规格

- 工程包必须由浏览器直接消费，不把 Node、打包器或服务端列为运行前置。
- HTML、CSS、JavaScript、位图和内置依赖必须使用相对路径并完整随包交付。
- 第三方依赖必须锁定可识别版本并附对应许可，不允许运行时从 CDN 拉取。
- HTML 入口必须先创建画布和启动界面，再按依赖顺序加载脚本。

### 本项目具体规格

- 唯一入口为 `index.html`，语言为 `zh-CN`，主容器为 `#game-shell`，WebGL 画布为 `#game-canvas`。
- 样式输出固定为 `styles.css` 和 `ui.css`；前者管理外壳和标题页，后者管理游戏 HUD 与触控布局。
- Three.js 文件为 `vendor/three.min.js`，其导出常量 `THREE.REVISION` 必须等于 `149`。
- 许可文件为 `vendor/THREE-LICENSE.txt`，不得在压缩、复制或发布时遗漏。
- 项目不要求 `package.json`、锁文件、编译或 bundle；Agent 不得为了小改动擅自引入构建链。

### 消费方与约束

- 浏览器消费 `index.html`；GitHub Pages 和任意静态服务器原样发布仓库根目录。
- 页面加载阶段不得请求运行时 AI API、业务 API、账号接口或 WebSocket。
- 新增源码必须显式进入 `index.html` 的脚本序列；仅把文件放入 `src/` 不算完成集成。

### L0-L3 验收

- L0：`index.html` 可解析，所有 `src`、`href` 文件存在，Three 版本为 r149，许可存在。
- L1：对 `src/*.js` 执行 `node --check`，全部退出码为 0。
- L2：分别从 `file:///.../index.html?debug=1` 与本地 HTTP 地址加载，控制台无错误、资源无 404。
- L3：桌面 1280×720、手机横屏 844×390、手机竖屏 390×844 均进入预期界面。

### Agent 生产指令

1. 先核对入口中的实际加载顺序和第三方版本，再修改消费模块。
2. 保留无构建、无服务端、无外部 CDN 的产品边界。
3. 发布前用两种协议加载同一份源码，不能只验证开发服务器。

## 4. E-02 classic script 启动器与共享命名空间

### 产物基础规格

- 非模块脚本必须具有唯一、可静态审计的加载顺序。
- 上游先声明数据和工厂，下游再实例化；入口组装脚本最后执行。
- 跨文件符号集中在一个项目命名空间，禁止继续增加无前缀全局变量。

### 本项目具体规格

`index.html` 中 JavaScript 的规范顺序固定为：

1. `vendor/three.min.js`
2. `src/config.js`
3. `src/materials.js`
4. `src/entities.js`
5. `src/audio.js`
6. `src/world.js`
7. `src/ui.js`
8. `src/combat.js`
9. `src/core.js`

- `config.js` 建立 `window.GY`，输出 `Stage`、`Config`、`QuestCopy`、`RoleCopy` 和数学辅助函数。
- 各职责模块只向 `window.GY` 添加工厂或查询接口；`core.js` 是唯一直接组装 Scene、Renderer、World、UI、Combat 和 Audio 的入口。
- 模块均采用 IIFE 与严格模式；Three.js 通过全局 `window.THREE` 消费。
- 公开工厂包括 `createWorld`、`createHumanoid`、`createEffects`、`createAudio`、`createUI`、`createCombat`。

### 消费方与约束

- `src/core.js` 消费全部工厂；`entities.js`、`world.js` 消费主题纹理；`combat.js` 消费实体与特效。
- 调整顺序属于破坏性变更，必须同步 L0 引用检查和两协议启动测试。
- `core.js` 之外不得重复创建渲染循环、玩家会话或第二套任务状态。

### L0-L3 验收

- L0：九个脚本恰好按上述顺序出现；每个业务脚本语法通过；没有 ES module 语法和远程 URL。
- L1：固定种子 `20260820` 的战斗和雨效在相同输入与步进下产生相同状态序列。
- L2：入口加载后 `window.THREE`、`window.GY.createWorld`、`window.GY.createCombat` 和 `window.render_game_to_text` 均存在。
- L3：开始按钮只创建一套可玩的运行时，重新开始通过刷新获得干净单局。

## 5. E-03 任务状态与主循环

### 产物基础规格

- 主任务必须有有限状态集合、明确进入副作用、可见目标和唯一完成条件。
- 阶段迁移只能由交互、战斗结果、位置触发或短过场计时触发。
- 落水或战败必须回到最近安全状态，不能造成永久软锁。
- 任务状态不得依赖浏览器持久化或网络响应。

### 本项目具体规格

- `GY.Stage` 固定包含 `TITLE`、`GATE_OFFER`、`ROAD_TO_BRIDGE`、`BRIDGE_CROSSING`、`VILLAGE_ARRIVAL`、`TEMPLE_DEFENSE`、`BOSS_INTRO`、`BOSS_FIGHT`、`RETURN_TO_GATE`、`COMPLETE`。
- 可玩顺序为山门接令、山路清敌、断桥轻功、村落问讯、寺院守卫、首领过场、首领战、归山复命、完成。
- `GY.QuestCopy` 为每阶段提供标题、动作目标和进度短文；`snapshotForUi()` 把运行状态归一为 HUD 快照。
- 检查点至少包含 `GATE`、`BRIDGE_NORTH`、`BRIDGE_MID`、`BRIDGE_SOUTH`、`VILLAGE`、`ARENA`。
- 断桥阶段记录疾冲、空中疾冲、二段跳、六个独立落脚石和最后地表；落水低于 y=-4 时回最近检查点。
- 任务数据只在内存中存在；完成页显示用时和倒地次数，“再历此程”刷新页面重置。

### 输出路径与消费方

- 状态枚举和文案输出：`src/config.js`，由 Core 和 UI 消费。
- 阶段迁移、检查点和主循环输出：`src/core.js`，由 World、Combat、UI 和 QA bridge 消费。
- 主循环用 `requestAnimationFrame` 驱动，单帧 `dt` 上限为 0.05 秒。

### L0-L3 验收

- L0：十个阶段都有唯一常量和目标文案；Core 中不存在未声明的阶段引用。
- L1：确定性步进验证每条合法迁移、落水回退、守卫失败重置和完成后内存状态。
- L2：`work/e2e-playthrough.mjs` 从接令走到 `COMPLETE`，全程控制台错误为 0。
- L3：玩家始终看到当前目标、阶段进度、交互提示和成功/失败反馈，流程可在 10 至 15 分钟人工完成。

### Agent 生产指令

1. 新增阶段时同时修改枚举、文案、进入副作用、触发器、HUD 快照和端到端测试。
2. 不用调试桥代替人工可达路径；调试传送只用于加速验证。
3. 不引入存档、账号或在线会话，除非有新的产品规格批准。

## 6. E-04 固定 3D 世界、地面与碰撞

### 产物基础规格

- 世界模块必须向玩法层提供出生点、区域、地表高度、碰撞修正和镜头遮挡查询。
- 逻辑碰撞与视觉网格分离；装饰模型不能自动成为玩家阻挡。
- 移动修正应支持扫步和沿墙滑动，闪避不能穿过薄障碍。
- 地表查询必须返回稳定类型和可选检查点，不以当前视口改变坐标。

### 本项目具体规格

- `src/world.js` 输出单一连续的栖岚山门、山路、照影河断桥、澄江村和照水寺；寺院 3D 组仍使用内部别名“残月古寺”。
- 玩家水平边界为 x `-27..27`、z `-139..87`；坐标系中 y 向上，z 递减表示从山门前往照水寺。
- `getSpawn(name)` 支持规范出生点与兼容别名；未知名称返回 `null`，返回对象不得暴露内部可变引用。
- `getZone(name)` 至少提供 `GATE`、`MOUNTAIN_ROAD`、`BRIDGE`、`RIVER`、`VILLAGE`、`TEMPLE`、`TEMPLE_ARENA`。
- `getSurface(x,z,stage)` 识别山门、山路、八段断桥平台、村落、寺路、寺院演武场和归途流光桥。
- 八段断桥平台中六段是 `stepping_stone`；归途阶段在河面生成可行走 `spectral_bridge`。
- `resolveMove(previous,next,radius)` 使用分步扫掠、圆形与旋转矩形阻挡，玩家碰撞半径为 0.68。
- 第三人称镜头用 `cameraBlockers` 射线收缩距离，不能进入建筑、山体或门墙内部。

### 输出路径与消费方

- 唯一工程输出为 `src/world.js`。
- Core 消费出生点、地表、区域、碰撞和镜头阻挡；Combat 消费地表高度；QA 消费稳定坐标。
- 世界模块不拥有任务真值，只通过 `setStage(stage)` 控制任务标记和归途桥可见性。

### L0-L3 验收

- L0：出生点、区域、落脚石、任务标记键均唯一；查询 API 全部出现在返回对象中。
- L1：`work/walk-collision-check.mjs` 验证山门墙、沿墙滑动、闪避扫掠、民居、寺殿和 NPC 阻挡。
- L2：`work/collision-check.mjs` 验证山路和寺院中的 AI 地面贴合及战斗单位最小间距。
- L3：断桥必须实际要求疾冲、二段跳和连续落脚；失败后在近处安全点恢复，镜头无明显穿模。

## 7. E-05 程序化人物、武器与即时特效

### 产物基础规格

- 同类角色共享工厂、脚锚和动画协议，通过参数表达阵营、角色和武器差异。
- 武器必须绑定手部枢轴，移动与攻击动画不得导致武器漂浮或穿过躯干。
- 动态对象必须提供释放路径，移除时释放几何和材质。
- 战斗预警、斩击、射线和投射物需有不同的空间形态与颜色语义。

### 本项目具体规格

- `GY.createHumanoid(scene,options)` 生成袍服、头部、发冠、双臂、腰带、武器和可选血条。
- 武器类型为 sword、spear、bow、fan、daggers、claws；枪、弓、扇使用独立握持偏移。
- 人形动画协议为 `move`、`attack`、`down`、默认 idle；`face(target)` 只修改水平朝向。
- 玩家、四队友、影徒和首领均用同一人形工厂，角色差异来自色彩、比例、武器、敌对光环和血条配置。
- `GY.createEffects(scene)` 输出 `ring`、`slash`、`beam`、`projectile`、`update`；特效结束后自动释放。
- 友方核心色为青绿，治疗为象牙金，危险为绯红；同一颜色语义在 UI 和世界特效中保持一致。

### 输出路径与消费方

- 唯一工程输出为 `src/entities.js`。
- Core 消费玩家表现；Combat 消费所有战斗实体和即时特效；Materials 提供布料和木纹贴图。

### L0-L3 验收

- L0：六种武器分支可创建；工厂返回 Core/Combat 使用的全部方法和属性。
- L1：相同动画类型和时间输入不改变角色业务状态，只改变表现节点。
- L2：路战、守卫和首领战反复创建/移除敌人时无异常，实体 y 与当前地表一致。
- L3：五人职业、敌我关系、首领体型、治疗和三类危险反馈在桌面与手机上可辨认，无明显模型穿插。

## 8. E-06 五人队伍、遭遇与首领战

### 产物基础规格

- 战斗模块必须持有战斗实体、命令、波次、首领招式和统计，向外只暴露明确操作和快照。
- AI 队友必须能移动、攻击、受击、倒地和恢复；治疗与集火必须产生可测量差异。
- 首领至少包含三种读条和处理方式不同的招式，伤害结算只能发生一次。
- 随机目标选择必须使用固定种子，以便自动回归复现。

### 本项目具体规格

- 玩家为持剑角色，最大气血 320、真气 100；普通攻击 28，回风式范围伤害 70，穿云刺 105。
- 四名队友为枪卫、弓手、医者和影行；最大气血依次为 620、440、420、480。
- 医者每次群体治疗 95，并附加持续恢复；影行每 9 秒可触发 60 伤害突袭。
- 队伍命令在 `follow` 与 `focus` 间切换；集火使队友主动锁定敌人并将攻击间隔乘以 0.8。
- 山路遭遇固定两名影徒；寺院守卫固定三波，每波 3、4、5 名影徒，三名村民至少一人生存才能进入首领阶段。
- 首领沈烬尘最大气血 7200，普通攻击伤害 42，三种特殊攻击按固定循环出现。
- `断岳回风` 预警 0.95 秒、半径 4.8、伤害 90；`焚脉落印` 预警 1.8 秒、半径 2.3、伤害 125。
- `锁脉夺息` 预警 2.5 秒；破招阈值 260，失败对目标造成 150 并为首领恢复 450，成功令首领眩晕 3 秒。
- 穿云刺在夺息期间贡献 120 破招值；集火队友持续贡献破招值，使队令真实影响胜负。

### 输出路径与消费方

- 战斗实现输出为 `src/combat.js`，共享数值输出为 `src/config.js`。
- Core 调用 `setMode`、`update`、`action`、`toggleCommand`、`resetParty`、`getSnapshot`；UI 只消费 Core 转换后的快照。
- 调试桥可以调用 `damage`、`heal` 和 `spawnEnemy`，正式输入不得直接修改内部 `combat` 对象。

### L0-L3 验收

- L0：三种模式 road/defense/boss、三种首领招式和五个伤害统计来源均可静态定位。
- L1：固定步进下非法冷却操作不重复结算；破招成功、破招失败、治疗、倒地恢复和波次推进结果稳定。
- L2：`work/defense-win.mjs`、`work/boss-win.mjs` 和 `work/e2e-playthrough.mjs` 全部通过，控制台错误为 0。
- L3：不使用调试秒杀时，玩家主动攻击、闪避、技能、治疗和集火能够无重置战胜首领；三种招式均被看见。

### Agent 生产指令

1. 新招式先定义读条、目标、规避/反制、结算和快照字段，再补表现。
2. 不在 UI 文案或特效回调中重算伤害。
3. 修改队友数值后同时验证守卫可存活、首领不会自动胜利、玩家参与仍有意义。

## 9. E-07 第三人称输入与响应式 HUD

### 产物基础规格

- 输入采集、动作分发和 HUD 渲染必须分层；UI 不直接改战斗内部状态。
- 桌面端支持键盘与鼠标，触控端支持移动摇杆、镜头拖动和主要动作按钮。
- 指针取消、失焦和捕获丢失时必须清理按下状态，避免持续移动或持续旋转。
- 竖屏布局必须显示可理解的旋转引导且不产生水平滚动。

### 本项目具体规格

- 桌面规范映射为 WASD/方向键移动、Space 跳跃、Shift 疾冲、J/左键攻击、K/右键闪避、Q/E 技能、R 队令、F/Enter 交互、G 全屏、Esc 暂停。
- 左、中、右键拖动均可控制镜头；左/右键移动不足 4 像素分别触发攻击/闪避，超过阈值只旋转镜头。
- 镜头 yaw 灵敏度为 0.006，pitch 灵敏度为 0.0032，俯仰范围 `-0.5..0.28`。
- 触控输出移动向量和镜头 delta；横屏显示八个动作按钮，竖屏显示“请横屏游玩”。
- HUD 显示任务、玩家气血/真气、四名队友、集火/归队、首领气血/破绽/读条、技能冷却、交互和 toast。
- 当前已知偏差：`src/ui.js` 的桌面按键标签仍把闪避、疾冲、队令标为 Shift、R、G，与 Core 的 K、Shift、R 不一致；修正前该项 L3 不得标记全绿。

### 输出路径与消费方

- 输入与动作路由输出：`src/core.js`；HUD 结构和触控输出：`src/ui.js`；布局输出：`styles.css`、`ui.css`。
- Core 向 UI 提供单向快照和 `onAction`/`onLook` 回调；UI 的 `destroy()` 负责移除自有监听与计时器。

### L0-L3 验收

- L0：入口操作说明、UI 键帽和 Core 映射完全一致；CSS 不引用缺失资源。
- L1：单击和拖动互斥，pointercancel/lostpointercapture/blur 后输入回零。
- L2：`work/mouse-camera.mjs` 验证三键拖镜头及左右单击动作；`work/mobile-e2e.mjs` 验证摇杆、镜头和按钮。
- L3：1280×720 桌面、844×390 横屏和 390×844 竖屏人工检查；无遮挡关键目标、按钮可点、竖屏无横向溢出。

## 10. E-08 主题材质、图像与程序化音频

### 产物基础规格

- 位图资源必须使用相对路径、稳定文件名和合法格式，并记录用途与生成提示词。
- 材质加载失败不得阻断运行；本地协议应提供不依赖网络的安全降级。
- 同一贴图允许复用，但色彩空间、重复方式和各向异性必须集中配置。
- 浏览器音频必须由用户手势解锁，缺少 AudioContext 时游戏仍可玩。

### 本项目具体规格

- 三张主题纹理为 `assets/textures/robe-cloth-512.jpg`、`bluestone-512.jpg`、`dark-cedar-512.jpg`。
- 纹理清单和生成提示词记录在 `assets/textures/README.md`；标题和远景图及提示词位于 `assets/generated/`。
- `src/materials.js` 为 cloth、stone、cedar 建立缓存；使用 RepeatWrapping、sRGBEncoding 和 anisotropy 2。
- HTTP(S) 下使用 `THREE.TextureLoader`；`file://` 下生成固定种子的 128×128 CanvasTexture，状态标记为 `local-safe`。
- `GY.getThemeTextureStatus()` 输出 requested、loaded、fallback 和三项资源状态，供 QA 判断真实加载或本地降级。
- `src/audio.js` 通过 Web Audio 振荡器合成 attack、skill、heal、danger、checkpoint、victory，不加载音频文件。
- AudioContext 只在开始按钮触发 `unlock()` 后创建；浏览器不支持音频时静默退化。

### 消费方与约束

- `src/entities.js` 消费布料和杉木；`src/world.js` 消费青石、布料和杉木；Core 消费纹理状态与音频提示。
- 新资源不得包含文字、标志、水印或可识别的既有游戏图案；不得写入生成凭据。
- HTTP 纹理失败可标记 `fallback`，但 L2 发布门必须报告并修复 404，不能把失败当成功。

### L0-L3 验收

- L0：三张 JPEG 可解码且为 512×512；README 记录用途；所有相对路径存在。
- L1：本地 CanvasTexture 在相同资源名下生成一致图案；状态计数与请求项数量一致。
- L2：`work/live-texture-check.mjs <url>` 验证三项 HTTP 响应、加载状态和控制台；`file://` 验证三项 `local-safe`。
- L3：`work/art-visual-check.mjs` 在山门、断桥、雨夜寺院和手机横屏截图中验证纹理尺度、角色辨识和氛围。

## 11. E-09 确定性浏览器桥与回归脚本

### 产物基础规格

- 浏览器游戏必须提供机器可读状态，描述坐标系、流程、玩家、队伍、敌人、首领、视口和控制。
- 自动化时间步进应使用固定小步长并与实时 RAF 互斥，防止双重更新。
- 破坏性调试能力只能在显式 debug 参数下开放，正式 URL 不暴露快捷通关入口。
- 自动化必须监听 `console.error` 与 `pageerror`，任何未登记错误均阻塞放行。

### 本项目具体规格

- `window.render_game_to_text()` 始终返回 JSON 字符串，不返回循环对象、Three 节点或 DOM。
- `window.advanceTime(ms)` 首次调用后切换确定性模式，以 1/60 秒步进，单次最多 7200 步并立即渲染。
- `?debug=1` 开放 `window.__GY_TEST__`，包含 start、action、setStage、teleport、clearEnemies、healParty、setInvulnerable、damageBoss、damagePlayer、advance、state。
- 文本状态必须包含任务阶段、目标、检查点、玩家坐标与冷却、断桥记录、队友、村民、敌人、首领、治疗量、伤害统计、视口、镜头、纹理和氛围。
- `work/` 是当前机器上的本地 QA 目录并被 `.gitignore` 排除，不属于 GitHub Pages 发布包；若要把测试作为团队稳定门禁，需另行批准纳入版本库。

### 精确测试输出

- 完整流程：`work/e2e-playthrough.mjs`
- 守卫/首领平衡：`work/defense-win.mjs`、`work/boss-win.mjs`
- 实体/世界碰撞：`work/collision-check.mjs`、`work/walk-collision-check.mjs`
- 桌面/移动输入：`work/mouse-camera.mjs`、`work/mobile-e2e.mjs`
- 材质/视觉：`work/live-texture-check.mjs`、`work/art-visual-check.mjs`
- 短输入序列：`work/mouse-actions.json`

### L0-L3 验收

- L0：状态 JSON 可解析，调试 API 仅在 debug URL 存在，测试脚本语法通过。
- L1：相同初态、动作序列和步进时长产生相同 questStage、HP、伤害统计和首领招式记录。
- L2：九项现有回归脚本按各自范围通过；HTTP 与 `file://` 均至少执行一次核心流程。
- L3：关键阶段截图与状态一一对应，截图中不存在与文本状态冲突的阶段、目标或布局。

### Agent 生产指令

1. 新业务状态必须同时进入文本桥和对应断言，不以截图代替数值验证。
2. 自动化只能通过公开动作或显式调试 API 操作，不从 Playwright 直接改闭包变量。
3. 报告必须区分真实玩家路径与调试加速路径。

## 12. E-10 静态发布与 GitHub Pages

### 产物基础规格

- 发布产物必须与本地验收产物同源，不在部署阶段二次生成业务代码。
- 所有引用保持相对路径，使项目可部署在域名子路径和本地目录。
- 发布页不得依赖服务器路由、环境变量、密钥、运行时 API 或跨域 CDN。
- 发布前必须验证入口、静态资源、核心流程、控制台和目标设备布局。

### 本项目具体规格

- 仓库地址为 `https://github.com/Canace22/codex-game-demo.git`。
- GitHub Pages 规范地址为 `https://canace22.github.io/codex-game-demo/`，从默认分支根目录发布。
- `index.html`、`styles.css`、`ui.css`、`src/`、`vendor/`、`assets/` 是上线必要集合。
- `work/`、`outputs/`、本地截图和调试中间文件不进入页面运行依赖。
- 正式页面不附加 `debug` 参数；QA 可在同源 URL 临时附加 `?debug=1` 读取测试桥。

### L0-L3 验收

- L0：必要集合均被 Git 跟踪；不存在指向工作目录绝对路径的运行时资源引用；许可文件被发布。
- L1：发布前提交与本地验收提交一致，状态机与战斗确定性结果不因协议改变。
- L2：Pages 返回 200，三张纹理返回 200，Three 版本为 r149，控制台/网络错误为 0。
- L3：在线地址从接任务走到击败首领、返回交付和 `COMPLETE`；桌面鼠标与手机横屏均通过。

## 13. 工程产物依赖顺序

```text
ENG.PROJECT.GUIYUN
  -> ENG.RUNTIME.GUIYUN
      -> ENG.QUEST_FLOW.GUIYUN
      -> ENG.WORLD_RUNTIME.GUIYUN
          -> ENG.ENTITY_PRESENTATION.GUIYUN
          -> ENG.COMBAT_PARTY.GUIYUN
      -> ENG.INPUT_UI.GUIYUN
      -> ENG.MEDIA_RUNTIME.GUIYUN
  -> ENG.QA_BRIDGE.GUIYUN
  -> ENG.DEPLOYMENT.GUIYUN
```

变更必须沿依赖方向传播：

- 脚本名或公共 `GY` 接口变更，要同步入口、全部消费者、QA bridge 和静态发布检查。
- 阶段名变更，要同步任务文案、World 标记、Combat 模式、UI 快照和完整流程测试。
- 世界坐标或地表变更，要同步出生点、检查点、AI 贴地、镜头阻挡、碰撞和断桥测试。
- 战斗数值或首领招式变更，要同步 HUD 快照、平衡测试、完整流程和 L3 读招检查。
- 键位变更，要同步标题页、桌面 HUD 键帽、Core 映射、鼠标测试和移动端等价动作。
- 资源路径变更，要同步材质注册、消费材质、HTTP 响应检查、`file://` 降级和 Pages 发布。

## 14. 工程完成定义

一个工程批次只有同时满足以下条件才可标记完成：

1. 对应 `ENG.*.GUIYUN` 具体规格的输出路径均存在且语法有效。
2. 上游接口与下游消费引用闭合，classic script 顺序未被破坏。
3. 要求的 L0-L3 检查全部通过，失败项不得用历史截图或人工描述替代。
4. `index.html` 在 `file://` 和 HTTP(S) 下都能启动，正式运行不调用服务端或 AI API。
5. 真实浏览器可从山门接令走到首领战、返回交付并进入 `COMPLETE`。
6. 桌面、手机横屏和竖屏提示均符合输入与布局规格，控制台错误为 0。
7. 资源来源、第三方许可、测试命令、结果和已知偏差都写入本批次验收记录。
