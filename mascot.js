const canvas = document.getElementById('redline-canvas');
const root = document.documentElement;
const body = document.body;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const mix = (from, to, amount) => from + (to - from) * amount;

function showFallback() {
  root.classList.add('no-webgl');
  canvas.dataset.mascot = 'fallback';
}

async function startMascot() {
  let THREE;
  try {
    THREE = await import('https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.min.js');
  } catch (error) {
    showFallback();
    return;
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: innerWidth >= 800,
      powerPreference: 'high-performance'
    });
  } catch (error) {
    showFallback();
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 0, 9);

  renderer.setClearColor(0xffffff, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = innerWidth >= 800;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const themeRed = () => getComputedStyle(body).getPropertyValue('--red').trim() || '#e21d2d';
  const redMaterial = new THREE.MeshPhysicalMaterial({color: themeRed(), roughness: 0.28, metalness: 0.04, clearcoat: 0.62, clearcoatRoughness: 0.22});
  const redSoftMaterial = new THREE.MeshPhysicalMaterial({color: themeRed(), roughness: 0.42, metalness: 0.02, clearcoat: 0.28});
  const whiteMaterial = new THREE.MeshPhysicalMaterial({color: 0xffffff, roughness: 0.22, metalness: 0.02, clearcoat: 0.5});
  const grayMaterial = new THREE.MeshStandardMaterial({color: 0xd8dde1, roughness: 0.5, metalness: 0.06});
  const darkMaterial = new THREE.MeshStandardMaterial({color: 0x292b30, roughness: 0.32});
  const eyeLightMaterial = new THREE.MeshBasicMaterial({color: 0xffffff});

  const mascot = new THREE.Group();
  mascot.name = 'AlimentaMascot';
  scene.add(mascot);

  const mesh = (geometry, material, parent = mascot) => {
    const item = new THREE.Mesh(geometry, material);
    item.castShadow = true;
    item.receiveShadow = true;
    parent.add(item);
    return item;
  };

  const torso = mesh(new THREE.CapsuleGeometry(0.66, 0.9, 8, 24), redMaterial);
  torso.name = 'Torso';
  torso.position.y = 0.48;
  torso.scale.z = 0.76;

  const waist = mesh(new THREE.SphereGeometry(0.58, 24, 16), grayMaterial);
  waist.name = 'Waist';
  waist.position.y = -0.72;
  waist.scale.set(1, 0.55, 0.75);

  const headPivot = new THREE.Group();
  headPivot.name = 'Head';
  headPivot.position.y = 2.02;
  mascot.add(headPivot);
  const head = mesh(new THREE.SphereGeometry(0.72, 32, 24), redMaterial, headPivot);
  head.scale.set(1, 0.96, 0.92);

  const face = mesh(new THREE.SphereGeometry(0.55, 28, 20), whiteMaterial, headPivot);
  face.position.set(0, -0.02, 0.53);
  face.scale.set(0.92, 0.69, 0.2);

  const createEye = x => {
    const eye = mesh(new THREE.SphereGeometry(0.082, 16, 12), darkMaterial, headPivot);
    eye.position.set(x, 0.08, 0.68);
    eye.scale.y = 1.12;
    const highlight = mesh(new THREE.SphereGeometry(0.025, 10, 8), eyeLightMaterial, headPivot);
    highlight.position.set(x - 0.018, 0.115, 0.75);
    return eye;
  };
  const leftEye = createEye(-0.19);
  const rightEye = createEye(0.19);

  const smileCurve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-0.17, -0.17, 0.72),
    new THREE.Vector3(0, -0.27, 0.78),
    new THREE.Vector3(0.17, -0.17, 0.72)
  );
  const smile = mesh(new THREE.TubeGeometry(smileCurve, 12, 0.025, 8, false), darkMaterial, headPivot);
  smile.name = 'Smile';

  const chestPanel = mesh(new THREE.SphereGeometry(0.38, 20, 14), whiteMaterial);
  chestPanel.name = 'ChestPanel';
  chestPanel.position.set(0, 0.68, 0.6);
  chestPanel.scale.set(1, 0.56, 0.16);
  const chestDot = mesh(new THREE.SphereGeometry(0.09, 16, 12), redSoftMaterial);
  chestDot.position.set(0, 0.68, 0.68);

  function createArm(side) {
    const shoulder = new THREE.Group();
    shoulder.name = side < 0 ? 'LeftArm' : 'RightArm';
    shoulder.position.set(side * 0.78, 1.1, 0);
    shoulder.rotation.z = side * -0.12;
    mascot.add(shoulder);

    const upper = mesh(new THREE.CapsuleGeometry(0.18, 0.55, 6, 16), redSoftMaterial, shoulder);
    upper.position.y = -0.42;
    const elbow = new THREE.Group();
    elbow.position.y = -0.82;
    shoulder.add(elbow);
    const joint = mesh(new THREE.SphereGeometry(0.2, 18, 14), grayMaterial, elbow);
    const forearm = mesh(new THREE.CapsuleGeometry(0.16, 0.5, 6, 16), redMaterial, elbow);
    forearm.position.y = -0.39;
    const hand = mesh(new THREE.SphereGeometry(0.21, 18, 14), whiteMaterial, elbow);
    hand.position.y = -0.78;
    hand.scale.set(0.9, 1.05, 0.88);
    return {shoulder, elbow, upper, forearm, hand, joint};
  }

  function createLeg(side) {
    const hip = new THREE.Group();
    hip.name = side < 0 ? 'LeftLeg' : 'RightLeg';
    hip.position.set(side * 0.34, -0.75, 0);
    mascot.add(hip);

    const thigh = mesh(new THREE.CapsuleGeometry(0.22, 0.66, 6, 18), redMaterial, hip);
    thigh.position.y = -0.5;
    const knee = new THREE.Group();
    knee.position.y = -1.02;
    hip.add(knee);
    const joint = mesh(new THREE.SphereGeometry(0.23, 18, 14), grayMaterial, knee);
    const shin = mesh(new THREE.CapsuleGeometry(0.19, 0.62, 6, 18), redSoftMaterial, knee);
    shin.position.y = -0.48;
    const foot = mesh(new THREE.CapsuleGeometry(0.2, 0.34, 6, 16), whiteMaterial, knee);
    foot.position.set(0, -0.93, 0.12);
    foot.rotation.x = Math.PI / 2;
    foot.scale.z = 1.22;
    return {hip, knee, thigh, shin, foot, joint};
  }

  const leftArm = createArm(-1);
  const rightArm = createArm(1);
  const leftLeg = createLeg(-1);
  const rightLeg = createLeg(1);

  const shadow = mesh(new THREE.CircleGeometry(1.35, 40), new THREE.ShadowMaterial({color: 0x5a1b22, opacity: 0.13}));
  shadow.name = 'GroundShadow';
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0, -2.02, 0.05);
  shadow.receiveShadow = true;
  shadow.castShadow = false;

  const hemisphere = new THREE.HemisphereLight(0xffffff, 0xe6e9ed, 2.2);
  scene.add(hemisphere);
  const keyLight = new THREE.DirectionalLight(0xffffff, 4.4);
  keyLight.position.set(-3.5, 6, 6);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(512, 512);
  keyLight.shadow.camera.near = 1;
  keyLight.shadow.camera.far = 18;
  scene.add(keyLight);
  const redLight = new THREE.PointLight(themeRed(), 7, 12, 2);
  redLight.position.set(4, 1.5, 4);
  scene.add(redLight);
  const fillLight = new THREE.DirectionalLight(0xdcecff, 1.6);
  fillLight.position.set(3, 2, -1);
  scene.add(fillLight);

  const pointer = new THREE.Vector2();
  const pointerTarget = new THREE.Vector2();
  let scrollPosition = window.scrollY;
  let frame = 0;
  let visible = !document.hidden;
  let blinkStarted = -10;
  let nextBlink = 2.5 + Math.random() * 2.5;

  function updateTheme() {
    const red = themeRed();
    redMaterial.color.set(red);
    redSoftMaterial.color.set(red);
    redLight.color.set(red);
  }

  function resize() {
    const mobile = innerWidth < 800;
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.3 : 1.7));
    renderer.setSize(innerWidth, innerHeight, false);
    renderer.shadowMap.enabled = !mobile;
    if (reducedMotion) render(performance.now());
  }

  function positionMascot(time) {
    const mobile = innerWidth < 800;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const progress = clamp(scrollPosition / maxScroll);
    const heroHeight = document.querySelector('.hero').offsetHeight;
    const heroProgress = clamp(scrollPosition / Math.max(1, heroHeight * 1.4));
    const baseScale = mix(mobile ? 0.19 : 0.62, mobile ? 0.17 : 0.38, heroProgress);
    const baseX = mix(mobile ? 0.48 : 2.05, mobile ? 0.62 : 2.55, heroProgress);
    const baseY = mix(mobile ? -0.62 : 0.26, mobile ? -1.02 : -0.52, progress);
    const breath = reducedMotion ? 0 : Math.sin(time * 1.65) * 0.018;

    mascot.scale.lerp(new THREE.Vector3(baseScale, baseScale * (1 + breath), baseScale), 0.07);
    mascot.position.x += (baseX + pointer.x * (mobile ? 0.05 : 0.13) - mascot.position.x) * 0.065;
    mascot.position.y += (baseY + breath * 2.4 - mascot.position.y) * 0.065;
    mascot.position.z += (mix(0, -0.75, heroProgress) - mascot.position.z) * 0.05;
    mascot.rotation.y += (pointer.x * 0.15 + progress * 0.1 - mascot.rotation.y) * 0.055;
    mascot.rotation.x += (-pointer.y * 0.045 - mascot.rotation.x) * 0.055;
  }

  function animateBody(time) {
    if (reducedMotion) return;
    const action = Number(body.dataset.action || 0);
    const idle = Math.sin(time * 1.45);
    const secondary = Math.sin(time * 0.82 + 0.6);
    const energy = action === 0 ? 0.13 : 0.055;

    torso.scale.y = 1 + Math.sin(time * 1.65) * 0.018;
    torso.rotation.z = secondary * 0.018;
    headPivot.position.y = 2.02 + Math.sin(time * 1.65) * 0.018;
    headPivot.rotation.y += (pointer.x * 0.13 - headPivot.rotation.y) * 0.08;
    headPivot.rotation.x += (-pointer.y * 0.06 - headPivot.rotation.x) * 0.08;

    const leftArmTarget = 0.11 + idle * energy;
    const rightArmTarget = action === 1 ? -0.72 + Math.sin(time * 1.8) * 0.05 : -0.11 - idle * energy;
    leftArm.shoulder.rotation.z += (leftArmTarget - leftArm.shoulder.rotation.z) * 0.08;
    rightArm.shoulder.rotation.z += (rightArmTarget - rightArm.shoulder.rotation.z) * 0.08;
    leftArm.shoulder.rotation.x = idle * energy * 0.9;
    rightArm.shoulder.rotation.x = -idle * energy * 0.9;
    rightArm.elbow.rotation.z += ((action === 1 ? -0.74 : 0) - rightArm.elbow.rotation.z) * 0.08;

    leftLeg.hip.rotation.x = -idle * energy * 0.28;
    rightLeg.hip.rotation.x = idle * energy * 0.28;
    leftLeg.hip.rotation.z = secondary * 0.012;
    rightLeg.hip.rotation.z = -secondary * 0.012;
    mascot.rotation.z = secondary * 0.012;

    if (time > nextBlink) {
      blinkStarted = time;
      nextBlink = time + 3.2 + Math.random() * 3.8;
    }
    const blinkAge = time - blinkStarted;
    const eyeScale = blinkAge >= 0 && blinkAge < 0.16 ? Math.max(0.08, Math.abs(blinkAge - 0.08) / 0.08) : 1;
    leftEye.scale.y = eyeScale;
    rightEye.scale.y = eyeScale;
  }

  function render(now) {
    frame = 0;
    if (!visible) return;
    const time = reducedMotion ? 1.2 : now / 1000;
    pointer.lerp(pointerTarget, 0.065);
    positionMascot(time);
    animateBody(time);
    renderer.render(scene, camera);
    if (!reducedMotion) frame = requestAnimationFrame(render);
  }

  addEventListener('pointermove', event => {
    pointerTarget.set((event.clientX / innerWidth) * 2 - 1, -((event.clientY / innerHeight) * 2 - 1));
    if (reducedMotion) render(performance.now());
  }, {passive: true});
  addEventListener('scroll', () => {
    scrollPosition = window.scrollY;
    if (reducedMotion) render(performance.now());
  }, {passive: true});
  addEventListener('resize', resize, {passive: true});
  document.addEventListener('visibilitychange', () => {
    visible = !document.hidden;
    if (!visible && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else if (visible && !frame) {
      frame = requestAnimationFrame(render);
    }
  });
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    if (frame) cancelAnimationFrame(frame);
    showFallback();
  });

  new MutationObserver(updateTheme).observe(body, {attributes: true, attributeFilter: ['data-theme']});
  updateTheme();
  resize();
  mascot.position.set(innerWidth < 800 ? 0.48 : 2.05, innerWidth < 800 ? -0.62 : 0.26, 0);
  mascot.scale.setScalar(innerWidth < 800 ? 0.19 : 0.62);
  canvas.dataset.mascot = 'ready';
  canvas.dataset.parts = String(mascot.children.length);
  frame = requestAnimationFrame(render);
}

startMascot();
