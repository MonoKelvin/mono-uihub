# Image Forge (`tools/image-forge/`)

两个互补的 Python 工具：

- **`generate.py`**：通过 OpenAI 兼容的 `/images/generations` 接口生成图片，自动叠加 `skills/image-purify/purify.json` 的干净图像提示词。
- **`matte.py`**：对已有图片去背。**默认优先调用图生图模型编辑**，在线服务不可用、返回无透明通道或比例异常时，才回退到本地 ONNX 抠图。

所有工具的环境变量统一从**项目根目录 `.env`** 读取，模板为根目录 `.env.example`；工具目录不再维护独立 env 文件。

## 配置

```bash
# 在仓库根目录执行一次
cp .env.example .env
```

| 变量 | 必需 | 说明 |
|---|---|---|
| `IMAGE_API_BASE_URL` | 在线时 | OpenAI 兼容 Base URL；Agnes 为 `https://apihub.agnes-ai.com/v1` |
| `IMAGE_API_KEY` | 在线时 | Bearer token，不要提交到 Git |
| `IMAGE_MODEL` | 在线时 | 生图模型，也作为抠图模型的默认值 |
| `IMAGE_MATTE_MODEL` | 否 | 单独覆盖抠图模型，如 `agnes-image-2.5-flash` |
| `IMAGE_MATTE_SIZE` | 否 | 在线输出档位，默认 `2K`；可选 `1K` / `2K` / `3K` / `4K` |
| `IMAGE_MATTE_TIMEOUT` | 否 | 在线请求超时秒数，默认 `240` |
| `IMAGE_MATTE_OFFLINE_MODEL` | 否 | 离线模型，默认 `auto` |
| `IMAGE_FORGE_GH_PROXY` | 否 | ONNX 下载代理；置空则直连 GitHub |
| `IMAGE_NEGATIVE_PARAM` | 否 | 仅网关支持顶层 `negative_prompt` 时设为 `1` |
| `PURIFY_PACK` | 否 | 覆盖 `purify.json` 路径 |

## 抠图：在线优先，离线兜底

```bash
# 默认在线图生图抠图；主体描述可选，但越明确越不容易误删
python tools/image-forge/matte.py input.jpg output.png \
  --subject "画面左侧的人物，包括全部细碎发丝"

# 查看实际发送的标准提示词，不请求 API
python tools/image-forge/matte.py input.jpg output.png --dry-run \
  --subject "红色汽车"

# 明确跳过在线服务
python tools/image-forge/matte.py input.jpg output.png --offline-only

# 在线失败时直接报错，不允许离线回退
python tools/image-forge/matte.py input.jpg output.png --no-fallback
```

### 在线链路

以 Agnes Image 2.5 Flash 为例，请求发送至：

```text
POST <IMAGE_API_BASE_URL>/images/generations
```

图生图参数遵循[官方文档](https://www.agnes-ai.com/en/docs/agnes-image-25-flash)：

- 原图以 Data URI Base64 放在 `extra_body.image` 数组中；
- `extra_body.response_format` 设为 `b64_json`，也兼容解析返回的 `data[0].url`；
- `size` 使用 `1K`—`4K` 档位，`ratio` 自动选择最接近原图的支持比例；
- 标准提示词要求只移除背景，不重绘、不改色、不改变构图，并保留发丝与半透明边缘；`--subject` 会附加明确的抠图主体。

**透明校验与两种保真策略**：Agnes 文档并未承诺一定输出 alpha，因此工具会实际检查返回 PNG 的透明通道，无透明像素或主体为空都视为失败。默认采用模型返回的完整 RGBA 结果，允许主体颜色、纹理和尺寸存在轻微偏差，但提示词仍明确要求不要重绘或修改主体。需要严格保留原始像素时，传 `--preserve-source-colors`：此时仅采用在线 alpha，与原图 RGB 重新合成；若返回图宽高比偏差超过 3%，则拒绝强行对齐并回退离线。

### 离线链路

```bash
# auto：subject 含人物/发丝提示时选 birefnet-portrait，否则选 birefnet-general
python tools/image-forge/matte.py input.jpg output.png --offline-only

# 轻量快速模式（旧默认，适合临时草稿，不推荐精细发丝）
python tools/image-forge/matte.py input.jpg output.png --offline-only --model u2netp
```

| 参数 | 默认值 | 作用 |
|---|---:|---|
| `--model` | `auto` | `birefnet-general` / `birefnet-portrait` / `isnet-general-use` / `u2net` / `u2netp` |
| `--feather` | `0` | 额外高斯模糊；默认关闭，避免吞掉发丝 |
| `--guide-radius` | `0` | 边缘引导滤波半径；`0` 按图尺寸自适应 |
| `--guide-eps` | `0.001` | 引导滤波正则项；越小越贴近原图边缘 |
| `--decontaminate` | `0.65` | 半透明边缘的背景色去污染强度，范围 `0`—`1` |
| `--no-guided-filter` | 关闭 | 禁用边缘引导滤波，仅用于对照排查 |
| `--no-trim` | 关闭 | 保留完整画布，不按主体裁剪 |

BiRefNet 在 1024×1024 输入上生成软 alpha，明显优于旧的 320px `u2netp`。引导滤波沿原图边缘细化蒙版，并保留弱 alpha 发丝；去污染根据 `C = αF + (1-α)B` 估算边缘前景色，减轻原背景色描边。裁剪使用低 alpha 阈值，避免细发丝被当作噪点移除。

模型首次使用自动下载到 `models/cache/`。BiRefNet 文件较大且 CPU 推理较慢；这是质量优先的兜底策略，不是实时批处理方案。权重校验使用 rembg 官方发布页公布的 MD5。

依赖：

```bash
pip install onnxruntime pillow numpy opencv-python
```

## 文生图

```bash
python tools/image-forge/generate.py --style lineicon \
  "a sci-fi HUD line icon, single cyan stroke" \
  ui/<page>/assets/icon-hud.png

python tools/image-forge/generate.py --list-styles
python tools/image-forge/generate.py --style anime --dry-run "..." out.png
```

`generate.py` 只需要 Python 标准库。它先请求 `transparent: true`，不支持时再降级为普通图片；这与 `matte.py` 的「必须具有真实 alpha，否则回退」策略不同。

模型来源与许可见 `models/NOTICE`。不要引入禁止再分发或限制商用的权重。
