# 生成素材记录

两张素材均使用 Codex 内置图像生成功能生成，只从用户提供的两张概念图提取山水纵深、建筑材质、五人队伍轮廓和冷暖色彩关系；没有复制角色、门派、地标、界面或其他现有游戏设计。

## `title-hero.png`

用途：开始与结算界面的 16:9 主视觉。

最终提示词：

```text
Use case: stylized-concept
Asset type: original browser 3D wuxia MMORPG title / hero background
Primary request: Create a completely original cinematic wide hero illustration of a five-person wuxia adventuring party overlooking the full route of one playable quest through a vast misty mountain valley. The route should read naturally in depth: an original mountain gate and sect compound on a near ridge, a winding stone mountain road, a visibly broken wooden bridge across a gorge and river, a small riverside village, and a ruined temple at the far end. The five original heroes are seen mostly from behind at a scenic overlook: a sword-bearing player in the center, plus four distinct companions whose silhouettes clearly suggest a long-spear controller, a bow archer, a healer-support carrying a medicine gourd or small hand drum, and an agile light-footed infiltrator with short blades. Their clothing, weapons, hairstyles, buildings, and insignia must be wholly original, with no recognizable copyrighted franchise designs.
Scene/backdrop: monumental layered granite peaks, pine forests, waterfalls, mist bands, river reflections, high mountain paths, restrained original Chinese-inspired architecture integrated into cliffs.
Style/medium: premium painterly-realistic game key art, cinematic environment concept art, rich atmospheric depth, elegant brush texture over believable 3D lighting; inspired only by the broad design language of expansive Chinese mountain epics and moody martial-arts ensemble adventures.
Composition/framing: very wide 16:9 landscape, crop-safe for responsive title screens; party grouped in the lower-middle third without touching edges; major landmarks separated and readable across the valley; preserve generous open sky and mist around the upper third for UI overlay; strong foreground/midground/background layers; no border.
Lighting/mood: early dawn after rain, cool blue-jade shadows and silver mist with selective warm amber lantern glows, hopeful but dangerous expedition mood.
Color palette: slate blue, pine green, weathered stone gray, mist white, muted teal, small warm amber accents, restrained oxblood cloth.
Materials/textures: wet granite, aged dark timber, weathered cloth, moss, pine needles, river spray, subtle atmospheric haze.
Constraints: exactly five human party members; all content must be original; no text anywhere; no calligraphy; no logos; no emblems resembling existing games; no watermark; no UI; no modern objects; no duplicated people; no close-up faces; keep important content safe within the central 80 percent.
Avoid: direct imitation of any existing game, iconic faction uniforms, recognizable character designs, crowded armies, photomontage, excessive fantasy armor, neon saturation, legible signs, typography.
```

## `distant-valley.png`

用途：3D 画布后的远山气氛底图；使用 CSS 静态加载，确保 `file://` 直接打开时不会触发 WebGL 跨域污染。

最终提示词：

```text
Use case: stylized-concept
Asset type: lightweight Three.js distant valley panorama backdrop
Primary request: Create a completely original ultra-wide distant mountain-valley environment plate for a browser 3D wuxia game. The image must function as a quiet far-distance backdrop behind simple low-poly gameplay geometry: long layers of granite peaks, pine-covered ridges, a winding silver-blue river, thin waterfalls, soft mist bands, and a few tiny original mountain gates, village roofs, stone paths, and ruined temple silhouettes embedded naturally in the terrain.
Scene/backdrop: panoramic highland river valley with at least five depth layers, from muted dark pine ridges through blue-gray granite spires to very pale distant mountains; no dominant central landmark.
Subject: environment only; tiny architecture is subordinate to landscape and never forms a recognizable real or fictional landmark.
Style/medium: painterly-realistic game matte painting, restrained cinematic concept art, optimized visually as a distant skybox-like background for lightweight Three.js.
Composition/framing: very wide panoramic landscape with a stable horizon and broad side-to-side flow; no close foreground objects; no people or animals; important silhouettes stay away from the extreme edges; left and right edges use similar pale blue mist, soft mountain contours, and matching luminance so the image remains visually compatible when cropped, mirrored, or wrapped; avoid abrupt edge landmarks; preserve open airy sky above the ridgelines; usable at both 16:9 and extra-wide crops.
Lighting/mood: calm late-morning light after rain, diffuse cloud-filtered sun, quiet heroic scale, atmospheric perspective.
Color palette: mist white, cool blue-gray, faded jade, slate, desaturated pine green, tiny muted warm roof accents only.
Materials/textures: weathered granite faces, distant pine texture, reflective river ribbon, fine mist, subtle watercolor-like brush grain without noisy detail.
Constraints: completely original environment; environment only; no people; no prominent foreground; no readable signs; no text; no calligraphy; no logos; no watermark; no UI; no border; no modern objects; no recognizable copyrighted buildings or faction designs; edge values and mist density should match for seamless-looking crop transitions.
Avoid: direct imitation of any existing game, central hero object, close architecture, hard black silhouettes at the edges, dramatic lightning, heavy orange sunset, neon color, duplicated obvious motifs, photomontage, fisheye distortion, typography.
```
