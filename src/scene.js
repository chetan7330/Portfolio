import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const colors = [0xb6f7d2, 0x9e8cff, 0x8ac5ff];
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

function setup(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0, 7.5);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, 0.04);
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.45;
  room.dispose();
  pmrem.dispose();
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  for (const [color, position, intensity] of [
    [0xb6f7d2, [-4, 4, 5], 30],
    [0x9071ff, [4, 1, 2], 35],
    [0xa6d7ff, [0, -4, 3], 20],
  ]) {
    const light = new THREE.PointLight(color, intensity);
    light.position.set(...position);
    scene.add(light);
  }
  const resize = () => {
    const { width, height } = canvas.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  };
  const dispose = () => {
    renderer.setAnimationLoop(null);
    const resources = new Set();
    scene.traverse((object) => {
      if (object.geometry) resources.add(object.geometry);
      if (object.material)
        (Array.isArray(object.material)
          ? object.material
          : [object.material]
        ).forEach((item) => resources.add(item));
    });
    resources.forEach((resource) => resource.dispose());
    environment.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
  };
  return { renderer, scene, camera, resize, dispose };
}

function material(color, extra = {}) {
  return new THREE.MeshPhysicalMaterial({
    color,
    metalness: 0.82,
    roughness: 0.2,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
    iridescence: 1,
    iridescenceIOR: 1.6,
    iridescenceThicknessRange: [100, 800],
    ...extra,
  });
}

export function createWorld(canvas, { onSelect, onPause, onError }) {
  const { renderer, scene, camera, resize, dispose } = setup(canvas);
  const events = new AbortController();
  const on = (target, name, handler) =>
    target.addEventListener(name, handler, { signal: events.signal });
  const sculpture = new THREE.Group();
  scene.add(sculpture);
  const knotMaterial = material(0xbbded4);
  const forms = [
    new THREE.TorusKnotGeometry(1.04, 0.32, 180, 28, 2, 3),
    new THREE.TorusKnotGeometry(1.04, 0.24, 180, 28, 3, 4),
    new THREE.IcosahedronGeometry(1.6, 1),
  ];
  const knot = new THREE.Mesh(forms[0], knotMaterial);
  knot.rotation.set(0.35, 0.25, 0);
  sculpture.add(knot);
  const satellites = [];
  for (let i = 0; i < 3; i++) {
    const orbit = new THREE.Group();
    orbit.rotation.set(
      ...[
        [0.9, 0.2, 0.1],
        [0.6, -0.6, -0.3],
        [1.15, -0.35, 0.7],
      ][i],
    );
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.08 + i * 0.06, 0.007, 6, 160),
      material(colors[i], { roughness: 0.35, metalness: 0.7 }),
    );
    orbit.add(ring);
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.095 + i * 0.01, 20, 16),
      material(colors[i]),
    );
    const angle = i * Math.PI * 0.65;
    sphere.position.set(Math.cos(angle) * 2.13, Math.sin(angle) * 2.13, 0);
    sphere.userData.index = i;
    satellites.push(sphere);
    orbit.add(sphere);
    sculpture.add(orbit);
  }
  let paused = reducedMotion.matches,
    visible = true,
    dragging = false,
    startX = 0,
    startY = 0,
    previousX = 0,
    previousY = 0,
    lastTime = 0;
  const render = () => renderer.render(scene, camera);
  const syncRotation = () => {
    canvas.dataset.rotation = `${sculpture.rotation.x.toFixed(3)},${sculpture.rotation.y.toFixed(3)}`;
  };
  const animate = (time) => {
    const delta = Math.min((time - lastTime) / 1000 || 0, 0.05);
    lastTime = time;
    if (!dragging) {
      sculpture.rotation.y += delta * 0.12;
      knot.rotation.z += delta * 0.025;
    }
    syncRotation();
    render();
  };
  const updateLoop = () => {
    renderer.setAnimationLoop(
      !paused && visible && !document.hidden ? animate : null,
    );
    lastTime = 0;
    onPause(paused);
    render();
  };
  const reset = () => {
    sculpture.rotation.set(0, 0, 0);
    knot.rotation.set(0.35, 0.25, 0);
    syncRotation();
    render();
  };
  on(reducedMotion, "change", (event) => {
    paused = event.matches;
    updateLoop();
  });
  on(document, "visibilitychange", updateLoop);
  const observer = new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
      updateLoop();
    },
    { threshold: 0 },
  );
  observer.observe(canvas);
  const resizer = new ResizeObserver(resize);
  resizer.observe(canvas.parentElement);
  on(canvas, "pointerdown", (event) => {
    if (event.button !== 0) return;
    dragging = true;
    startX = previousX = event.clientX;
    startY = previousY = event.clientY;
    canvas.setPointerCapture(event.pointerId);
  });
  on(canvas, "pointermove", (event) => {
    if (!dragging) return;
    sculpture.rotation.y += (event.clientX - previousX) * 0.007;
    sculpture.rotation.x = THREE.MathUtils.clamp(
      sculpture.rotation.x + (event.clientY - previousY) * 0.004,
      -1.1,
      1.1,
    );
    previousX = event.clientX;
    previousY = event.clientY;
    syncRotation();
    render();
  });
  const raycaster = new THREE.Raycaster();
  const select = (index) => {
    knot.geometry = forms[index];
    knotMaterial.flatShading = index === 2;
    knotMaterial.needsUpdate = true;
    knotMaterial.color.setHex(colors[index]).multiplyScalar(0.62);
    satellites.forEach((sphere, i) =>
      sphere.scale.setScalar(i === index ? 1.4 : 1),
    );
    canvas.dataset.discipline = String(index);
    render();
  };
  on(canvas, "pointerup", (event) => {
    if (
      dragging &&
      Math.hypot(event.clientX - startX, event.clientY - startY) < 5
    ) {
      const bounds = canvas.getBoundingClientRect();
      raycaster.setFromCamera(
        new THREE.Vector2(
          ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
          (-(event.clientY - bounds.top) / bounds.height) * 2 + 1,
        ),
        camera,
      );
      const hit = raycaster.intersectObjects(satellites)[0];
      if (hit) {
        select(hit.object.userData.index);
        onSelect(hit.object.userData.index);
      }
    }
    dragging = false;
    if (canvas.hasPointerCapture(event.pointerId))
      canvas.releasePointerCapture(event.pointerId);
  });
  on(canvas, "pointercancel", () => {
    dragging = false;
  });
  on(canvas, "lostpointercapture", () => {
    dragging = false;
  });
  on(canvas, "keydown", (event) => {
    if (
      !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)
    )
      return;
    event.preventDefault();
    if (event.key === "ArrowLeft") sculpture.rotation.y -= 0.15;
    if (event.key === "ArrowRight") sculpture.rotation.y += 0.15;
    if (event.key === "ArrowUp") sculpture.rotation.x -= 0.15;
    if (event.key === "ArrowDown") sculpture.rotation.x += 0.15;
    sculpture.rotation.x = THREE.MathUtils.clamp(
      sculpture.rotation.x,
      -1.1,
      1.1,
    );
    syncRotation();
    render();
  });
  on(canvas, "webglcontextlost", (event) => {
    event.preventDefault();
    renderer.setAnimationLoop(null);
    onError();
  });
  canvas.dataset.ready = "true";
  select(0);
  resize();
  syncRotation();
  updateLoop();
  return {
    select,
    reset,
    pause: (value) => {
      paused = value;
      updateLoop();
    },
    dispose: () => {
      forms.forEach((geometry) => {
        if (geometry !== knot.geometry) geometry.dispose();
      });
      events.abort();
      observer.disconnect();
      resizer.disconnect();
      dispose();
    },
  };
}

export function createPreview(container) {
  const canvas = document.createElement("canvas");
  container.prepend(canvas);
  const { renderer, scene, camera, resize, dispose } = setup(canvas);
  const events = new AbortController();
  const on = (target, name, handler) =>
    target.addEventListener(name, handler, { signal: events.signal });
  const object = new THREE.Group();
  const type = container.dataset.preview;
  const color =
    type === "cloud" || type === "simman"
      ? colors[0]
      : type === "posthct"
        ? colors[1]
        : colors[2];
  const surface = material(color, { metalness: 0.5, roughness: 0.2 });
  const platform = new THREE.Mesh(
    new THREE.BoxGeometry(3.1, 0.045, 2.4),
    material(0x141e30, { metalness: 0.85, roughness: 0.12 }),
  );
  platform.position.y = -1;
  object.add(platform);
  if (type === "cloud" || type === "simman") {
    const positions = [
      [0, 0, 0],
      [-0.55, -0.55, 0],
      [0.55, -0.55, 0],
      [0, -0.55, 0.55],
      [0, -0.55, -0.55],
      [0, 0.55, 0],
      [-0.55, 0, 0],
      [0.55, 0, 0],
      [0, 0, 0.55],
      [1.05, 0.55, -0.6],
      [-1, -0.45, 0.65],
    ];
    for (const position of positions) {
      const cube = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.5, 0.5),
        surface,
      );
      cube.position.set(...position);
      object.add(cube);
      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(cube.geometry),
        new THREE.LineBasicMaterial({
          color: 0xe4fff2,
          transparent: true,
          opacity: 0.25,
        }),
      );
      cube.add(edges);
    }
  } else if (type === "posthct") {
    for (let i = 0; i < 4; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.62 + i * 0.19, 0.085, 16, 80),
        surface,
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.5 - i * 0.32;
      object.add(ring);
    }
  } else {
    for (let i = 0; i < 4; i++) {
      const plate = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.075, 1.45),
        surface,
      );
      plate.position.y = -0.6 + i * 0.34;
      plate.rotation.y = i * 0.06;
      object.add(plate);
    }
  }
  object.rotation.set(0.32, -0.6, 0);
  scene.add(object);
  camera.position.set(3.2, 2.4, 4.3);
  camera.lookAt(0, -0.1, 0);
  const render = () => renderer.render(scene, camera);
  const resizer = new ResizeObserver(resize);
  resizer.observe(container);
  on(container, "pointermove", (event) => {
    if (reducedMotion.matches || event.pointerType === "touch") return;
    const bounds = container.getBoundingClientRect();
    object.rotation.y =
      -0.6 + ((event.clientX - bounds.left) / bounds.width - 0.5) * 0.7;
    object.rotation.x =
      0.32 + ((event.clientY - bounds.top) / bounds.height - 0.5) * 0.2;
    render();
  });
  on(container, "pointerleave", () => {
    object.rotation.set(0.32, -0.6, 0);
    render();
  });
  resize();
  container.dataset.ready = "true";
  return () => {
    events.abort();
    resizer.disconnect();
    dispose();
    canvas.remove();
  };
}
