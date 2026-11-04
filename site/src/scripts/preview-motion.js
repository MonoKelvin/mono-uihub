// 卡片和详情宽高比不一致：容器可以变形，截图像素始终按同一比例缩放。
export function coverRect(rect, size, zoom = 1) {
  const scale = Math.max(rect.width / size.width, rect.height / size.height) * zoom;
  const width = size.width * scale, height = size.height * scale;
  return {
    left: rect.left + (rect.width - width) / 2,
    top: rect.top + rect.height * (1 - zoom) / 2,
    width, height,
  };
}

const mix = (a, b, p) => a + (b - a) * p;
const blendRect = (a, b, p) => Object.fromEntries(['left', 'top', 'width', 'height'].map((key) => [key, mix(a[key], b[key], p)]));
export const NO_BORDER = { top: 0, right: 0, bottom: 0, left: 0 };

export function snapshotFrames({ from, to, layout, imageSize, paintFrom, paintTo, borderFrom = NO_BORDER, borderTo = NO_BORDER }) {
  const image = [], crop = [];
  // 一次性预计算交给 WAAPI；不在 rAF 中逐帧读布局或修改尺寸。
  for (let n = 0; n <= 64; n++) {
    const p = n / 64;
    const rect = blendRect(from, to, p);
    const paint = blendRect(paintFrom, paintTo, p);
    const sx = rect.width / layout.width, sy = rect.height / layout.height;
    const x = (paint.left - rect.left) / sx, y = (paint.top - rect.top) / sy;
    image.push({
      offset: p,
      transform: `translate(${x}px, ${y}px) scale(${paint.width / imageSize.width / sx}, ${paint.height / imageSize.height / sy})`,
    });
    const borders = ['top', 'right', 'bottom', 'left'].map((side) => mix(borderFrom[side], borderTo[side], p) / (side === 'left' || side === 'right' ? sx : sy));
    crop.push({ offset: p, clipPath: `inset(${borders.map((value) => value + 'px').join(' ')})` });
  }
  return { image, crop };
}
