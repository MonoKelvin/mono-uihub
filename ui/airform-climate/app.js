const $ = (id) => document.getElementById(id);
const all = (selector) => [...document.querySelectorAll(selector)];
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const modes = { cool: { name: '制冷', display: 'Cool' }, heat: { name: '制热', display: 'Heat' }, dry: { name: '除湿', display: 'Dry' }, fan: { name: '送风', display: 'Fan' }, auto: { name: '自动', display: 'Auto' } };
const fanNames = { auto: '自动风', 1: '低风', 2: '中风', 3: '高风' };
const defaults = () => ({ power: true, target: 23, mode: 'cool', fan: 'auto', verticalSwing: true, horizontalSwing: false, horizontalAngle: 0, angle: 50, display: true, sound: true, ambient: 26.8, timer: null });
let state = defaults();
const reduceQuery = matchMedia('(prefers-reduced-motion: reduce)');
let reduced = reduceQuery.matches;
const gsap = window.gsap;
const powerMotion = { open: 0, flow: 0, light: 0 };
const motion = { angle: 50, horizontalAngle: 0, verticalMix: 1, horizontalMix: 0, speed: 2.4, view: 0 };
let phase = 0;
let lastFrame = 0;
let frameId = 0;
let lastTick = Date.now();
let lastReadout = 0;
let signalUntil = 0;
let timerFeedbackUntil = 0;
let viewTarget = 0;
let hoverPart = '';
let hoverTween;
const hoverLevels = { horizontal: 0, vertical: 0, screen: 0, power: 0 };
const hoverQuery = matchMedia('(hover: hover) and (pointer: fine)');
let audioContext;
let voices = [];
let device3D;
let drag;
let lastScreenKey = '';
const canvas = $('scene-canvas');
const powerTimeline = gsap?.timeline({ paused: true, defaults: { ease: 'power2.inOut' } })
  .to(powerMotion, { light: 1, duration: .18 }, 0)
  .to(powerMotion, { open: 1, duration: .72 }, .04)
  .to(powerMotion, { flow: 1, duration: .6, ease: 'power2.out' }, .32);
powerTimeline?.progress(1).pause();
if (!gsap) Object.assign(powerMotion, { open: 1, flow: 1, light: 1 });
const angleTo = gsap?.quickTo(motion, 'angle', { duration: .25, ease: 'power2.out' });
const verticalTo = gsap?.quickTo(motion, 'verticalMix', { duration: .25, ease: 'power2.inOut' });
const horizontalTo = gsap?.quickTo(motion, 'horizontalMix', { duration: .3, ease: 'power2.inOut' });
const yawTo = gsap?.quickTo(motion, 'horizontalAngle', { duration: .25, ease: 'power2.out' });
const speedTo = gsap?.quickTo(motion, 'speed', { duration: .45, ease: 'power2.inOut' });
const viewTo = gsap?.quickTo(motion, 'view', { duration: .3, ease: 'power2.inOut' });
const controls = [angleTo, verticalTo, horizontalTo, yawTo, speedTo, viewTo];
function temperatureAvailable() { return !['fan', 'dry'].includes(state.mode); }
function effectiveFan() { if (state.mode === 'dry') return 1; if (state.fan !== 'auto') return Number(state.fan); const delta = Math.abs(state.target - state.ambient); return delta > 2 ? 3 : delta > .7 ? 2 : 1; }
function activeMode() { return state.mode === 'auto' ? (state.target > state.ambient ? 'heat' : 'cool') : state.mode; }
function currentVerticalAngle() { const swing = reduced ? state.angle : 50 + Math.sin(phase * Math.PI / 10) * 20; return motion.angle * (1 - motion.verticalMix) + swing * motion.verticalMix; }
function currentHorizontalAngle() { const swing = reduced ? state.horizontalAngle : Math.sin(phase * Math.PI / 12) * 15; return motion.horizontalAngle * (1 - motion.horizontalMix) + swing * motion.horizontalMix; }
function holdVerticalAngle() {
  const angle = currentVerticalAngle(); state.angle = Math.round(angle); state.verticalSwing = false;
  angleTo?.(state.angle, angle); verticalTo?.(0, 0); motion.angle = angle; motion.verticalMix = 0;
}
function holdHorizontalAngle() {
  const angle = currentHorizontalAngle(); state.horizontalAngle = Math.round(angle); state.horizontalSwing = false;
  yawTo?.(state.horizontalAngle, angle); horizontalTo?.(0, 0); motion.horizontalAngle = angle; motion.horizontalMix = 0;
}
function updateMotion() {
  const speed = .6 + effectiveFan() * .6;
  if (reduced || !gsap) Object.assign(motion, { angle: state.angle, horizontalAngle: state.horizontalAngle, verticalMix: Number(state.verticalSwing), horizontalMix: Number(state.horizontalSwing), speed });
  else { angleTo(state.angle); yawTo(state.horizontalAngle); verticalTo(Number(state.verticalSwing)); horizontalTo(Number(state.horizontalSwing)); speedTo(speed); }
  requestFrame();
}
function setView(value) {
  viewTarget = value;
  $('view-selector').dataset.view = String(value); $('unit-showcase').dataset.view = String(value);
  all('.view-button').forEach((button) => button.setAttribute('aria-pressed', String(Number(button.dataset.view) === value)));
  if (viewTo && !reduced) viewTo(value); else motion.view = value;
  $('operation-status').textContent = value ? '倾斜视角' : '正视角'; requestFrame();
}
function setHover(part) {
  if (part === hoverPart) return;
  hoverPart = part;
  const target = { horizontal: Number(part === 'horizontal-vane'), vertical: Number(part === 'vertical-vane'), screen: Number(part === 'screen'), power: Number(part === 'power') };
  if (gsap && !reduced) hoverTween = gsap.to(hoverLevels, { ...target, duration: .16, ease: 'power2.out', overwrite: 'auto' });
  else Object.assign(hoverLevels, target);
  requestFrame();
}
async function beep(count = 1) {
  if (!state.sound) return;
  const Audio = window.AudioContext || window.webkitAudioContext;
  if (!Audio) return;
  audioContext ??= new Audio();
  const context = audioContext;
  try { if (context.state === 'suspended') await context.resume(); } catch { return; }
  if (!state.sound || context !== audioContext || context.state !== 'running') return;
  const now = context.currentTime;
  voices.forEach(({ oscillator, gain }) => { gain.gain.cancelScheduledValues(now); gain.gain.setTargetAtTime(.0001, now, .003); oscillator.stop(now + .015); });
  voices = [];
  for (let index = 0; index < count; index++) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const start = now + index * .13;
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(2050, start);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(.038, start + .006);
    gain.gain.setValueAtTime(.038, start + .046);
    gain.gain.exponentialRampToValueAtTime(.0001, start + .072);
    oscillator.connect(gain); gain.connect(context.destination);
    const voice = { oscillator, gain }; voices.push(voice);
    oscillator.start(start); oscillator.stop(start + .08);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); voices = voices.filter((item) => item !== voice); };
  }
}
function acknowledge(message, count = 1) { signalUntil = performance.now() + 240; $('operation-status').textContent = message; beep(count); requestFrame(); }
function renderTimer() {
  $('timer-button').classList.toggle('active', Boolean(state.timer));
  const remaining = state.timer ? Math.max(0, state.timer.end - Date.now()) : 0;
  const progress = state.timer ? clamp(remaining / (state.timer.hours * 3600000), 0, 1) * 100 : 0;
  $('timer-ring-progress').style.strokeDasharray = `${progress} 100`;
  if (!state.timer) { $('timer-value').textContent = '未设置'; $('timer-button').setAttribute('aria-label', '设置定时关机，当前未设置'); return; }
  const minutes = Math.max(1, Math.ceil(remaining / 60000));
  $('timer-value').textContent = minutes >= 60 ? `${Math.floor(minutes / 60)} 小时${minutes % 60 ? ` ${minutes % 60} 分` : ''}` : `${minutes} 分钟`;
  $('timer-button').setAttribute('aria-label', `定时关机，剩余 ${minutes} 分钟，点击切换时长`);
}
function render() {
  $('app').classList.toggle('is-off', !state.power);
  $('app').classList.toggle('no-temperature', !temperatureAvailable());
  $('unit-status-text').textContent = state.power ? '运行中' : '已关机';
  $('target-label').textContent = temperatureAvailable() ? '设定温度' : state.mode === 'dry' ? '湿度控制' : '空气循环';
  $('target-temperature').textContent = temperatureAvailable() ? state.target : modes[state.mode].name;
  $('target-unit').hidden = !temperatureAvailable();
  $('temperature-range').value = state.target;
  $('temperature-range').setAttribute('aria-valuetext', `${state.target} 摄氏度`);
  $('temperature-range').disabled = !state.power || !temperatureAvailable();
  $('temperature-down').disabled = !state.power || !temperatureAvailable() || state.target === 16;
  $('temperature-up').disabled = !state.power || !temperatureAvailable() || state.target === 30;
  $('power-button').setAttribute('aria-pressed', String(state.power));
  $('power-button').setAttribute('aria-label', state.power ? '关闭空调' : '开启空调');
  all('[data-mode]').forEach((button) => { const active = button.dataset.mode === state.mode; button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active)); button.disabled = !state.power; });
  $('fan-button').disabled = !state.power || state.mode === 'dry';
  $('fan-button').setAttribute('aria-label', `切换风速，当前${state.mode === 'dry' ? '自动低风' : fanNames[state.fan]}`);
  $('fan-name').textContent = state.mode === 'dry' ? '低风除湿' : fanNames[state.fan];
  $('fan-auto-label').textContent = state.mode === 'dry' || state.fan === 'auto' ? '自动' : '';
  [...$('fan-meter').children].forEach((bar, index) => bar.classList.toggle('on', index < effectiveFan()));
  ['vertical-swing', 'horizontal-swing'].forEach((id, index) => { const active = index === 0 ? state.verticalSwing : state.horizontalSwing; $(id).classList.toggle('active', active); $(id).setAttribute('aria-pressed', String(active)); $(id).disabled = !state.power; });
  $('angle-range').value = state.angle;
  $('angle-range').setAttribute('aria-valuetext', `上下风向 ${state.angle} 度`);
  $('angle-range').disabled = !state.power;
  $('horizontal-range').value = state.horizontalAngle;
  $('horizontal-range').setAttribute('aria-valuetext', state.horizontalAngle < 0 ? `向左 ${-state.horizontalAngle} 度` : state.horizontalAngle > 0 ? `向右 ${state.horizontalAngle} 度` : '居中送风');
  $('horizontal-range').disabled = !state.power;
  $('timer-button').disabled = !state.power;
  $('sound-button').setAttribute('aria-pressed', String(state.sound));
  $('sound-button').setAttribute('aria-label', state.sound ? '关闭按键声音' : '开启按键声音');
  $('sound-button').querySelector('i').className = `ti ti-${state.sound ? 'volume' : 'volume-off'}`;
  $('display-button').setAttribute('aria-pressed', String(state.display));
  $('display-button').setAttribute('aria-label', state.display ? '关闭空调显示屏' : '开启空调显示屏');
  $('display-button').querySelector('i').className = `ti ti-${state.display ? 'bulb' : 'bulb-off'}`;
  renderTimer(); updateMotion(); updateScreen();
}
function setPower(power, timed = false) {
  state.power = power;
  if (!power) state.timer = null;
  if (powerTimeline && !reduced) { powerTimeline.timeScale(power ? 1 : 1.15); if (power) powerTimeline.play(); else powerTimeline.reverse(); }
  else { powerTimeline?.progress(Number(power)).pause(); Object.assign(powerMotion, { open: Number(power), flow: Number(power), light: Number(power) }); }
  render(); acknowledge(timed ? '定时结束，空调已关闭' : power ? '空调开启' : '空调关闭', power ? 2 : 1);
}
function changeTemperature(value, feedback = true) {
  if (!state.power || !temperatureAvailable()) return;
  const target = clamp(Math.round(value), 16, 30);
  if (target === state.target) return;
  state.target = target; render();
  if (feedback) acknowledge(`设定温度 ${target}°C`); else { signalUntil = performance.now() + 160; $('operation-status').textContent = `设定温度 ${target}°C`; requestFrame(); }
}
function setAngle(angle, feedback = true) {
  if (!state.power) return;
  state.angle = clamp(Math.round(angle), 30, 70); state.verticalSwing = false; render();
  if (feedback) acknowledge(`水平叶片上下风向 ${state.angle}°`);
}
function setHorizontalAngle(angle, feedback = true) {
  if (!state.power) return;
  state.horizontalAngle = clamp(Math.round(angle), -35, 35); state.horizontalSwing = false; render();
  if (feedback) acknowledge(state.horizontalAngle === 0 ? '左右居中送风' : `${state.horizontalAngle < 0 ? '向左' : '向右'}送风 ${Math.abs(state.horizontalAngle)}°`);
}
function toggleDisplay() { state.display = !state.display; render(); acknowledge(state.display ? '显示屏开启' : '显示屏关闭'); }
$('power-button').addEventListener('click', () => setPower(!state.power));
$('temperature-down').addEventListener('click', () => changeTemperature(state.target - 1));
$('temperature-up').addEventListener('click', () => changeTemperature(state.target + 1));
$('temperature-range').addEventListener('input', (event) => changeTemperature(Number(event.target.value), false));
$('temperature-range').addEventListener('change', () => acknowledge(`设定温度 ${state.target}°C`));
all('[data-mode]').forEach((button) => button.addEventListener('click', () => { state.mode = button.dataset.mode; render(); acknowledge(`切换至${modes[state.mode].name}`); }));
$('fan-button').addEventListener('click', () => { const options = ['auto', '1', '2', '3']; state.fan = options[(options.indexOf(state.fan) + 1) % options.length]; render(); acknowledge(`风速：${fanNames[state.fan]}`); });
$('angle-range').addEventListener('input', (event) => setAngle(Number(event.target.value), false));
$('angle-range').addEventListener('change', () => setAngle(state.angle));
$('horizontal-range').addEventListener('input', (event) => setHorizontalAngle(Number(event.target.value), false));
$('horizontal-range').addEventListener('change', () => setHorizontalAngle(state.horizontalAngle));
$('vertical-swing').addEventListener('click', () => { if (state.verticalSwing) holdVerticalAngle(); else state.verticalSwing = true; render(); acknowledge(state.verticalSwing ? '水平叶片上下摆风开启' : '水平叶片停在当前角度'); });
$('horizontal-swing').addEventListener('click', () => { if (state.horizontalSwing) holdHorizontalAngle(); else state.horizontalSwing = true; render(); acknowledge(state.horizontalSwing ? '垂直叶片左右摆风开启' : '垂直叶片停在当前角度'); });
$('display-button').addEventListener('click', toggleDisplay);
$('sound-button').addEventListener('click', () => { state.sound = !state.sound; render(); acknowledge(state.sound ? '按键声音开启' : '按键声音关闭'); });
const timerOptions = [0, .5, 1, 2, 4, 8];
$('timer-button').addEventListener('click', () => { const hours = timerOptions[(timerOptions.indexOf(state.timer?.hours ?? 0) + 1) % timerOptions.length]; state.timer = hours ? { hours, end: Date.now() + hours * 3600000 } : null; timerFeedbackUntil = performance.now() + 220; render(); acknowledge(hours ? `${hours < 1 ? '30 分钟' : `${hours} 小时`}后关机` : '定时已取消'); });
all('.view-button').forEach((button) => button.addEventListener('click', () => setView(Number(button.dataset.view))));
$('reset-button').addEventListener('click', () => {
  state = defaults(); phase = 0; controls.forEach((to) => to?.tween.pause());
  angleTo?.(50, 50); verticalTo?.(1, 1); horizontalTo?.(0, 0); yawTo?.(0, 0); speedTo?.(2.4, 2.4);
  Object.assign(motion, { angle: 50, horizontalAngle: 0, verticalMix: 1, horizontalMix: 0, speed: 2.4 });
  powerTimeline?.progress(1).pause(); Object.assign(powerMotion, { open: 1, flow: 1, light: 1 });
  setHover(''); setView(0); render(); acknowledge('空调已重置');
});

const windVertexShader = `
  uniform float uTime;
  uniform float uSpeed;
  uniform float uLayer;
  uniform vec3 uDirection;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    float p = uv.y;
    vec3 forward = normalize(uDirection);
    vec3 across = vec3(1.0, 0.0, 0.0);
    vec3 depth = normalize(cross(across, forward));
    float ripple = sin(p * 6.0 - uTime * uSpeed * 0.48 + uLayer * 1.6);
    vec3 point = across * (uv.x - 0.5) * 4.85 * (1.0 + p * 0.18);
    point += forward * p * 4.0;
    point += depth * (uLayer * 0.05 + ripple * (0.06 + p * 0.15) * p);
    point.x += sin(p * 4.0 + uTime * 0.4 + uLayer) * p * p * 0.1;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(point, 1.0);
  }
`;
const windFragmentShader = `
  uniform float uTime;
  uniform float uSpeed;
  uniform float uStrength;
  uniform float uLayer;
  uniform vec3 uColor;
  varying vec2 vUv;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }
  float fbm(vec2 p) {
    float value = 0.52 * noise(p);
    p = p * 2.03 + vec2(3.1, 7.6);
    value += 0.27 * noise(p);
    p = p * 2.01 + vec2(8.3, 2.8);
    return value + 0.14 * noise(p);
  }
  void main() {
    vec2 p = vec2(vUv.x * 5.2, vUv.y * 2.6 - uTime * uSpeed * 0.18);
    p.x += sin(vUv.y * 5.0 - uTime * 0.25 + uLayer) * 0.3;
    float mist = fbm(p + uLayer * 1.37);
    float wisps = fbm(vec2(p.x * 1.75, p.y * 0.58) + mist * 1.4);
    float density = smoothstep(0.22, 0.76, mist * 0.56 + wisps * 0.64);
    float edges = exp(-pow((vUv.x - 0.5) * 2.0, 4.0) * 3.2);
    float lengthFade = smoothstep(0.0, 0.08, vUv.y) * (1.0 - smoothstep(0.32, 1.0, vUv.y));
    float alpha = density * edges * lengthFade * uStrength * 0.18;
    gl_FragColor = vec4(uColor, alpha);
    #include <colorspace_fragment>
  }
`;

async function createDevice() {
  try {
    const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.186.0/build/three.module.min.js');
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, .1, 60);
    const unit = new THREE.Group(); scene.add(unit);
    const shell = new THREE.MeshPhysicalMaterial({ color: '#f2eff8', roughness: .33, metalness: .04, clearcoat: .45, clearcoatRoughness: .28 });
    const front = new THREE.MeshPhysicalMaterial({ color: '#fffefd', roughness: .25, metalness: .02, clearcoat: .7, clearcoatRoughness: .22 });
    const dark = new THREE.MeshStandardMaterial({ color: '#35313e', roughness: .8 });
    const finMaterial = new THREE.MeshStandardMaterial({ color: '#9c94ad', roughness: .4, metalness: .22 });
    const vaneMaterial = front.clone();
    vaneMaterial.emissive.set('#bda8d7'); vaneMaterial.emissiveIntensity = 0;
    finMaterial.emissive.set('#bda8d7'); finMaterial.emissiveIntensity = 0;
    function roundedBox(w, h, d, r, material) {
      const shape = new THREE.Shape();
      const x = -w / 2, y = -h / 2;
      shape.moveTo(x + r, y); shape.lineTo(x + w - r, y); shape.quadraticCurveTo(x + w, y, x + w, y + r);
      shape.lineTo(x + w, y + h - r); shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      shape.lineTo(x + r, y + h); shape.quadraticCurveTo(x, y + h, x, y + h - r);
      shape.lineTo(x, y + r); shape.quadraticCurveTo(x, y, x + r, y);
      const geometry = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: true, bevelThickness: Math.min(.018, d / 4), bevelSize: Math.min(.018, d / 4), bevelSegments: 4, curveSegments: 12, steps: 1 });
      geometry.translate(0, 0, -d / 2);
      const mesh = new THREE.Mesh(geometry, material); mesh.castShadow = true; mesh.receiveShadow = true;
      return mesh;
    }
    const body = roundedBox(5.56, 1.22, .4, .14, shell); body.position.set(0, .03, -.25); unit.add(body);
    const panel = roundedBox(5.64, .84, .14, .14, front); panel.position.set(0, .24, .33); unit.add(panel);
    const bottom = roundedBox(5.56, .12, .46, .04, shell); bottom.position.set(0, -.59, -.235); unit.add(bottom);
    const sideShape = new THREE.Shape();
    sideShape.moveTo(.47, .5); sideShape.quadraticCurveTo(.47, .66, .32, .66);
    sideShape.lineTo(-.25, .66); sideShape.quadraticCurveTo(-.42, .66, -.42, .5);
    sideShape.lineTo(-.42, -.17); sideShape.quadraticCurveTo(-.42, -.2, -.38, -.23);
    sideShape.lineTo(-.02, -.61); sideShape.quadraticCurveTo(.04, -.65, .12, -.65);
    sideShape.lineTo(.38, -.65); sideShape.quadraticCurveTo(.47, -.65, .47, -.53); sideShape.closePath();
    const sideGeometry = new THREE.ExtrudeGeometry(sideShape, { depth: .12, bevelEnabled: true, bevelThickness: .012, bevelSize: .012, bevelSegments: 4, curveSegments: 12 }); sideGeometry.rotateY(Math.PI / 2);
    for (const x of [-2.86, 2.74]) { const side = new THREE.Mesh(sideGeometry, shell); side.position.x = x; side.castShadow = true; side.receiveShadow = true; unit.add(side); }
    const outletPitch = THREE.MathUtils.degToRad(40);
    const outlet = new THREE.Group(); outlet.position.set(0, -.42, .19); outlet.rotation.x = outletPitch; unit.add(outlet);
    const rimShape = new THREE.Shape();
    rimShape.moveTo(-2.70, -.29); rimShape.lineTo(2.70, -.29); rimShape.quadraticCurveTo(2.77, -.29, 2.77, -.22);
    rimShape.lineTo(2.77, .22); rimShape.quadraticCurveTo(2.77, .29, 2.70, .29);
    rimShape.lineTo(-2.70, .29); rimShape.quadraticCurveTo(-2.77, .29, -2.77, .22);
    rimShape.lineTo(-2.77, -.22); rimShape.quadraticCurveTo(-2.77, -.29, -2.70, -.29);
    const hole = new THREE.Path();
    hole.moveTo(-2.48, -.17); hole.quadraticCurveTo(-2.52, -.17, -2.52, -.13); hole.lineTo(-2.52, .13); hole.quadraticCurveTo(-2.52, .17, -2.48, .17);
    hole.lineTo(2.48, .17); hole.quadraticCurveTo(2.52, .17, 2.52, .13); hole.lineTo(2.52, -.13); hole.quadraticCurveTo(2.52, -.17, 2.48, -.17); hole.closePath(); rimShape.holes.push(hole);
    const rimGeometry = new THREE.ExtrudeGeometry(rimShape, { depth: .065, bevelEnabled: true, bevelThickness: .012, bevelSize: .012, bevelSegments: 4, curveSegments: 12 }); rimGeometry.translate(0, 0, -.0325);
    const rim = new THREE.Mesh(rimGeometry, front); rim.castShadow = true; rim.receiveShadow = true; outlet.add(rim);
    const vent = roundedBox(5.03, .33, .025, .035, dark); vent.position.z = -.15; outlet.add(vent);
    for (const y of [-.162, .162]) { const wall = new THREE.Mesh(new THREE.BoxGeometry(5.01, .02, .15), dark); wall.position.set(0, y, -.07); outlet.add(wall); }
    for (const x of [-2.51, 2.51]) { const wall = new THREE.Mesh(new THREE.BoxGeometry(.025, .30, .15), dark); wall.position.set(x, 0, -.07); outlet.add(wall); }
    const fins = [];
    for (let index = 0; index < 11; index++) {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(.026, .28, .12), finMaterial);
      fin.position.set(-2.38 + index * 4.76 / 10, 0, -.017); fin.name = 'vertical-vane'; fin.castShadow = true; outlet.add(fin); fins.push(fin);
    }
    const horizontalVanes = [];
    for (let index = 0; index < 3; index++) {
      const vane = roundedBox(4.98, .145, .018, .025, vaneMaterial);
      vane.geometry.rotateX(-Math.PI / 2);
      vane.position.set(0, .105 - index * .105, -.037); vane.name = 'horizontal-vane'; outlet.add(vane); horizontalVanes.push(vane);
    }
    const screenFrame = roundedBox(.94, .46, .04, .055, new THREE.MeshStandardMaterial({ color: '#302b39', roughness: .16, metalness: .12 }));
    screenFrame.position.set(1.68, .2, .429); screenFrame.name = 'screen'; unit.add(screenFrame);
    const screenCanvas = document.createElement('canvas'); screenCanvas.width = 1024; screenCanvas.height = 512;
    const screenTexture = new THREE.CanvasTexture(screenCanvas); screenTexture.colorSpace = THREE.SRGBColorSpace;
    screenTexture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const screenMaterial = new THREE.MeshBasicMaterial({ map: screenTexture, transparent: true, toneMapped: false });
    const screenFace = new THREE.Mesh(new THREE.PlaneGeometry(.86, .4), screenMaterial); screenFace.position.set(1.68, .2, .478); screenFace.name = 'screen'; unit.add(screenFace);
    const logoCanvas = document.createElement('canvas'); logoCanvas.width = 512; logoCanvas.height = 128;
    const logoCtx = logoCanvas.getContext('2d');
    logoCtx.font = '500 92px Outfit, sans-serif'; logoCtx.fillStyle = '#9990a6'; logoCtx.textBaseline = 'middle'; logoCtx.fillText('airform', 12, 64);
    const logoTexture = new THREE.CanvasTexture(logoCanvas); logoTexture.colorSpace = THREE.SRGBColorSpace;
    const logo = new THREE.Mesh(new THREE.PlaneGeometry(.91, .22), new THREE.MeshBasicMaterial({ map: logoTexture, transparent: true, toneMapped: false })); logo.position.set(-1.92, .2, .423); unit.add(logo);
    const badgeMaterial = new THREE.MeshStandardMaterial({ color: '#b6a8c6', roughness: .5, metalness: .1 });
    for (let index = 0; index < 3; index++) { const mark = roundedBox(.16 - index * .035, .018, .006, .006, badgeMaterial); mark.position.set(-2.53, .252 - index * .052, .424); unit.add(mark); }
    const seam = roundedBox(3.54, .008, .006, .003, new THREE.MeshStandardMaterial({ color: '#d3c9df', roughness: .65 })); seam.position.set(0, -.118, .421); unit.add(seam);
    screenFrame.material.emissive.set('#bda8d7'); screenFrame.material.emissiveIntensity = 0;
    const powerCanvas = document.createElement('canvas'); powerCanvas.width = 128; powerCanvas.height = 128;
    const powerTexture = new THREE.CanvasTexture(powerCanvas); powerTexture.colorSpace = THREE.SRGBColorSpace;
    const powerStyle = getComputedStyle($('power-button').querySelector('i'), '::before');
    const powerGlyph = powerStyle.content.slice(1, -1);
    function drawPowerIcon() {
      const context = powerCanvas.getContext('2d'); context.clearRect(0, 0, 128, 128);
      context.font = `96px ${powerStyle.fontFamily}`; context.fillStyle = '#8b78a8'; context.textAlign = 'center'; context.textBaseline = 'alphabetic';
      const metrics = context.measureText(powerGlyph);
      context.fillText(powerGlyph, 64, 64 + (metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2);
      powerTexture.needsUpdate = true; requestFrame();
    }
    drawPowerIcon(); document.fonts.load(`96px ${powerStyle.fontFamily}`).then(drawPowerIcon).catch(() => {});
    const powerMaterial = new THREE.MeshBasicMaterial({ map: powerTexture, transparent: true, depthWrite: false, toneMapped: false });
    const powerMesh = new THREE.Mesh(new THREE.PlaneGeometry(.15, .15), powerMaterial); powerMesh.position.set(-2.42, -.08, .423); powerMesh.name = 'power'; unit.add(powerMesh);
    const receiverMaterial = new THREE.MeshBasicMaterial({ color: '#aca0bd', toneMapped: false });
    const receiver = new THREE.Mesh(new THREE.SphereGeometry(.018, 16, 10), receiverMaterial); receiver.position.set(2.35, .16, .43); unit.add(receiver);
    const ambient = new THREE.HemisphereLight('#ffffff', '#c1b0d3', 2.1); scene.add(ambient);
    const key = new THREE.DirectionalLight('#fffbf5', 3.5); key.position.set(-3, 5, 7); key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024); key.shadow.camera.left = -5; key.shadow.camera.right = 5; key.shadow.camera.top = 4; key.shadow.camera.bottom = -4; key.shadow.bias = -.001; key.shadow.normalBias = .015; scene.add(key);
    const fill = new THREE.DirectionalLight('#d4c9ee', 1.2); fill.position.set(5, .5, 4); scene.add(fill);
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(20, 15), new THREE.ShadowMaterial({ color: '#5f4c74', opacity: .14 })); wall.position.z = -.47; wall.receiveShadow = true; scene.add(wall);
    const windRoot = new THREE.Group(); unit.add(windRoot);
    const uniforms = { uTime: { value: 0 }, uSpeed: { value: 2.4 }, uStrength: { value: 1 }, uDirection: { value: new THREE.Vector3(0, -.3, .95) }, uColor: { value: new THREE.Color('#a995c1') } };
    const windGeometry = new THREE.PlaneGeometry(1, 1, 28, 40);
    const windSheets = [];
    for (let layer = -2; layer <= 2; layer++) {
      const material = new THREE.ShaderMaterial({ uniforms: { ...uniforms, uLayer: { value: layer } }, vertexShader: windVertexShader, fragmentShader: windFragmentShader, transparent: true, depthWrite: false, side: THREE.DoubleSide, toneMapped: false });
      const sheet = new THREE.Mesh(windGeometry, material); sheet.frustumCulled = false; sheet.renderOrder = 1; windRoot.add(sheet); windSheets.push(sheet);
    }
    device3D = { THREE, renderer, scene, camera, unit, outlet, outletPitch, horizontalVanes, fins, vaneMaterial, finMaterial, screenCanvas, screenTexture, screenFace, screenFrame, receiver, receiverMaterial, powerMaterial, windRoot, uniforms, windSheets, raycaster: new THREE.Raycaster(), pointer: new THREE.Vector2() };
    canvas.dataset.ready = 'true'; $('graphics-status').hidden = true;
    lastScreenKey = ''; updateScreen(); resize();
    document.fonts.ready.then(() => { lastScreenKey = ''; updateScreen(); requestFrame(); });
  } catch (error) {
    $('graphics-status').textContent = '3D 视图未载入，请检查网络与浏览器图形加速';
    console.error('Airform 3D:', error);
  }
}
function updateScreen() {
  if (!device3D) return;
  const visible = state.power && state.display;
  const key = `${visible}:${state.target}:${state.mode}:${activeMode()}:${Boolean(state.timer)}:${effectiveFan()}`;
  if (key === lastScreenKey) return;
  lastScreenKey = key;
  const context = device3D.screenCanvas.getContext('2d');
  context.clearRect(0, 0, 1024, 512);
  context.fillStyle = '#302b39'; context.beginPath(); context.roundRect(0, 0, 1024, 512, 35); context.fill();
  if (visible) {
    context.fillStyle = activeMode() === 'heat' ? '#ffdfbf' : '#eee6ff';
    context.font = '600 292px "Chakra Petch", sans-serif'; context.textAlign = 'center'; context.textBaseline = 'middle';
    context.fillText(temperatureAvailable() ? String(state.target) : state.mode === 'fan' ? 'Fn' : 'dH', 435, 219);
    if (temperatureAvailable()) { context.font = '500 77px "Chakra Petch", sans-serif'; context.fillText('°C', 812, 170); }
    context.font = '500 52px Outfit, sans-serif'; context.textAlign = 'left'; context.fillText(modes[state.mode].display, 105, 407);
    for (let index = 0; index < 3; index++) { context.globalAlpha = index < effectiveFan() ? 1 : .18; context.beginPath(); context.roundRect(732 + index * 45, 427 - index * 18, 27, 22 + index * 18, 5); context.fill(); }
    context.globalAlpha = 1;
    if (state.timer) { context.lineWidth = 7; context.beginPath(); context.arc(640, 404, 25, 0, Math.PI * 2); context.strokeStyle = context.fillStyle; context.stroke(); context.beginPath(); context.moveTo(640, 389); context.lineTo(640, 404); context.lineTo(654, 408); context.stroke(); }
  }
  device3D.screenTexture.needsUpdate = true;
}
function resize() {
  if (!device3D) return;
  const rect = $('device-field').getBoundingClientRect();
  if (rect.width < 1 || rect.height < 1) return;
  const { renderer, camera } = device3D;
  renderer.setSize(rect.width, rect.height, false);
  camera.setViewOffset(rect.width, rect.height, 0, rect.height * (rect.width / rect.height > 2 ? .06 : .15), rect.width, rect.height);
  requestFrame();
}
const resizeObserver = new ResizeObserver(resize); resizeObserver.observe($('device-field'));
function updateCamera() {
  const { THREE, camera } = device3D;
  const yaw = THREE.MathUtils.degToRad(32) * motion.view;
  const pitch = THREE.MathUtils.degToRad(16) * motion.view;
  const roll = THREE.MathUtils.degToRad(4) * motion.view;
  const distance = Math.max(5.7, (6.8 - motion.view * .45) / (2 * Math.tan(THREE.MathUtils.degToRad(16)) * camera.aspect));
  camera.position.set(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch)).multiplyScalar(distance);
  camera.up.set(-Math.sin(roll), Math.cos(roll), 0);
  camera.lookAt(0, 0, 0); camera.updateMatrixWorld();
}
function drawFrame(now) {
  frameId = 0;
  const delta = lastFrame ? Math.min((now - lastFrame) / 1000, .05) : 0; lastFrame = now;
  if (!reduced) phase += delta;
  const vertical = currentVerticalAngle();
  const horizontal = currentHorizontalAngle();
  $('remote-signal').style.color = now < signalUntil ? 'var(--accent)' : 'var(--panel-muted)';
  $('timer-symbol').classList.toggle('pulse', now < timerFeedbackUntil);
  $('fan-propeller').style.transform = `rotate(${reduced || !state.power ? 0 : phase * motion.speed * 48}deg)`;
  if (now - lastReadout > 90 || reduced) { $('angle-output').textContent = `${Math.round(vertical)}°`; $('horizontal-output').textContent = `${Math.round(horizontal)}°`; lastReadout = now; }
  if (device3D) {
    const { THREE, horizontalVanes, fins, outletPitch, windRoot, uniforms, screenFace, renderer, scene, camera, receiverMaterial } = device3D;
    const rotation = Math.PI / 2 + (THREE.MathUtils.degToRad(vertical) - Math.PI / 2) * powerMotion.open - outletPitch;
    horizontalVanes.forEach((vane) => { vane.rotation.x = rotation; });
    fins.forEach((fin) => { fin.rotation.y = THREE.MathUtils.degToRad(horizontal) * powerMotion.open; });
    const angle = THREE.MathUtils.degToRad(vertical);
    const yaw = THREE.MathUtils.degToRad(horizontal);
    uniforms.uDirection.value.set(Math.sin(yaw) * Math.cos(angle), -Math.sin(angle), Math.cos(yaw) * Math.cos(angle));
    uniforms.uTime.value = phase; uniforms.uSpeed.value = motion.speed; uniforms.uStrength.value = powerMotion.flow * (.72 + effectiveFan() * .1);
    uniforms.uColor.value.set(activeMode() === 'heat' ? '#c9a486' : state.mode === 'dry' ? '#b79abf' : '#a995c1');
    windRoot.position.set(0, -.42 - .045 * Math.sin(outletPitch), .19 + .045 * Math.cos(outletPitch));
    windRoot.visible = powerMotion.flow > .005;
    screenFace.material.opacity = state.display ? powerMotion.light : 0;
    receiverMaterial.color.set(now < signalUntil ? '#9275bd' : '#aca0bd');
    device3D.vaneMaterial.emissiveIntensity = hoverLevels.horizontal * .12;
    device3D.finMaterial.emissiveIntensity = hoverLevels.vertical * .12;
    device3D.screenFrame.material.emissiveIntensity = hoverLevels.screen * .08;
    device3D.powerMaterial.opacity = (state.power ? .72 : .5) + hoverLevels.power * .25;
    device3D.unit.position.x = -.36 * motion.view;
    updateCamera(); renderer.render(scene, camera);
  }
  if (!document.hidden && ((state.power && !reduced) || powerTimeline?.isActive() || hoverTween?.isActive() || now < signalUntil || controls.some((to) => to?.tween.isActive()))) requestFrame();
}
function requestFrame() { if (!frameId && !document.hidden) frameId = requestAnimationFrame(drawFrame); }
function pick(event) {
  if (!device3D) return;
  const rect = canvas.getBoundingClientRect();
  device3D.pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
  device3D.raycaster.setFromCamera(device3D.pointer, device3D.camera);
  return device3D.raycaster.intersectObjects(device3D.unit.children, true).find((hit) => !device3D.windSheets.includes(hit.object));
}
const vaneTypes = ['horizontal-vane', 'vertical-vane'];
canvas.addEventListener('pointerdown', (event) => {
  if (event.pointerType === 'mouse' && event.button !== 0) return;
  const hit = pick(event);
  if (!hit || ![...vaneTypes, 'screen', 'power'].includes(hit.object.name)) return;
  const horizontalVane = hit.object.name === 'horizontal-vane';
  if (vaneTypes.includes(hit.object.name)) {
    if (!state.power) return;
    if (horizontalVane && state.verticalSwing) holdVerticalAngle();
    if (!horizontalVane && state.horizontalSwing) holdHorizontalAngle();
    render();
  }
  if (hoverQuery.matches && event.pointerType !== 'touch') setHover(hit.object.name);
  drag = { type: hit.object.name, y: event.clientY, x: event.clientX, angle: horizontalVane ? state.angle : state.horizontalAngle, moved: false };
  canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener('pointermove', (event) => {
  if (drag && vaneTypes.includes(drag.type)) {
    const horizontalVane = drag.type === 'horizontal-vane';
    const distance = horizontalVane ? event.clientY - drag.y : event.clientX - drag.x;
    if (Math.abs(distance) > 3) drag.moved = true;
    if (drag.moved) { if (horizontalVane) setAngle(drag.angle + distance * .65, false); else setHorizontalAngle(drag.angle + distance * .65, false); }
    canvas.style.cursor = 'grabbing';
  } else {
    const hit = pick(event);
    const part = hit && [...vaneTypes, 'screen', 'power'].includes(hit.object.name) ? hit.object.name : '';
    const active = part && (!vaneTypes.includes(part) || state.power);
    canvas.style.cursor = active ? vaneTypes.includes(part) ? 'grab' : 'pointer' : 'default';
    if (hoverQuery.matches && event.pointerType !== 'touch') setHover(active ? part : '');
  }
});
canvas.addEventListener('pointerup', () => {
  if (!drag) return;
  const current = drag; drag = undefined;
  if (current.type === 'screen') toggleDisplay();
  else if (current.type === 'power') setPower(!state.power);
  else if (current.type === 'horizontal-vane') { if (current.moved) setAngle(state.angle); else setAngle(state.angle < 40 ? 50 : state.angle < 60 ? 70 : 30); }
  else if (current.type === 'vertical-vane') { if (current.moved) setHorizontalAngle(state.horizontalAngle); else setHorizontalAngle(state.horizontalAngle < 0 ? 0 : state.horizontalAngle === 0 ? 25 : -25); }
  canvas.style.cursor = 'default'; setHover('');
});
canvas.addEventListener('pointerleave', () => { if (!drag) setHover(''); });
canvas.addEventListener('pointercancel', () => { drag = undefined; canvas.style.cursor = 'default'; setHover(''); });
canvas.addEventListener('lostpointercapture', () => { drag = undefined; });
for (const [id, part] of [['angle-range', 'horizontal-vane'], ['horizontal-range', 'vertical-vane']]) {
  $(id).addEventListener('pointerenter', (event) => { if (state.power && hoverQuery.matches && event.pointerType !== 'touch') setHover(part); });
  $(id).addEventListener('pointerleave', () => setHover(''));
}
canvas.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') { event.preventDefault(); setAngle(state.angle + (event.key === 'ArrowUp' ? -5 : 5)); }
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); setHorizontalAngle(state.horizontalAngle + (event.key === 'ArrowLeft' ? -5 : 5)); }
});
function tick() {
  const now = Date.now(); const elapsed = Math.min((now - lastTick) / 1000, 2); lastTick = now;
  if (state.timer && now >= state.timer.end) setPower(false, true);
  if (!document.hidden) {
    const difference = state.target - state.ambient; let adjustment = (27 - state.ambient) * .0007;
    if (state.power) { const capacity = .009 + effectiveFan() * .009; if (state.mode === 'cool' && difference < 0) adjustment += Math.max(difference * .025, -capacity); if (state.mode === 'heat' && difference > 0) adjustment += Math.min(difference * .025, capacity); if (state.mode === 'auto') adjustment += clamp(difference * .025, -capacity, capacity); if (state.mode === 'dry') adjustment += Math.min(0, (state.ambient - 24) * -.006); }
    state.ambient = clamp(state.ambient + adjustment * elapsed, 10, 40);
    [...$('fan-meter').children].forEach((bar, index) => bar.classList.toggle('on', index < effectiveFan()));
    if (state.fan === 'auto') updateMotion(); updateScreen();
  }
  renderTimer();
}
reduceQuery.addEventListener('change', (event) => {
  reduced = event.matches; controls.forEach((to) => to?.tween.duration(reduced ? 0 : .25));
  if (reduced) {
    powerTimeline?.progress(Number(state.power)).pause(); Object.assign(powerMotion, { open: Number(state.power), flow: Number(state.power), light: Number(state.power) });
    viewTo?.tween.pause(); motion.view = viewTarget; hoverTween?.duration(0);
  }
  render();
});
document.addEventListener('visibilitychange', () => { if (document.hidden) { cancelAnimationFrame(frameId); frameId = 0; powerTimeline?.pause(); } else { lastFrame = 0; if (!reduced) { if (state.power) powerTimeline?.play(); else powerTimeline?.reverse(); } tick(); requestFrame(); } });
canvas.addEventListener('webglcontextlost', (event) => { event.preventDefault(); $('graphics-status').textContent = '图形连接已暂停'; $('graphics-status').hidden = false; });
canvas.addEventListener('webglcontextrestored', () => { $('graphics-status').hidden = true; lastScreenKey = ''; updateScreen(); requestFrame(); });
window.addEventListener('load', () => {
  const font = document.createElement('link'); font.rel = 'stylesheet';
  font.href = 'https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;600&family=Outfit:wght@300;400;500;600&family=Noto+Sans+SC:wght@400;500;600&display=swap';
  font.addEventListener('load', () => { document.fonts.load('600 292px "Chakra Petch"').then(() => { lastScreenKey = ''; updateScreen(); requestFrame(); }).catch(() => {}); });
  document.head.append(font);
});
render(); createDevice();
let clock = setInterval(tick, 1000);
window.addEventListener('pagehide', () => { clearInterval(clock); cancelAnimationFrame(frameId); frameId = 0; powerTimeline?.pause(); if (audioContext && audioContext.state !== 'closed') audioContext.close(); audioContext = undefined; voices = []; });
window.addEventListener('pageshow', (event) => { if (!event.persisted) return; lastFrame = 0; lastTick = Date.now(); tick(); clock = setInterval(tick, 1000); if (!reduced) { if (state.power) powerTimeline?.play(); else powerTimeline?.reverse(); } resize(); });
