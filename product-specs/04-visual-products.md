# 04 视觉、美术、UI 与特效产物规格

## 1. 文档目的与适用范围

本文把《归云录：江岸危局》当前已接入浏览器运行时的视觉成果，整理为可生产、可注册、可消费、可验收的产物规格。

范围包括：

- 标题主视觉与远景气氛图。
- 云灰袍服、旧青石、熏黑杉木三张主题纹理。
- Three.js 程序化角色、武器、场景建筑、水面与远山。
- “晴岚山谷”探索氛围与“雨夜邪寺”战斗氛围。
- 任务、队伍、气血、技能、首领预警、触控与旋转提示 UI。
- 攻击、治疗、地面预警、破招、轻功与归途流光桥等程序化特效。
- 图像生成来源、运行时加载规则与视觉验收证据。

不在本文范围内：战斗数值、任务状态机、音频和发布流程。它们分别由设计、工程和质量规格约束。

本文只登记当前仓库事实，不复制参考库中的项目实例、技术栈或资源命名。

当前规格基线：Git 提交 `913f8441a201d1067cc211261455a4953cb83828`。

## 2. 视觉生产原则

1. 世界、门派、人物、服装、武器、敌人和 UI 必须保持原创。
2. 概念图只提供山水纵深、第三人称队伍构图、冷暖关系和战斗空间语言。
3. 生成图不得包含文字、书法、Logo、UI、边框或水印。
4. 可交互状态必须由 HTML、CSS 或 Three.js 图元生成，不烘焙进背景图。
5. 视觉素材必须同时适用于桌面、手机横屏和 `index.html` 静态启动。
6. 手机端优先控制纹理尺寸、透明层数量、阴影成本和同屏特效数量。
7. 生成来源、完整提示词、后处理和最终尺寸必须落盘记录。
8. 产物的“已接入”与“建议门禁”必须分开陈述。

视觉生产链：

```text
项目风格锚点
  -> 单一用途生成请求
    -> 原始位图与提示词记录
      -> 尺寸、编码与体积后处理
        -> 静态路径接入或程序化材质绑定
          -> file:// / HTTP / Pages 消费
            -> 状态快照 + 真实浏览器截图验收
```

## 3. 四级产物目录

| 正式规格 ID | 产物类型 | 产物子类型 | 基础规格 | 《归云录》具体产物 |
| --- | --- | --- | --- | --- |
| `VIS.STYLE.GUIYUN` | 视觉规范 | 全局风格锚点 | 固定题材、媒介、材质、镜头、色板、禁用项 | 晴岚山谷、雨夜邪寺、低多边形实时角色、青玉友方反馈 |
| `VIS.KEYART.GUIYUN` | 生成式美术 | 标题主视觉 | 16:9、安全构图、无文字/UI、水印 | `assets/generated/title-hero.png`，1672×941 PNG |
| `VIS.BACKDROP.GUIYUN` | 生成式美术 | 远景气氛底图 | 超宽远景、边缘雾值相近、无人、无文字 | `assets/generated/distant-valley.png`，1915×821 PNG |
| `VIS.TEXTURE.GUIYUN` | 材质美术 | 可平铺主题纹理 | 正交、均匀光照、无烘焙阴影、无标记 | 3 张 512×512 JPEG，布料/青石/杉木 |
| `VIS.CHARACTER.GUIYUN` | 角色美术 | 程序化低多边形角色 | 脚底统一、职责轮廓和武器可辨、材质可复用 | 玩家、四名队友、村民、影徒、沈烬尘 |
| `VIS.WORLD.GUIYUN` | 场景美术 | 程序化江湖路线 | 地标与可走空间一致，明暗阶段可切换 | 栖岚山门、山路、断桥、澄江村、照水寺 |
| `VIS.VFX.GUIYUN` | 实时特效 | 战斗与轻功反馈 | 事件可辨、完成后销毁、颜色语义稳定 | 环、斩光、弹道、光束、预警、雨丝、流光桥 |
| `VIS.UI.GUIYUN` | UI | 桌面 HUD 与叙事层 | 目标、队伍、角色、首领、动作分区清楚 | 任务顶栏、队伍面板、气血真气、首领条、技能环、提示 |
| `VIS.MOBILE.GUIYUN` | UI | 手机横屏与竖屏适配 | 横屏完整操作，竖屏明确引导，不横向溢出 | 摇杆、镜头区、8 个动作按钮、旋转设备层 |
| `VIS.EVIDENCE.GUIYUN` | 验收证据 | 浏览器截图与状态 | 截图尺寸、运行状态、加载状态和错误记录可追溯 | `outputs/` 与 `work/test-artifacts/art-visual/` 证据集 |

治理信息如下。本文由当前实现反向提取，具体规格在产品负责人评审前统一保持 `draft`。

| 具体规格 ID | 基础规格 ID | 版本 | 状态 | 责任 Agent | 主要输出或证据 | 主要消费方 |
| --- | --- | --- | --- | --- | --- | --- |
| `VIS.STYLE.GUIYUN` | `VIS.STYLE` | `1.0.0` | `draft` | `visual_agent` | 本文风格锚点、颜色令牌 | 全部 VIS/ENG 产物 |
| `VIS.KEYART.GUIYUN` | `VIS.KEYART` | `1.0.0` | `draft` | `visual_agent` | `assets/generated/title-hero.png` | `styles.css`、开始/完成界面 |
| `VIS.BACKDROP.GUIYUN` | `VIS.BACKDROP` | `1.0.0` | `draft` | `visual_agent` | `assets/generated/distant-valley.png` | `#game-shell` CSS 背景 |
| `VIS.TEXTURE.GUIYUN` | `VIS.TEXTURE` | `1.0.0` | `draft` | `visual_agent` | `assets/textures/*.jpg`、来源说明 | `src/materials.js`、实体与世界材质 |
| `VIS.CHARACTER.GUIYUN` | `VIS.CHARACTER` | `1.0.0` | `draft` | `visual_agent` | `src/entities.js` 程序化造型 | Core、Combat、玩家 |
| `VIS.WORLD.GUIYUN` | `VIS.WORLD` | `1.0.0` | `draft` | `visual_agent` | `src/world.js` 程序化场景 | 玩家、World/Camera QA |
| `VIS.VFX.GUIYUN` | `VIS.VFX` | `1.0.0` | `draft` | `visual_agent` | `src/entities.js`、`src/world.js` 特效 | Combat、Core、玩家 |
| `VIS.UI.GUIYUN` | `VIS.UI` | `1.0.0` | `draft` | `visual_agent` | `styles.css`、`ui.css`、`src/ui.js` | UI 快照、桌面玩家 |
| `VIS.MOBILE.GUIYUN` | `VIS.MOBILE` | `1.0.0` | `draft` | `visual_agent` | `ui.css`、触控 DOM | 手机横竖屏玩家 |
| `VIS.EVIDENCE.GUIYUN` | `VIS.EVIDENCE` | `1.0.0` | `draft` | `browser_qa_agent` | `work/test-artifacts/art-visual/*` | QA、发布验收 |

## 4. `VIS.STYLE.GUIYUN` 全局风格锚点

### 4.1 基础规格

- 环境用层叠花岗岩、松林、云雾、江水、旧木和青石建立山水纵深。
- 实时模型采用低多边形体块，依靠颜色、武器和站位区分角色职责。
- 标题图采用写实感较强的游戏概念图；运行时保留轻量、清楚、可读的造型。
- 日景强调云白、松绿、青灰和暖木；夜战强调墨蓝、雨灰、湿石与暗绯红。
- 友方技能使用青玉色，治疗使用象牙金，危险使用暗绯红。
- 镜头默认第三人称，从队伍后方看向任务路线或首领空间。

### 4.2 当前颜色令牌

| 令牌 | 值 | 消费位置 |
| --- | --- | --- |
| cloud-ivory | `#E7E3D7` | 布料高光、文字与治疗辅色 |
| pine-green | `#263E34` | 晴岚山谷地表、阴影底色 |
| celadon-gray | `#6F9690` | 山雾、屋瓦、友方中性色 |
| cedar-brown | `#6E4A32` | 梁柱、桥板、兵器柄 |
| warm-amber | `#C98745` | 灯火、任务标记、少量强调 |
| battle-ink-blue | `#172631` | 雨夜邪寺暗部 |
| rain-gray | `#39505B` | 夜战空气与材质过渡 |
| wet-stone | `#4A5356` | 寺院战场地面 |
| friendly-teal | `#65CFC9` | 友方技能与队伍状态 |
| healing-ivory | `#F2D791` | 治疗、恢复与正向反馈 |
| danger-crimson | `#9D3039` | 首领、危险预警和伤害 |

代码中的近似运行值以 `src/config.js`、`src/world.js`、`styles.css` 和 `ui.css` 为准。

### 4.3 Agent 生产指令

- 先复制完整风格锚点，再追加单张素材的用途、构图和材质要求。
- 新角色必须声明职责、武器、主色、轮廓和与现有五人队的区分点。
- 新场景必须声明可走区域、镜头朝向、前中远景和 UI 安全区。
- 视觉 Agent 不得修改战斗判定去迁就画面；空间冲突应交由集成 Agent 联合处理。

### 4.4 验收标准

- 角色和场景不存在可识别的现有游戏门派、服装、图标或地标。
- 同屏五人可凭颜色、武器和站位识别职责。
- 日景与夜景有明确变化，但 UI、角色和预警在两种环境下均可读。
- 生成素材无文字、标志和水印。

## 5. `VIS.KEYART.GUIYUN` 标题主视觉

### 5.1 当前产物

| 字段 | 当前值 |
| --- | --- |
| 路径 | `assets/generated/title-hero.png` |
| 实际格式 | 8-bit RGB PNG，非交错 |
| 实际尺寸 | 1672×941 |
| 文件大小 | 2,580,551 bytes |
| 用途 | 开始界面与完成界面的全屏 `cover` 背景 |
| 消费端 | `styles.css` 的 `.start-screen` |
| 生成记录 | `assets/generated/README.md` |

画面必须同时包含五名原创队员、山门、山路、断桥、江边村落和远端寺院，并把主要人物放在下部中央安全区。

当前 CSS 叠加左右墨色渐变、底部暗层与半透明开始卡，图片本身不承载标题、按钮或操作说明。

### 5.2 生产与验收

- 目标比例为 16:9；允许生成服务产生少量比例偏差，但 `cover` 裁切不能损失五人或主路线。
- 上部天空和雾区保留 UI 呼吸空间；四边不得放唯一地标。
- 人数必须恰好为五人，武器轮廓分别表达剑、枪、弓、治疗道具和短兵突袭。
- 100% 查看无异常肢体、重复人物、可读符号或生成水印。
- 1280×720、844×390 和竖屏旋转层下分别检查裁切。

## 6. `VIS.BACKDROP.GUIYUN` 远景气氛底图

### 6.1 当前产物

| 字段 | 当前值 |
| --- | --- |
| 路径 | `assets/generated/distant-valley.png` |
| 实际格式 | 8-bit RGB PNG，非交错 |
| 实际尺寸 | 1915×821 |
| 文件大小 | 2,131,900 bytes |
| 用途 | Three.js 画布后的静态远景 |
| 消费端 | `#game-shell` CSS 背景 `center/cover` |
| 生成记录 | `assets/generated/README.md` |

### 6.2 消费合同

- 远景只做大气层，不参与 WebGL 碰撞、深度或交互。
- 通过 CSS 加载是有意设计，用于避免 `file://` 图片上传 WebGL 的跨域污染。
- 左右边缘保持相近雾值和轮廓密度，适应宽屏裁切。
- 近景不能出现人物，避免与程序化角色比例冲突。

## 7. `VIS.TEXTURE.GUIYUN` 主题纹理库

### 7.1 当前库存

| 纹理键 | 路径 | 最终尺寸/格式 | 大小 | 默认 repeat | 当前用途 |
| --- | --- | --- | ---: | ---: | --- |
| `cloth` | `assets/textures/robe-cloth-512.jpg` | 512×512 JPEG | 147,805 B | 2×2 | 玩家、队友、敌人、NPC 袍服与山门布幡 |
| `stone` | `assets/textures/bluestone-512.jpg` | 512×512 JPEG | 84,201 B | 4×4 | 山路、庭院、石阶、落脚石、寺院地面 |
| `cedar` | `assets/textures/dark-cedar-512.jpg` | 512×512 JPEG | 78,343 B | 3×3 | 山门、民居、断桥、寺院梁柱、兵器柄 |

三张原始生成图均为 1254×1254 PNG；使用系统 `sips` 缩放至 512×512、JPEG 质量 82，总体积 310,349 bytes。

完整提示词、用途与目视检查记录在 `assets/textures/README.md`。

### 7.2 运行时合同

- `src/materials.js` 维护唯一资源表、缓存和加载状态。
- HTTP 与 GitHub Pages 使用真实 JPEG；`file://` 使用 128×128 同色系 Canvas 安全纹理。
- 两条路径都使用 `RepeatWrapping`、sRGB encoding 和 anisotropy 2。
- `getThemeTextureStatus()` 返回 `requested`、`loaded`、`fallback` 和三项状态。
- 纹理请求失败时保持材质可见，不把异步加载失败扩散为游戏软锁。

### 7.3 建议门禁

- 对图像边缘做 2×2 拼接检查，确认无明显接缝。
- 验证 magic bytes、像素尺寸、色型和文件大小预算。
- 桌面与手机各检查近景纹理密度，避免摩尔纹和高频闪烁。
- HTTP/Pages 必须显示 `loaded=3`；`file://` 必须显示三项 `local-safe`。
- 新增纹理后，手机总纹理体积建议仍控制在 1 MiB 以内。

## 8. `VIS.CHARACTER.GUIYUN` 程序化角色

### 8.1 基础造型合同

- 角色由圆柱袍、肩臂枢轴、球形头部、发冠、腰封和武器组成。
- 袍服采用 `cloth` 纹理并叠加职责色；武器柄采用 `cedar` 纹理。
- 角色根节点脚底贴合世界地表；模型高度由统一局部坐标定义。
- 双臂挂在肩部枢轴，武器绑定右手外侧握点，攻击时不得穿过躯干。
- 移动、呼吸、攻击、倒地由程序化变换表现，不依赖骨骼动画资源。
- 敌方光环和血条是独立图元，不烘焙进角色材质。

### 8.2 具体身份

| 身份 | 职责 | 主色/强调 | 武器轮廓 | 视觉要点 |
| --- | --- | --- | --- | --- |
| 少侠 | 玩家剑客 | 蓝灰 / 青玉 | 长剑 | 居中、克制、与队友明度区分 |
| 陆沉舟 | 枪卫控场 | 灰青 / 暖金 | 长枪 | 高竖线、近战前排 |
| 闻雁 | 远程弓手 | 靛蓝 / 暖棕 | 弓 | 弧形武器、后排 |
| 苏叶 | 治疗辅助 | 象牙 / 药青 | 扇/治疗道具 | 亮色、恢复光环 |
| 越青崖 | 轻功突袭 | 深青 / 明青 | 双短兵 | 紧凑轮廓、侧后站位 |
| 蚀心影徒 | 普通敌人 | 炭黑 / 暗绯红 | 剑 | 低明度、敌方血条 |
| 沈烬尘 | 首领 | 墨紫黑 / 暗绯红 | 爪 | 1.32 倍体型、敌意环 |

### 8.3 验收标准

- 山路与寺院角色 y 值贴合地面，脚底不沉入或悬空。
- 最近角色中心距不小于 1.5 米的质量门禁通过。
- 六类武器的握点、挥击和静止姿态无明显穿模。
- 治疗、倒地、复起和集火状态有可见反馈。

## 9. `VIS.WORLD.GUIYUN` 场景视觉

### 9.1 路线与地标

| 区域 | 世界范围/锚点 | 视觉内容 | 主要材质 |
| --- | --- | --- | --- |
| 栖岚山门 | `z=57..87` | 双柱门楼、双层屋顶、石阶、布幡、灯笼 | 杉木、青石、布料 |
| 山门石径 | `z=9.8..60.5` | 弯曲山路、松林、路灯、远山 | 青石、松绿、旧木 |
| 断桥与河谷 | `z=-31..10` | 河面、断板、6 个窄落脚石、峭壁 | 河青、杉木、青石 |
| 澄江村 | `z=-82..-30.4` | 五座民居、破屋、村民、临水平台 | 旧木、灰墙、屋瓦 |
| 照水寺 | 圆心 `(0,-116)` | 20 米战场、残殿、断柱、灯座 | 湿青石、暗木、灰墙 |

`src/world.js` 中寺院 3D 组仍使用内部别名“残月古寺”；玩家可见名称与视觉规格统一采用“照水寺”。

道路带状几何具有显式 UV，纵向使用三次重复，避免整条山路只读取一个纹素。

### 9.2 晴岚山谷

- 雾色 `0x91aaa7`，指数密度 0.0085。
- 天光为浅云白，地面反射为深松绿。
- 主方向光为暖象牙色，曝光 1.08。
- 远景、程序化山体、道路和松林共同建立前中远层次。
- 标记使用暖金八面体与光环，区别于青色技能反馈。

### 9.3 雨夜邪寺

- 寺院防守、首领登场和首领战切换至 `rainy-temple`。
- 雾色变为 `0x233743`，天光变为灰蓝，地面反射变为墨蓝黑。
- 主光转为冷灰蓝，曝光降至 0.78，清屏不透明度升至 0.62。
- 150 条线段组成低开销雨丝，跟随玩家位置移动。
- 雨丝目标 opacity 为 0.48；离开寺院战斗后平滑恢复日景。
- 危险预警保持暗绯红，友方技能保持青玉，治疗保持象牙金。

### 9.4 场景验收

- 可走地面、可见地面和碰撞代理保持一致。
- 山门、民居、寺院墙柱、树干与 NPC 不允许玩家穿越。
- 断桥水域不得存在不可见地面；落脚石必须可辨但不发光过度。
- 夜景雨丝不遮挡首领预警、角色血条或手机按钮。
- 远景不得与近景地平线产生明显断层。

## 10. `VIS.VFX.GUIYUN` 程序化特效

| 子效果 | 实现 | 色彩语义 | 清理要求 |
| --- | --- | --- | --- |
| 轻功/技能环 | `RingGeometry` 或 `CircleGeometry` | 青玉/角色技能色 | duration 结束销毁 |
| 剑招斩光 | 局部 `RingGeometry` 弧段 | 暖白或青色 | 0.32 秒淡出销毁 |
| 远程弹道 | 球体沿起终点插值 | 弓手蓝、治疗金 | 到点销毁 |
| 锁脉光束 | 圆柱连接首领与目标 | 紫色 | 每次短脉冲更新 |
| 首领范围预警 | 地面环/填充面 | 暗绯红 | 伤害结算后移除 |
| 受击/治疗飘字 | DOM 浮字 | 红/金/青 | 动画结束回收 |
| 任务标记 | 八面体+圆环 | 暖金 | 随阶段显隐 |
| 归途流光桥 | 11 块半透明桥片 | 明青绿 | 仅返程阶段显示 |
| 雨丝 | 150 条 LineSegments | 冷灰蓝 | 非寺院阶段隐藏 |

验收必须证明三种首领攻击在视觉上可辨，“焚脉落印”有地面躲避提示，“锁脉夺息”有目标光束与破招反馈，“断岳回风”体现近身范围威胁。

## 11. `VIS.UI.GUIYUN` 桌面 UI

### 11.1 信息层级

- 顶部中央：任务名、目标、阶段进度。
- 左侧：四名队友姓名、职责、气血和集火/归队状态。
- 左下：玩家气血、真气和剑客标识。
- 顶部首领区：姓名、身份、气血、破绽条和当前预警。
- 右下：普通攻击、闪避、回风式、穿云刺、轻功、跳跃等动作环。
- 右侧：时序 Toast；近交互时显示交互提示。

### 11.2 当前视觉合同

- 标题字体优先使用宋体/中文衬线系统字体；状态和小字使用系统无衬线字体。
- 面板以半透明墨绿色为底，暖金描边，青玉为正向状态。
- 目标面板不能长期遮挡玩家或首领中心。
- 冷却数字、技能名、按键和禁用态必须同时可辨。
- 首领预警不能只依靠颜色，必须同时显示招式名称或进度。

## 12. `VIS.MOBILE.GUIYUN` 跨端构图

### 12.1 手机横屏

- 基准逻辑视口为 844×390。
- 左下摇杆尺寸为 `clamp(102px,18vh,138px)`。
- 右侧 42% 区域是镜头拖动区。
- 右下动作区包含 8 个按钮：攻击、闪避、技能一、技能二、跳跃、疾冲、队令、交互。
- 队伍面板压缩到 128–174px，四名队友都必须保留。
- 任务区宽度不超过 48vw；首领区不超过 51vw。
- 玩家气血区避开摇杆，按钮避开安全区 inset。

### 12.2 手机竖屏

- 基准逻辑视口为 390×844。
- 显示全屏“请横屏游玩”提示和旋转后的手机图形。
- 提示层可拦截输入，不允许底层按钮误触。
- 页面 `scrollWidth - innerWidth` 必须小于等于 0。
- 竖屏只保证提示可读，不要求继续操作 3D 任务。

## 13. 文件、命名与来源合同

| 产物 | 格式 | 路径规则 | 来源要求 |
| --- | --- | --- | --- |
| 主视觉 | RGB PNG | `assets/generated/<purpose>.png` | README 记录完整 prompt |
| 远景图 | RGB PNG | `assets/generated/<purpose>.png` | README 记录完整 prompt |
| 主题纹理 | 512×512 JPEG | `assets/textures/<material>-512.jpg` | README 记录源尺寸、后处理、prompt |
| 程序化角色 | JavaScript | `src/entities.js` | 角色身份与职责来自项目配置 |
| 场景材质 | JavaScript | `src/materials.js`、`src/world.js` | 材质 key 与静态路径唯一 |
| UI | HTML/CSS/JavaScript | `index.html`、`styles.css`、`ui.css`、`src/ui.js` | 不把文字烘焙进图片 |

凭据不得进入提示词记录、README、截图元数据或源码。任何图像生成只发生在开发期，运行时不得调用 AI API。

## 14. `VIS.EVIDENCE.GUIYUN` 当前视觉证据

| 证据路径 | 尺寸/格式 | 当前证明范围 |
| --- | --- | --- |
| `outputs/归云录-标题主视觉.png` | 1672×941 PNG | 标题主视觉原图 |
| `outputs/美术优化-晴岚山门.png` | 1280×720 PNG | 日景、青石、杉木、布料和桌面 HUD |
| `outputs/美术优化-雨夜寺院.png` | 1280×720 PNG | 雨夜氛围、寺院战场、首领与队伍 |
| `outputs/归云录-实机首领战.png` | 1280×720 PNG | 首领 HUD 与战斗空间 |
| `outputs/归云录-手机横屏.png` | 1688×780 PNG | 844×390 逻辑视口、DPR 2 的横屏 UI |
| `outputs/归云录-鼠标镜头预览.png` | 1280×720 PNG | 第三人称镜头与桌面构图 |
| `work/test-artifacts/art-visual/desktop-gate-state.json` | JSON | `misty-valley`、三纹理 `loaded` |
| `work/test-artifacts/art-visual/desktop-bridge-state.json` | JSON | 断桥状态、检查点与纹理状态 |
| `work/test-artifacts/art-visual/desktop-temple-state.json` | JSON | `rainy-temple`、首领/队伍站位 |
| `work/test-artifacts/art-visual/mobile-temple-state.json` | JSON | 844×390 雨夜寺院运行态 |

四份 `art-visual/*-errors.json` 当前均为空数组。

`outputs/` 与 `work/` 当前是开发机上的忽略目录，不属于可克隆发布证据。以上文件用于说明现有取证范围；在迁入版本化 `verification/` 前，`VIS.EVIDENCE.GUIYUN` 保持 `draft`。

## 15. AI Agent 标准视觉工作单

```yaml
spec_id: VIS.TEXTURE.GUIYUN
version: 1.0.0
status: draft
purpose: temple-and-world-material
style_anchor: "晴岚山谷 + 雨夜邪寺 + 原创低多边形武侠"
input_reference:
  - approved_project_visual_spec
generation:
  subject: "单一材质表面"
  composition: "正交、无透视、全幅、可平铺"
  lighting: "均匀中性光，无烘焙阴影"
  constraints:
    - no_text
    - no_logo
    - no_watermark
    - no_iconic_faction_motif
outputs:
  - assets/textures/new-material-512.jpg
postprocess:
  size: 512x512
  color_space: sRGB
  quality: 82
registration:
  - src/materials.js
consumed_by:
  - src/world.js
acceptance:
  - file_signature
  - dimensions
  - seamless_2x2_review
  - http_texture_loaded
  - file_local_safe_fallback
  - desktop_and_mobile_runtime_review
evidence:
  - work/test-artifacts/art-visual/<state>.json
  - outputs/<approved-preview>.png
```

## 16. 分层验收矩阵

| 层级 | 自动检查 | 浏览器/目视检查 | 放行条件 |
| --- | --- | --- | --- |
| L0 文件 | magic、尺寸、格式、体积、路径存在 | 单图 100% 检查 | 无错扩展名、无水印/文字 |
| L1 注册 | key 唯一、路径可达、加载状态 | 场景材质非空 | HTTP `loaded`，file `local-safe` |
| L2 集成 | `render_game_to_text` 纹理/氛围状态 | 日景、夜景、断桥、角色、HUD | 无断层、穿模或遮挡 |
| L3 跨端 | viewport 与 overflow 断言 | 1280×720、844×390、390×844 | 操作和提示均可读 |
| 发布附加门 | Pages 资源 HTTP 200 | 线上关键画面 | 无资源错误，来源记录齐全 |

## 17. 当前已验证事实与建议补充门禁

### 17.1 已验证

- 两张生成 PNG 与三张纹理文件的实际尺寸、格式和文件大小已盘点。
- HTTP 与 GitHub Pages 的三张纹理返回 200，Content-Type 为 `image/jpeg`。
- 当前艺术回归状态显示三张纹理均 `loaded`，无 page error 或 console error。
- 1280×720 日景山门、断桥、雨夜寺院以及 844×390 手机雨夜寺院已有真实截图。
- 角色、武器、地面贴合和角色分离已有专项回归。

### 17.2 建议门禁，当前证据不足

- 尚无统一的 2×2 纹理无缝拼接自动报告。
- 尚无 GPU/帧率/显存预算与低端手机性能证据。
- 尚无 1920×1080、超宽屏和高 DPR 平板的正式视觉矩阵。
- 当前脚本主要收集 console error；建议下一批同时收集 warning、网络失败与 404。
- 当前低多边形角色身份主要依赖色块和武器；后续若增加服装层次，应补同屏轮廓评审，避免失去手机可读性。
- 生成素材来源已记录完整 prompt，但尚无批次号、生成服务版本和原始文件 checksum 账本。

## 18. 主要来源索引

| 来源 | 用途 |
| --- | --- |
| `assets/generated/README.md` | 标题与远景的完整生成提示词和用途 |
| `assets/textures/README.md` | 三张纹理的源尺寸、后处理、提示词和目视检查 |
| `src/materials.js` | 纹理注册、file 安全纹理和加载状态 |
| `src/entities.js` | 程序化角色、武器挂点和即时特效 |
| `src/world.js` | 场景地标、材质消费、道路 UV、水面和流光桥 |
| `src/core.js` | 镜头、灯光、雾、雨丝、氛围切换和视觉状态桥 |
| `src/config.js` | 角色职责色、技能色和任务文案 |
| `src/ui.js`、`ui.css` | HUD、手机操作与旋转提示 |
| `styles.css` | 标题主视觉、远景和开始卡构图 |
| `notes.md` | 各阶段视觉改动、问题修复和浏览器结果 |
| `outputs/*.png` | 用户可见视觉预览 |
| `work/test-artifacts/art-visual/*` | 视觉回归截图、状态和错误记录 |
