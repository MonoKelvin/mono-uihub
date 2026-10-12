---
name: image-purify
description: 让 AI 生成的图片干净的提示词技能。解决出图发脏、碎、噪点、鳞片感 / 蛇皮纹、涂抹感、塑料味、满屏杂物这类"一眼 AI"的质量问题。提供一套通用底座词 + 按风格大类（写实 / 二次元 / Q 版 / 插画 / 拟物 / 2.5D / 3D 渲染 / 电影 / 风格化 / 古风 / 线性图标 / 产品）划分的叠加词包，以及对已有脏图做 img2img 修复的三档强度词。词表存于同目录 purify.json，`tools/image-forge/generate.py` 每次生图都会自动叠加。
---

# image-purify — 干净出图词表

## 这个技能解决什么

AI 出图最常见的废片原因不是"画错了"，而是**脏**：

- 表面布满细碎噪点、彩噪、色斑；
- 材质上浮出一层规律的**鳞片感 / 蛇皮纹 / 锁甲纹**（高频微纹理失控）；
- 画面碎、满屏小碎片、漂浮颗粒、看不出用途的杂物；
- 边缘振铃、发白光晕、过锐；
- 另一个极端：被磨成塑料 / 蜡像 / 涂抹感；
- 背景堆满无意义杂物和乱码文字。

这些都是**工艺缺陷**，与画什么无关，所以可以用一套**与内容无关的通用词**一次性压住。
本技能就是这套词：**只谈画面工艺，不谈画面内容**。内容永远由调用方自己写。

> 核心约束：这里的词**只能叠加，不能替代**。调用方的主体描述照写，本技能的词追加在后面。
> 本技能也**不负责定风格**——风格包只是把"这类风格怎样才算干净"说清楚，不规定画什么。

## 脏从哪来：先对症

| 症状 | 真实原因 | 对策 |
|---|---|---|
| 鳞片感 / 蛇皮纹 / 锁甲纹 | 细节词堆叠（`ultra detailed` / `intricate` / `8k`），模型被迫把每个像素填满高频纹理 | 删掉细节形容词，改用**材质名词**；叠 `restrained controlled detail` + 负向 `scale-like texture` |
| 细碎噪点 / 彩噪 | 渲染未收敛、低步数、放大残留 | 叠 `noise-free clean rendering` + `fully converged` 类词 |
| 画面碎、满屏小物件 | 一句里塞了多个主体或多个场景 | **一个主体 + 一个材质 + 一个光源 + 一个背景**，其余全删 |
| 边缘发光晕、过锐 | 锐化词 + 高对比词叠加 | 叠 `high clarity without over-sharpening`，负向 `over-sharpening` `ringing halos` |
| 塑料 / 蜡像 / 涂抹 | 去噪过头，或"光滑"词用力过猛 | 风格包里写清**具体材质**（哑光陶瓷 / 拉丝铝 / 丝绸），不要只说 smooth |
| 背景脏、有乱码文字 | 背景没被指定，模型自由发挥 | 显式写背景（纯色 / 渐变 / 空无一物）+ 负向 `cluttered background` `garbled text` |
| 透明图有灰底、棋盘格、残影 | 模型照搬了"透明背景"的视觉表现 | 用下方「透明通道叠加项」 |

## 五条准则

1. **少即是净。** 一个主体、一个材质、一个光源、一个背景。每多一个元素，脏的概率翻倍。
2. **用材质名词替代细节形容词。** 写 `brushed aluminium` / `matte ceramic` / `raw silk`，不写 `ultra detailed`。前者告诉模型"长什么样"，后者只告诉它"再多画点"——那就是鳞片感的来源。
3. **背景必须显式指定。** 不写背景 = 允许模型堆垃圾。
4. **负向词只打工艺缺陷，不打内容。** `noise` / `over-sharpening` 可以；`no cat` 不行（那是内容，写在正向里）。
5. **先减再加。** 出图脏时第一反应是**删词**，不是加"干净"词。

## 词源：purify.json

完整词表在同目录 **`purify.json`**，是**唯一词源**：

- `base` — 通用底座，任何图都叠；
- `styles.*` — 12 个风格大类的叠加词；
- `extras.transparent` — 透明通道叠加项；
- `repair.{strong,medium,light}` — img2img 修复三档；
- `avoid_in_user_prompt` — 写提示词时的慎用词（脏源）。

`tools/image-forge/generate.py` 直接读这个文件，**每次生图自动叠加**。改词改 json 即可，下次生图就生效；本文档的词表与它保持一致，**两边一起改**。

---

## A. 生图（text2img）：必须叠加

### 装配顺序（固定）

```
<主体内容，由你自己写>. <风格包正向>. <通用底座正向>. Avoid: <通用底座负向 + 风格包负向>.
```

用 `tools/image-forge/generate.py` 时**这一步是自动的**：你只给主体内容和 `--style`，脚本负责拼装。
手写给其他生图工具（Midjourney / SD / 即梦等）时按上面的顺序自己拼，负向词放各自的负向位（`--no` / negative prompt）。

### 通用底座（任何图都叠，不要再加长）

正向：

```
clean professional image, one clear subject, uncluttered composition, smooth even surfaces with continuous gradients, crisp clean edges, restrained controlled detail, consistent physical materials, soft even lighting, calm balanced colors, noise-free clean rendering, high clarity without over-sharpening, generous empty space around the subject
```

负向：

```
noise, grain, color noise, speckles, scale-like texture, fish-scale pattern, snakeskin pattern, repetitive micro-pattern, crunchy high-frequency detail, over-sharpening, ringing halos, dirty smudges, dirty patches, dust and scratches, blotchy shadows, muddy colors, fragmented debris, floating particles, cluttered background, random clutter, garbled text, watermark, signature, jpeg artifacts, upscaling artifacts, plastic waxy surface, smeared texture, oversaturated glow, blurry low-resolution details
```

> 底座刻意只有这么长。再往里塞"干净"同义词只会稀释权重，反而更脏。

### 风格包（选且只选一个）

每包都是"这类风格怎样才算干净"的定义。**不可叠两个**——风格互斥是涂抹感的头号成因。

#### 写实摄影 `photoreal`
人像、实景、真实材质。症状对位：塑料皮肤、蜡像感、HDR 脏。
- 正向：`natural photographic realism, true-to-life material response, believable skin and fabric micro-structure, single soft key light from a large softbox, accurate white balance, medium-format clarity, shallow depth of field used sparingly`
- 负向：`cgi look, plastic skin, wax figure sheen, airbrushed featureless face, heavy HDR tonemapping, illustration or cartoon look, hazy veiling glare`

#### 二次元 `anime`
日式动画 / 赛璐璐。症状对位：线稿毛边、阴影涂抹、乱高光。
- 正向：`clean anime illustration, flat cel shading in two or three steps, confident line art with even line weight, large clean color areas, simple clear highlight shapes, harmonious bright palette, clean uncluttered background`
- 负向：`sketchy doubled outlines, broken jittery lines, muddy airbrushed shading, scattered random highlights, paper grain texture, photoreal face, 3d render look, over-rendered skin texture`

#### Q 版 `chibi`
吉祥物、萌系小人。症状对位：比例漂移、配饰碎、硬阴影。
- 正向：`cute chibi proportions, oversized head and simple rounded body, clean closed silhouette, flat soft shading with one shadow tone, few simple shapes, even thick outline, clean pastel palette`
- 负向：`realistic proportions, tiny cluttered accessories, busy pattern detail, harsh dark shadows, noisy texture, dramatic photographic lighting`

#### 插画 `illustration`
编辑插画、扁平手绘。症状对位：做旧噪点、纸纹、风格混杂。
- 正向：`editorial illustration, clean flat vector-like shapes, limited palette of three to four colors, deliberate negative space, one consistent texture treatment, hand-drawn but controlled strokes`
- 负向：`grunge overlay, paper fiber texture, scattered specks, noisy gradient mesh, photographic texture, 3d shading, mixed incompatible styles`

#### 拟物 `skeuomorphic`
拟物图标、单体物件。症状对位：双阴影、内发光、噪点渐变。
- 正向：`skeuomorphic object, one clearly named material, smooth molded form with clean bevels, soft studio reflection, one consistent highlight, gentle contact shadow, simple neutral backdrop`
- 负向：`heavy inner glow, double conflicting shadows, grunge scratched metal, noisy gradients, dust on the surface, rainbow specular fringing`

#### 2.5D / 等距 `iso25d`
等距场景、轴测插画。症状对位：透视崩、漂浮碎件。
- 正向：`clean isometric 2.5D scene, true isometric angle, simple geometric blocks, flat surfaces with soft ambient occlusion, limited palette, tidy spacing between objects, plain flat ground`
- 负向：`broken perspective, stray floating objects, tiny scattered props, noisy surface texture, heavy black outlines, overlapping clutter`

#### 3D 渲染 `render3d`
C4D / Blender 风格。症状对位：渲染噪点、萤火虫亮点、凹凸贴图鳞片。
- 正向：`clean 3D render, matte or satin physically based materials, soft area-light studio setup, smooth subdivided geometry, clean ambient occlusion, low-contrast gradient backdrop, fully converged noise-free render`
- 负向：`render noise, path-tracing fireflies, grainy global illumination, caustic speckles, bump and displacement artifacts, oily specular highlights, blotchy subsurface scattering, faceted low-poly shading`

#### 电影感 `cinematic`
场景叙事画面。症状对位：胶片颗粒、镜头脏、泛光过曝。
- 正向：`cinematic single-frame composition, one dominant light direction, clean filmic contrast with readable shadows, clean optics, muted graded palette, calm staging with real depth`
- 负向：`heavy film grain, dust and scratch overlay, lens dirt and smudges, excessive bloom, crushed teal-orange grade, smoke haze clutter, light leaks, chromatic aberration`

#### 风格化 `stylized`
海报、几何、潮流视觉。症状对位：做旧叠层、网点噪声、故障效果脏。
- 正向：`bold stylized shapes, poster-like simplification, one consistent stroke system, flat planes with a single accent color, clean solid background, strong readable silhouette`
- 负向：`texture overlays, halftone noise, distressed grunge, glitch artifacts, chromatic aberration, busy competing motifs`

#### 古风 / 国风 `guofeng`
东方古典。症状对位：墨点飞溅、纸纹噪点、堆纹样。
- 正向：`Chinese classical aesthetic, clean ink wash and mineral pigment feel, generous empty space, restrained silk jade and wood sheen, soft even daylight, limited traditional palette, elegant sparse ornament`
- 负向：`splattered ink specks, paper fiber noise, muddy washes, cluttered ornament, gold glitter particles, anachronistic modern props, oversaturated red and gold`

#### 线性图标 / UI 素材 `lineicon`
单色线性图标、界面小图形。症状对位：线宽不匀、路径断、多余装饰。
- 正向：`clean line icon, uniform stroke weight, geometric construction on a square grid, closed even shapes, generous padding inside the frame, single flat color, centered balanced silhouette`
- 负向：`varying stroke weight, broken open paths, stray dots, gradients and inner shadows, text labels, perspective or 3d depth, extra decorative flourishes`

#### 产品精修 `product`
电商实物、硬件展示。症状对位：指纹灰尘、雾感、反射杂乱。
- 正向：`commercial product shot, true product color, immaculate flawless surface, even soft lighting with clean specular highlights, seamless clean backdrop, accurate proportions with a crisp clean branding area`
- 负向：`fingerprints, dust and lint, scratches, hazy film on the surface, cluttered reflections, duplicate or garbled logos, uneven messy shadows`

### 透明通道叠加项 `extras.transparent`

要**带 alpha 的抠图素材**时，在风格包之外**再叠这一组**（`generate.py` 在透明模式下自动加）：

- 正向：`subject fully isolated on a transparent background, completely empty alpha around the subject, clean continuous cutout edge, crisp anti-aliased silhouette, whole subject inside the frame with even margin`
- 负向：`checkerboard pattern, white or grey backdrop, background scenery, ground shadow or drop shadow, matte fringe, color halo around edges, semi-transparent dirt, subject cropped at the frame edge`

> 棋盘格和灰底必须显式负向排除——否则模型会把"透明"画成透明的样子。

### 慎用词：提示词里的脏源

写主体描述时**不要**出现这些（它们正是鳞片感与噪点的来源）：

```
ultra detailed, hyper detailed, intricate details, insanely detailed, extremely detailed,
8k, 16k, masterpiece, best quality, trending on artstation,
film grain, dust particles, floating bokeh particles, grunge texture, texture overlay,
HDR, bloom, lens flare, sharpen, extreme contrast
```

想要"细节丰富"就**指名道姓地写那个细节**（"袖口有三道明线"），不要用"更多细节"去许愿。

### 在本仓库怎么调用

`tools/image-forge/generate.py` 已内置本词表，**生图时自动叠加，不需要你手写任何干净词**：

```bash
# 必须带 --style；只写主体内容
python tools/image-forge/generate.py \
  --style skeuomorphic \
  "a matte ceramic desk lamp, warm ivory body, brass switch, soft side light" \
  ui/<page>/assets/lamp.png

# 先看拼装结果再决定要不要花钱生成
python tools/image-forge/generate.py --style anime --dry-run "..." out.png

# 查可用风格
python tools/image-forge/generate.py --list-styles
```

规则：

- **必须显式传 `--style`**。不传只会叠通用底座，风格类脏病（线稿毛边、渲染噪点……）压不住；脚本会给出提示。
- 风格拿不准时就近取：真实物件 → `product` / `photoreal`；界面装饰图形 → `lineicon` / `stylized`；带透视的小场景 → `iso25d`。
- `--no-purify` **只用于对照实验**，交付用图不准用。

---

## B. 修图（img2img）：已有脏图的修复

> **仅在用户明确要求修某张图时才走这一节。** 日常生图不需要：已经生成的图就让它这样，不主动回读、不主动返工。

拿到一张已经脏了的图（噪点密集、表面涂抹、背景杂乱、鳞片感），按三步走。

### 第一步：解析结构（彻底无视当前画质）

只记录它"**本该是**"的样子：

- **类别**：人物肖像 / 产品静物 / 场景空间 / 图形素材；
- **主体**：骨架、姿态、轮廓、关键结构件（配饰、按键、檐角）；
- **空间**：背景元素、前后景关系、光从哪来。

### 第二步：为每个区域指派真实物理材质

把"涂抹感"替换成可验证的材质描述——不要只说"干净"：

- **背景**：显式写成纯色 / 平滑渐变 / 空无一物，并强调完全无噪点（防止模型照搬原图的脏背景）；
- **人物**：有弹性的皮肤、细微毛孔、成束的真实发丝；
- **产品**：拉丝铝 / 阳极氧化 / 哑光塑料 / 高透玻璃，各自的高光行为写清；
- **场景**：叶脉清晰、混凝土粗糙但不脏、金属有方向性反射。

### 第三步：拼重绘提示词

模块顺序：`[主体] → [物理材质] → [环境与背景] → [光影] → [镜头与调性]`，逗号连成一段。然后按脏的程度叠一档修复词：

**修复-强**（噪点密集 / 鳞片明显 / 表面已被涂抹）
- 正向：`aggressive cleanup repaint, remove all noise, speckles and dirty patches, rebuild smooth continuous surfaces, dissolve scale-like and snakeskin micro-pattern, stabilize unstable high-frequency texture, clean color transitions and smooth gradients, crisp refined edges, preserve the original composition, lighting and shadow structure`
- 负向：通用底座负向 + `changed lighting, relighting, changed composition, changed subject identity, over-smoothed plastic surface, washed-out flattened details`

**修复-中**（局部脏、阴影发花、材质略涂抹）
- 正向：`moderate cleanup repaint, reduce visible noise, speckles and color noise, even out blotchy shading, keep the original material texture recognizable, clean color transitions, stable refined surface detail, preserve the original composition, lighting and shadow structure`
- 负向：通用底座负向 + `over-smoothed plastic surface, lost material texture, changed lighting, changed composition`

**修复-弱**（整体可用，只想去细碎噪点）
- 正向：`very light cleanup pass, remove only noise and dirty speckles, preserve all fine micro details, preserve original contrast and color relationships, preserve the original composition, lighting and shadow structure`
- 负向：通用底座负向 + `over-smoothing, lost micro detail, flattened texture, changed lighting, changed composition, restyled look`

### 两条强制追加句

- **主体有人物时**追加：不参考原图主体（皮肤 / 表面 / 材质）已有的劣质涂抹纹理，严格按提示词重新生成无明显瑕疵的真实物理肌理；但光影、透视必须与原图完全一致并无缝融合。
- **主体是产品时**追加：精准还原产品真实颜色与材质质感，无杂质雾感；清除指纹、灰尘、划痕与瑕疵，使其崭新洁净；光线均匀柔和，无杂乱阴影，高光自然通透。

> 修复的底线：**可以改画质，不可以改内容。** 构图、光位、主体身份变了就是失败，重做而不是接受。

---

## C. 出图验收（仅作参考，默认不执行）

> **当前阶段：不做验收。** 生成即交付 —— **不要回读生成的图片去分析画质，也不要因为画质不满意就重生成**。
> 读图耗 token，重生成耗额度，而本技能的全部价值就在于**在生成前**把干净词叠进去，而不是在生成后挑错返工。
> 下面这份清单只是说明"干净"的标准是什么，用来反向校准词表；**只有用户明确要求检查某张图时**才走一遍。

放大到 100% 时，一张干净的图应当满足：

1. 平滑表面上没有规律的鳞片 / 蛇皮纹 / 锁甲纹；
2. 暗部没有色斑、彩噪、发花；
3. 边缘没有白边、光晕、锯齿、过锐；
4. 没有说不出用途的碎片、漂浮颗粒、乱码文字；
5. 背景干净，且**是提示词里指定的那个**背景；
6. 主体**只有一个**、完整在画面内；
7. 材质没有被磨成塑料 / 蜡（去噪过头的反向失败）；
8. 透明图：alpha 边缘连续，没有灰底、棋盘格、残留投影。

哪条经常不达标，就把对应的词补进 `purify.json` 的相应风格包 —— **改词表，而不是重抽卡**。

## 维护

- 改词只改 `purify.json`，并同步更新本文档对应段落（两者必须一致）。
- 新增风格大类：在 `styles` 里加一个键（附 `aliases` / `label` / `positive` / `negative`），本文档加一节；脚本无需改动。
- 底座保持短。要压住新出现的脏病，优先加到对应风格包，而不是往底座里塞。
