'use strict';

const canvas = document.querySelector('.canvas');
const viewer = document.querySelector('#viewer');
const modelCanvas = document.querySelector('#model-canvas');
const powerLabel = document.querySelector('#power-label');
const powerButton = document.querySelector('#power-button');
const oscillationToggle = document.querySelector('#oscillation-toggle');
const tiltInput = document.querySelector('#tilt');
const tiltValue = document.querySelector('#tilt-value');
const directionInput = document.querySelector('#direction');
const directionValue = document.querySelector('#direction-value');
const timerValue = document.querySelector('#timer-value');
const soundButton = document.querySelector('#sound-button');
const settings = document.querySelector('#settings');
const notice = document.querySelector('#notice');
const speedButtons = [...document.querySelectorAll('[data-speed]')];
const timerButtons = [...document.querySelectorAll('[data-minutes]')];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const state = { power: false, speed: 1, oscillation: false, tilt: 0, direction: 0, timerMinutes: 0, deadline: 0, sound: false };
const speeds = [0, 9, 15, 23];
const descriptions = ['', '轻风', '适中', '强风'];
let model = null;
let velocity = 0;
let rotorAngle = .32;
let currentTilt = 0;
let currentYaw = 0;
let targetYaw = 0;
let oscillationPhase = 0;
let lastFrame = 0;
let frameId = 0;
let rendering = false;
let timerInterval = 0;
let noticeTimeout = 0;
let audio = null;
let audioRequest = 0;
let previousAudioLevel = -1;
let previousPowerLabel = '';

async function createModel() {
  const [THREE, { OrbitControls }, { mergeGeometries }, { RoomEnvironment }] = await Promise.all([
    import('three'),
    import('three/addons/controls/OrbitControls.js'),
    import('three/addons/utils/BufferGeometryUtils.js'),
    import('three/addons/environments/RoomEnvironment.js'),
  ]);
  const renderer = new THREE.WebGLRenderer({ canvas: modelCanvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, .1, 100);
  const environment = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environmentTarget = pmrem.fromScene(environment, .04);
  scene.environment = environmentTarget.texture;
  environment.dispose();
  pmrem.dispose();

  scene.add(new THREE.HemisphereLight(0xffffff, 0xb8b7c5, 1.25));
  const key = new THREE.DirectionalLight(0xfffcf8, 3);
  key.position.set(-4, 8, 6);
  key.castShadow = true;
  const shadowSize = Math.min(renderer.capabilities.maxTextureSize, window.matchMedia('(max-width: 660px)').matches ? 2048 : 4096);
  key.shadow.mapSize.set(shadowSize, shadowSize);
  key.shadow.camera.left = -4;
  key.shadow.camera.right = 4;
  key.shadow.camera.top = 4;
  key.shadow.camera.bottom = -4;
  key.shadow.camera.near = .5;
  key.shadow.camera.far = 24;
  key.shadow.camera.updateProjectionMatrix();
  key.shadow.normalBias = .002;
  key.shadow.bias = -.000025;
  key.target.position.set(0, 3.05, 0);
  scene.add(key, key.target);
  const fill = new THREE.DirectionalLight(0xdfe4ff, 1.3);
  fill.position.set(5, 4, -3);
  scene.add(fill);

  const bodyMaterial = new THREE.MeshPhysicalMaterial({ color: 0xf0f1f2, roughness: .31, metalness: .12, clearcoat: .2, clearcoatRoughness: .45, envMapIntensity: .75 });
  const silverMaterial = new THREE.MeshStandardMaterial({ color: 0xc4c7cf, roughness: .42, metalness: .65, envMapIntensity: .9 });
  const wireMaterial = new THREE.MeshStandardMaterial({ color: 0xa9adb8, roughness: .5, metalness: .48, envMapIntensity: .65 });
  const darkMaterial = new THREE.MeshStandardMaterial({ color: 0x555561, roughness: .55, metalness: .15 });
  const bladeMaterial = new THREE.MeshPhysicalMaterial({ color: 0xdcdfe5, roughness: .38, metalness: .1, clearcoat: .15, side: THREE.DoubleSide });
  const fan = new THREE.Group();
  scene.add(fan);

  function mesh(geometry, material, parent, x = 0, y = 0, z = 0, shadow = true) {
    const object = new THREE.Mesh(geometry, material);
    object.position.set(x, y, z);
    object.castShadow = shadow;
    object.receiveShadow = shadow;
    parent.add(object);
    return object;
  }

  const foot = mesh(new THREE.CylinderGeometry(1.37, 1.36, .065, 80), darkMaterial, fan, 0, .063, -.25);
  foot.scale.z = .76;
  const baseProfile = [[0, .075], [.8, .075], [1.23, .085], [1.39, .12], [1.46, .18], [1.46, .22], [1.42, .275], [1.32, .315], [1.20, .34], [0, .34]].map(([r, y]) => new THREE.Vector2(r, y));
  const base = mesh(new THREE.LatheGeometry(baseProfile, 96), bodyMaterial, fan, 0, 0, -.25);
  base.scale.z = .76;
  mesh(new THREE.CylinderGeometry(.145, .19, 3.40, 48), bodyMaterial, fan, 0, 2.04, -.90);
  mesh(new THREE.CylinderGeometry(.185, .22, .10, 48), silverMaterial, fan, 0, .37, -.90);
  mesh(new THREE.CylinderGeometry(.148, .148, .06, 48), silverMaterial, fan, 0, 3.71, -.90);

  const ledMaterial = new THREE.MeshStandardMaterial({ color: 0x73747f, emissive: 0xbac3e3, emissiveIntensity: 0, roughness: .35 });
  const led = mesh(new THREE.CircleGeometry(.034, 24), ledMaterial, fan, 0, .345, .45);
  led.rotation.x = -Math.PI / 2;

  const headYaw = new THREE.Group();
  headYaw.position.set(0, 3.78, -.90);
  fan.add(headYaw);
  mesh(new THREE.SphereGeometry(.15, 32, 24), silverMaterial, headYaw, 0, -.08, 0);
  const forkCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(-.54, .24, 0), new THREE.Vector3(-.48, .03, 0), new THREE.Vector3(0, -.03, 0), new THREE.Vector3(.48, .03, 0), new THREE.Vector3(.54, .24, 0)]);
  mesh(new THREE.TubeGeometry(forkCurve, 32, .065, 12, false), bodyMaterial, headYaw);
  const hinge = mesh(new THREE.CylinderGeometry(.095, .095, 1.16, 32), silverMaterial, headYaw, 0, .24, 0);
  hinge.rotation.z = Math.PI / 2;
  for (const x of [-.54, .54]) {
    const cap = mesh(new THREE.CylinderGeometry(.125, .125, .07, 32), darkMaterial, headYaw, x, .24, 0);
    cap.rotation.z = Math.PI / 2;
  }
  const headPitch = new THREE.Group();
  headPitch.position.set(0, .24, 0);
  headYaw.add(headPitch);
  const head = new THREE.Group();
  head.position.set(0, .29, .90);
  headPitch.add(head);

  const motorProfile = [[0, -1.01], [.28, -1.01], [.39, -.95], [.43, -.84], [.43, -.25], [.40, -.17], [.27, -.09], [0, -.09]].map(([r, z]) => new THREE.Vector2(r, z));
  const motorGeometry = new THREE.LatheGeometry(motorProfile, 64);
  motorGeometry.rotateX(Math.PI / 2);
  mesh(motorGeometry, bodyMaterial, head);
  const rearCap = mesh(new THREE.CylinderGeometry(.245, .245, .018, 48), darkMaterial, head, 0, 0, -1.015);
  rearCap.rotation.x = Math.PI / 2;
  const shaft = mesh(new THREE.CylinderGeometry(.09, .09, .20, 32), silverMaterial, head, 0, 0, -.08);
  shaft.rotation.x = Math.PI / 2;

  const shellProfile = [[1.63, .30], [1.66, .40], [1.76, .42], [1.82, .34], [1.845, .16], [1.845, -.16], [1.81, -.34], [1.72, -.41], [1.63, -.36], [1.62, -.30], [1.70, -.28], [1.745, -.13], [1.745, .13], [1.69, .28], [1.63, .30]].map(([r, z]) => new THREE.Vector2(r, z)).reverse();
  const shellGeometry = new THREE.LatheGeometry(shellProfile, 112);
  shellGeometry.rotateX(Math.PI / 2);
  mesh(shellGeometry, bodyMaterial, head);

  function createGrille(front) {
    const geometries = [];
    const count = front ? 56 : 32;
    const dome = radius => (front ? 1 : -1) * (.54 - .18 * (radius / 1.75) ** 2);
    const radii = front ? [.30, .74, 1.25, 1.655] : [.50, .84, 1.25, 1.655];
    for (let index = 0; index < count; index++) {
      const angle = index * Math.PI * 2 / count;
      const points = radii.map((radius, pointIndex) => {
        const offset = pointIndex === 1 || pointIndex === 2 ? .025 : 0;
        return new THREE.Vector3(Math.cos(angle + offset) * radius, Math.sin(angle + offset) * radius, dome(radius));
      });
      geometries.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 14, front ? .008 : .009, 6, false));
    }
    for (const radius of front ? [.43, .76, 1.10, 1.42, 1.64] : [.54, .82, 1.10, 1.42, 1.64]) {
      const ring = new THREE.TorusGeometry(radius, .0075, 6, 96);
      ring.translate(0, 0, dome(radius));
      geometries.push(ring);
    }
    const merged = mergeGeometries(geometries, false);
    for (const geometry of geometries) geometry.dispose();
    mesh(merged, wireMaterial, head);
  }
  createGrille(true);
  createGrille(false);

  const rotor = new THREE.Group();
  rotor.position.z = .025;
  head.add(rotor);
  const bladeShape = new THREE.Shape();
  bladeShape.moveTo(.04, .30);
  bladeShape.bezierCurveTo(-.08, .64, -.28, 1.22, -.10, 1.48);
  bladeShape.bezierCurveTo(.06, 1.64, .59, 1.54, .73, 1.27);
  bladeShape.bezierCurveTo(.58, .91, .20, .57, .07, .30);
  bladeShape.quadraticCurveTo(.05, .28, .04, .30);
  const bladeGeometry = new THREE.ExtrudeGeometry(bladeShape, { depth: .028, bevelEnabled: true, bevelThickness: .008, bevelSize: .012, bevelSegments: 3, curveSegments: 24 });
  const positions = bladeGeometry.attributes.position;
  for (let index = 0; index < positions.count; index++) {
    const x = positions.getX(index);
    const y = positions.getY(index);
    const radius = Math.hypot(x, y);
    const pitch = .085 * Math.max(0, (radius - .30) / 1.35) ** 1.5 * Math.sin(Math.atan2(y, x) + .35);
    positions.setZ(index, positions.getZ(index) + pitch);
  }
  bladeGeometry.computeVertexNormals();
  for (let index = 0; index < 5; index++) {
    const blade = mesh(bladeGeometry, bladeMaterial, rotor);
    blade.rotation.z = index * Math.PI * 2 / 5;
  }
  const rotorHub = mesh(new THREE.CylinderGeometry(.32, .36, .26, 48), bodyMaterial, rotor, 0, 0, .075);
  rotorHub.rotation.x = Math.PI / 2;

  const frontHub = mesh(new THREE.SphereGeometry(.31, 40, 24), bodyMaterial, head, 0, 0, .55);
  frontHub.scale.z = .30;
  mesh(new THREE.CircleGeometry(.08, 40), silverMaterial, head, 0, 0, .648);

  const floor = mesh(new THREE.PlaneGeometry(200, 200), new THREE.ShadowMaterial({ color: 0x08090d, opacity: .35 }), scene, 0, 0, 0, false);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  const contact = mesh(new THREE.PlaneGeometry(4.8, 3.8), new THREE.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: {}, vertexShader: 'varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}', fragmentShader: 'varying vec2 vUv; void main(){vec2 p=(vUv-.5)*2.0; float a=exp(-dot(p,p)*5.5)*.28; gl_FragColor=vec4(.015,.016,.022,a);}' }), scene, 0, .005, -.25, false);
  contact.rotation.x = -Math.PI / 2;

  const controls = new OrbitControls(camera, modelCanvas);
  controls.target.set(0, 3.05, 0);
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.enableDamping = !reducedMotion.matches;
  controls.dampingFactor = .08;
  controls.rotateSpeed = .55;
  controls.minPolarAngle = .55;
  controls.maxPolarAngle = Math.PI / 2 + .12;
  controls.addEventListener('change', wake);
  let fitDistance = 14;

  function setCameraAngles(theta, phi) {
    controls.enableDamping = false;
    controls.update();
    camera.position.setFromSpherical(new THREE.Spherical(fitDistance, phi, theta)).add(controls.target);
    controls.update();
    controls.enableDamping = !reducedMotion.matches;
    wake();
  }

  function resetView() { setCameraAngles(.27, 1.43); }

  function resize() {
    const width = Math.max(1, viewer.clientWidth);
    const height = Math.max(1, viewer.clientHeight);
    const ratio = width / height;
    camera.aspect = ratio;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    const tangent = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    fitDistance = Math.max(6.25 / (2 * tangent), 4.15 / (2 * tangent * ratio)) * 1.12;
    const offset = camera.position.clone().sub(controls.target);
    if (offset.lengthSq() > .01) camera.position.copy(offset.normalize().multiplyScalar(fitDistance).add(controls.target));
    controls.update();
    wake();
  }

  resetView();
  resize();
  const observer = new ResizeObserver(resize);
  observer.observe(viewer);
  return { THREE, renderer, scene, camera, controls, headYaw, headPitch, rotor, ledMaterial, resetView, setCameraAngles, observer, environmentTarget };
}

function showNotice(message) {
  clearTimeout(noticeTimeout);
  notice.textContent = message;
  notice.classList.add('is-visible');
  noticeTimeout = window.setTimeout(() => notice.classList.remove('is-visible'), 2200);
}

function updatePowerLabel() {
  const label = state.power ? descriptions[state.speed] : velocity > .08 ? '正在停转' : '已关闭';
  if (label !== previousPowerLabel) {
    powerLabel.textContent = label;
    previousPowerLabel = label;
  }
}

function renderDirection() {
  directionInput.value = String(state.direction);
  directionValue.textContent = state.direction === 0 ? '0°' : `${state.direction > 0 ? '右' : '左'} ${Math.abs(state.direction)}°`;
  directionInput.setAttribute('aria-valuetext', state.direction === 0 ? '正前方，0度' : `${state.direction > 0 ? '向右' : '向左'}，${Math.abs(state.direction)}度`);
}

function renderControls() {
  canvas.classList.toggle('is-on', state.power);
  powerButton.setAttribute('aria-pressed', String(state.power));
  const label = state.power ? '关闭风扇' : '开启风扇';
  powerButton.setAttribute('aria-label', label);
  powerButton.title = label;
  for (const button of speedButtons) {
    const selected = Number(button.dataset.speed) === state.speed;
    button.classList.toggle('is-selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  }
  oscillationToggle.setAttribute('aria-checked', String(state.oscillation));
  tiltInput.value = String(state.tilt);
  tiltValue.textContent = `${state.tilt > 0 ? '+' : ''}${state.tilt}°`;
  tiltInput.setAttribute('aria-valuetext', state.tilt === 0 ? '水平，0度' : `${state.tilt > 0 ? '向上' : '向下'}，${Math.abs(state.tilt)}度`);
  renderDirection();
  for (const button of timerButtons) {
    const selected = Number(button.dataset.minutes) === state.timerMinutes;
    button.classList.toggle('is-selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  }
  soundButton.setAttribute('aria-pressed', String(state.sound));
  const soundLabel = state.sound ? '关闭风扇声音' : '开启风扇声音';
  soundButton.setAttribute('aria-label', soundLabel);
  soundButton.title = soundLabel;
  soundButton.querySelector('i').className = state.sound ? 'ti ti-volume' : 'ti ti-volume-off';
  updatePowerLabel();
}

function clearTimer() {
  window.clearInterval(timerInterval);
  timerInterval = 0;
  state.timerMinutes = 0;
  state.deadline = 0;
  timerValue.textContent = '未设定';
}

function setPower(power) {
  state.power = power;
  if (!power) clearTimer();
  renderControls();
  wake();
}

function setSpeed(speed) {
  state.speed = speed;
  setPower(true);
}

function toggleOscillation() {
  state.oscillation = !state.oscillation;
  if (state.oscillation) {
    const phase = Math.asin(Math.max(-1, Math.min(1, currentYaw / 45)));
    oscillationPhase = Math.cos(oscillationPhase) >= 0 ? phase : Math.PI - phase;
  } else {
    targetYaw = currentYaw;
    state.direction = Math.round(currentYaw);
  }
  renderControls();
  wake();
}

function updateTimer() {
  if (!state.deadline) return;
  const remaining = Math.max(0, Math.ceil((state.deadline - performance.now()) / 1000));
  if (remaining === 0) {
    setPower(false);
    showNotice('定时结束，风扇已关闭');
    return;
  }
  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor(remaining % 3600 / 60);
  const seconds = remaining % 60;
  timerValue.textContent = `${hours ? `${hours}:` : ''}${hours ? String(minutes).padStart(2, '0') : minutes}:${String(seconds).padStart(2, '0')}`;
}

function setTimer(minutes) {
  if (minutes > 0 && !state.power) {
    showNotice('请先开启风扇');
    return;
  }
  clearTimer();
  if (minutes > 0) {
    state.timerMinutes = minutes;
    state.deadline = performance.now() + minutes * 60000;
    updateTimer();
    timerInterval = window.setInterval(updateTimer, 1000);
  }
  renderControls();
}

function createAudio() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) throw new Error('AudioContext unavailable');
  const context = new AudioContextClass();
  const buffer = context.createBuffer(1, context.sampleRate * 3, context.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let index = 0; index < samples.length; index++) samples[index] = Math.random() * 2 - 1;
  const wind = context.createBufferSource();
  wind.buffer = buffer;
  wind.loop = true;
  const lowpass = context.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = 650;
  lowpass.Q.value = .45;
  const highpass = context.createBiquadFilter();
  highpass.type = 'highpass';
  highpass.frequency.value = 85;
  const windGain = context.createGain();
  windGain.gain.value = 0;
  wind.connect(lowpass).connect(highpass).connect(windGain).connect(context.destination);
  const motor = context.createOscillator();
  motor.type = 'sine';
  motor.frequency.value = 72;
  const motorGain = context.createGain();
  motorGain.gain.value = 0;
  motor.connect(motorGain).connect(context.destination);
  wind.start();
  motor.start();
  return { context, lowpass, windGain, motor, motorGain };
}

function updateAudio(force = false) {
  if (!audio) return;
  const level = state.sound && !document.hidden ? velocity / speeds[3] : 0;
  if (!force && Math.abs(level - previousAudioLevel) < .008) return;
  previousAudioLevel = level;
  const now = audio.context.currentTime;
  audio.windGain.gain.setTargetAtTime(level * .12, now, .12);
  audio.motorGain.gain.setTargetAtTime(level * .007, now, .12);
  audio.lowpass.frequency.setTargetAtTime(450 + level * 600, now, .15);
  audio.motor.frequency.setTargetAtTime(72 + level * 36, now, .15);
}

async function toggleSound() {
  const request = ++audioRequest;
  state.sound = !state.sound;
  renderControls();
  if (!state.sound) {
    updateAudio(true);
    return;
  }
  try {
    if (!audio) audio = createAudio();
    await audio.context.resume();
    if (request !== audioRequest) return;
    updateAudio(true);
    wake();
  } catch {
    if (request !== audioRequest) return;
    state.sound = false;
    renderControls();
    showNotice('声音暂时不可用，请重试');
  }
}

function frame(timestamp) {
  frameId = 0;
  rendering = true;
  const delta = lastFrame ? Math.min((timestamp - lastFrame) / 1000, .05) : 1 / 60;
  lastFrame = timestamp;
  const targetVelocity = state.power ? speeds[state.speed] : 0;
  velocity += (targetVelocity - velocity) * (1 - Math.exp(-delta / (targetVelocity > velocity ? .85 : 1.55)));
  if (Math.abs(velocity - targetVelocity) < .005) velocity = targetVelocity;
  const follow = reducedMotion.matches ? 1 : 1 - Math.exp(-delta / .12);
  currentTilt += (state.tilt - currentTilt) * follow;
  if (Math.abs(currentTilt - state.tilt) < .01) currentTilt = state.tilt;
  if (!reducedMotion.matches) {
    rotorAngle = (rotorAngle - velocity * delta) % (Math.PI * 2);
    if (state.oscillation && velocity > .005) {
      oscillationPhase += delta * Math.PI * 2 / 9 * Math.min(1, velocity / speeds[1]);
      targetYaw = Math.sin(oscillationPhase) * 45;
    }
  }
  currentYaw += (targetYaw - currentYaw) * follow;
  if (Math.abs(currentYaw - targetYaw) < .01) currentYaw = targetYaw;
  if (state.oscillation && Math.round(currentYaw) !== state.direction) {
    state.direction = Math.round(currentYaw);
    renderDirection();
  }
  let cameraMoving = false;
  if (model && !model.contextLost) {
    model.rotor.rotation.z = rotorAngle;
    model.headYaw.rotation.y = currentYaw * Math.PI / 180;
    model.headPitch.rotation.x = -currentTilt * Math.PI / 180;
    model.ledMaterial.emissiveIntensity = state.power ? .8 : 0;
    cameraMoving = model.controls.update();
    model.renderer.render(model.scene, model.camera);
  }
  updatePowerLabel();
  updateAudio();
  rendering = false;
  const moving = !reducedMotion.matches && velocity > 0;
  const settling = Math.abs(velocity - targetVelocity) > .001 || Math.abs(currentTilt - state.tilt) > .01 || Math.abs(currentYaw - targetYaw) > .01;
  if (moving || settling || cameraMoving) wake();
  else lastFrame = 0;
}

function wake() {
  if (!frameId && !rendering && !document.hidden) frameId = requestAnimationFrame(frame);
}

function reset() {
  state.power = false;
  state.speed = 1;
  state.oscillation = false;
  state.tilt = 0;
  state.direction = 0;
  targetYaw = 0;
  oscillationPhase = 0;
  clearTimer();
  renderControls();
  model?.resetView();
  settings.open = false;
  settings.querySelector('summary').focus();
  wake();
}

powerButton.addEventListener('click', () => setPower(!state.power));
for (const button of speedButtons) button.addEventListener('click', () => setSpeed(Number(button.dataset.speed)));
for (const button of timerButtons) button.addEventListener('click', () => setTimer(Number(button.dataset.minutes)));
oscillationToggle.addEventListener('click', toggleOscillation);
tiltInput.addEventListener('input', () => { state.tilt = Number(tiltInput.value); renderControls(); wake(); });
directionInput.addEventListener('input', () => {
  state.oscillation = false;
  state.direction = Number(directionInput.value);
  targetYaw = state.direction;
  renderControls();
  wake();
});
soundButton.addEventListener('click', toggleSound);
document.querySelector('#reset-button').addEventListener('click', reset);
document.querySelector('#reload-button').addEventListener('click', () => window.location.reload());
document.querySelector('#view-reset').addEventListener('click', () => model?.resetView());
document.querySelector('#brand-home').addEventListener('click', event => { event.preventDefault(); model?.resetView(); });
document.addEventListener('pointerdown', event => { if (settings.open && !settings.contains(event.target)) settings.open = false; });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && settings.open) {
    settings.open = false;
    settings.querySelector('summary').focus();
  }
});
modelCanvas.addEventListener('keydown', event => {
  if (!model || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home'].includes(event.key)) return;
  event.preventDefault();
  if (event.key === 'Home') { model.resetView(); return; }
  const spherical = new model.THREE.Spherical().setFromVector3(model.camera.position.clone().sub(model.controls.target));
  if (event.key === 'ArrowLeft') spherical.theta -= .14;
  if (event.key === 'ArrowRight') spherical.theta += .14;
  if (event.key === 'ArrowUp') spherical.phi -= .10;
  if (event.key === 'ArrowDown') spherical.phi += .10;
  model.setCameraAngles(spherical.theta, Math.max(model.controls.minPolarAngle, Math.min(model.controls.maxPolarAngle, spherical.phi)));
});
reducedMotion.addEventListener('change', () => { if (model) model.controls.enableDamping = !reducedMotion.matches; wake(); });
document.addEventListener('visibilitychange', async () => {
  if (document.hidden) {
    cancelAnimationFrame(frameId);
    frameId = 0;
    lastFrame = 0;
    updateAudio(true);
    if (audio) await audio.context.suspend().catch(() => {});
  } else {
    updateTimer();
    wake();
    if (audio && state.sound) {
      try { await audio.context.resume(); updateAudio(true); }
      catch { state.sound = false; renderControls(); showNotice('点击声音按钮恢复声音'); }
    }
  }
});
modelCanvas.addEventListener('webglcontextlost', event => {
  event.preventDefault();
  if (model) model.contextLost = true;
  cancelAnimationFrame(frameId);
  frameId = 0;
  setPower(false);
  for (const control of document.querySelectorAll('[data-model-control]')) control.disabled = true;
  const message = document.querySelector('#model-message');
  message.hidden = false;
  message.classList.add('has-error');
  document.querySelector('#model-message-text').textContent = '图形连接已中断，请重新加载';
  document.querySelector('#reload-button').hidden = false;
});

renderControls();
createModel().then(result => {
  model = result;
  for (const control of document.querySelectorAll('[data-model-control]')) control.disabled = false;
  document.querySelector('#model-message').hidden = true;
  wake();
}).catch(error => {
  console.error('风扇模型加载失败', error);
  const message = document.querySelector('#model-message');
  message.classList.add('has-error');
  document.querySelector('#model-message-text').textContent = '无法显示风扇，请检查网络或浏览器图形设置';
  document.querySelector('#reload-button').hidden = false;
});
