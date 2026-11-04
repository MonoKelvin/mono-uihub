import { configureFrameViewport } from './embedded-viewport.js';
import { createPrototypeShadow } from './prototype-shadow.js';

const SHADOWS = new WeakMap();
export const prototypeFrameShadow = (iframe) => SHADOWS.get(iframe)?.element;

// 初次展示和详情内切换共用同一加载判定，iframe 的 load 不能单独证明 HTTP 成功。
export function loadPrototypeFrame(item, host, signal) {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-label', item.name);
  iframe.allow = 'fullscreen';
  iframe.style.opacity = '0';
  iframe.style.pointerEvents = 'none';
  iframe.inert = true;
  const ready = new Promise((resolve, reject) => {
    let loaded = false, reachable = false, settling = false, done = false;
    const fail = (error) => {
      if (done) return;
      done = true;
      reject(error);
    };
    const check = async () => {
      if (done || !loaded || !reachable || settling) return;
      settling = true;
      // 给真实文档两次绘制机会，再允许调用方交叉淡化。
      await new Promise((resolve) => requestAnimationFrame(resolve));
      await new Promise((resolve) => requestAnimationFrame(resolve));
      if (done || signal.aborted) return;
      const shadow = createPrototypeShadow(iframe, item.details?.type);
      if (shadow) SHADOWS.set(iframe, shadow);
      done = true;
      resolve(iframe);
    };
    const abort = () => fail(new DOMException('Frame loading aborted', 'AbortError'));
    signal.addEventListener('abort', abort, { once: true });
    if (signal.aborted) { abort(); return; }
    iframe.addEventListener('load', () => { configureFrameViewport(iframe); loaded = true; check(); }, { once: true, signal });
    iframe.addEventListener('error', () => fail(new Error('Frame failed to load')), { once: true, signal });
    iframe.src = item.href;
    host.append(iframe);
    fetch(item.href, { method: 'HEAD', signal }).then((response) => {
      if (!response.ok) { fail(new Error(`Prototype HTTP ${response.status}`)); return; }
      reachable = true;
      check();
    }).catch(fail);
  });
  return { iframe, ready };
}
