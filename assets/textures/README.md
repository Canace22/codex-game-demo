# 原创主题纹理

本目录包含为浏览器 3D 原型生成并压缩的原创贴图。三张图均由 Codex 内置 `image_gen` 独立生成，源图为 1254 × 1254 PNG；最终文件使用系统 `sips` 缩放为 512 × 512、JPEG 质量 82，兼顾 Three.js r149 兼容性和移动端体积。

## robe-cloth-512.jpg

- 用途：玩家和队友袍服，可叠加不同材质颜色。
- 最终文件：`robe-cloth-512.jpg`（512 × 512 JPEG）
- 原始输出：1254 × 1254 PNG
- 完整提示词：

```text
Use case: stylized-concept
Asset type: seamless tileable albedo texture for low-poly browser-game wuxia character robes, square
Primary request: original neutral handwoven ramie and cotton cloth, fine irregular fibers, subtle layered crossweave, restrained hand-dyed cloud-gray base with faint celadon threads and sparse natural weathering; designed to remain tintable under different character material colors
Style/medium: game-ready painterly PBR-style albedo texture, readable at 512 px, low contrast, no baked lighting
Composition/framing: strict orthographic flat surface filling the entire square, true seamless tiling on both axes, even distribution, no focal motif, no perspective
Lighting/mood: neutral flat overcast reference, completely even illumination, no cast shadows, no highlights
Color palette: pale cloud gray, celadon gray, tiny warm flax flecks, compatible with the Clear Mist Valley and rain-dark ruined temple wuxia theme
Materials/textures: fine ramie fibers and cotton crossweave, subtle handmade irregularity
Constraints: original material design; seamless edges; no text; no symbols; no embroidery; no logos; no watermark; no seams; no folds; no buttons; no objects
Avoid: ornate brocade, recognizable faction motifs, high-contrast pattern, directional lighting, gradients, photographic fabric folds, hard stains, edge framing
```

## bluestone-512.jpg

- 用途：山路、村道、破庙地面和首领战庭院。
- 最终文件：`bluestone-512.jpg`（512 × 512 JPEG）
- 原始输出：1254 × 1254 PNG
- 完整提示词：

```text
Use case: stylized-concept
Asset type: seamless tileable albedo texture for low-poly browser-game mountain roads, riverside village paths, ruined temple floor and boss courtyard, square
Primary request: original worn irregular blue-gray bluestone paving, subtly varied rectangular and polygonal stones with rounded worn edges, thin charcoal joints, sparse muted moss, restrained mineral flecks and a few fine hairline cracks; suitable for both misty daylight and rain-dark night
Style/medium: game-ready painterly PBR-style albedo texture, readable at 512 px, restrained detail, no baked lighting
Composition/framing: strict orthographic top-down flat surface filling the entire square, true seamless tiling on both axes, evenly distributed stone scale, no single focal stone, no border, no perspective
Lighting/mood: completely neutral flat overcast reference, even illumination, no cast shadows, no directional highlights, no wet reflections
Color palette: celadon blue-gray, rain gray, charcoal joints, very sparse muted pine moss, compatible with the Clear Mist Valley and rain-dark ruined temple wuxia theme
Materials/textures: dense weathered Chinese mountain bluestone, gently chipped edges, subtle age without ruin clutter
Constraints: original material design; seamless edges; no text; no symbols; no carvings; no logos; no watermark; no objects; no leaves
Avoid: checkerboard repetition, bright green moss, deep black holes, strong perspective, directional light, heavy cracks, iconic motifs, decorative medallions, edge framing
```

## dark-cedar-512.jpg

- 用途：门楼、寺院梁柱、栏杆与武器柄。
- 最终文件：`dark-cedar-512.jpg`（512 × 512 JPEG）
- 原始输出：1254 × 1254 PNG
- 完整提示词：

```text
Use case: stylized-concept
Asset type: seamless tileable albedo texture for low-poly browser-game temple beams, gate pillars, railings and weapon shafts, square
Primary request: original aged smoke-darkened Chinese cedar surface with fine mostly straight natural grain, subtle longitudinal fibers, muted warm sap streaks, tiny restrained weathering and slight soot variation; a continuous wood surface without visible plank boundaries so it works on beams, cylinders and weapon handles
Style/medium: game-ready painterly PBR-style albedo texture, readable at 512 px, restrained contrast, no baked lighting
Composition/framing: strict orthographic flat surface filling the entire square, true seamless tiling on both axes, continuous fine grain, no board seams, no knots used as focal points, no border, no perspective
Lighting/mood: completely neutral flat overcast reference, even illumination, no cast shadows, no highlights, no glossy reflection
Color palette: dark cedar brown, smoke black-brown, muted warm walnut and tiny amber fiber accents, compatible with the Clear Mist Valley and rain-dark ruined temple wuxia theme
Materials/textures: close-grain aged cedar, smooth hand-worked surface with subtle wear
Constraints: original material design; seamless edges; no text; no symbols; no carvings; no logos; no watermark; no nails; no objects; no distinct planks
Avoid: obvious plank boundaries, large knots, bright orange wood, high contrast stripes, directional lighting, carved motifs, branded marks, edge framing
```

## 目视检查

- 袍服布料：纤维尺度均匀、对比度低、无高辨识图案，可用于材质染色。
- 旧青石：青灰石块和缝隙清晰，苔色克制，无雕纹、文字和场景物件。
- 熏黑杉木：连续细纹且无明显木板边界，适用于梁柱和圆柱形武器柄。
- 三张图均无文字、标志、水印或已知门派符号；边缘未出现明显框线。
