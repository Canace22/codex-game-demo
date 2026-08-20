(function () {
  'use strict';

  const canvas = document.getElementById('game-canvas');
  const startScreen = document.getElementById('start-screen');
  const startButton = document.getElementById('start-btn');
  const hud = document.getElementById('hud');
  const objectiveText = document.getElementById('objective-text');

  const state = {
    mode: 'menu',
    objective: '在山门前整备',
    player: { x: 0, y: 0, z: 12, vy: 0, grounded: true, facing: 0 },
    cameraYaw: 0,
    cameraPitch: -0.16,
    keys: Object.create(null),
  };

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x9ab3b0);
  scene.fog = new THREE.FogExp2(0x9ab3b0, 0.017);

  const camera = new THREE.PerspectiveCamera(54, 1, 0.1, 500);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  scene.add(new THREE.HemisphereLight(0xdde9de, 0x27332a, 1.25));
  const sun = new THREE.DirectionalLight(0xffe4ba, 2.1);
  sun.position.set(-24, 40, 20);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -55;
  sun.shadow.camera.right = 55;
  sun.shadow.camera.top = 55;
  sun.shadow.camera.bottom = -55;
  scene.add(sun);

  const world = new THREE.Group();
  const cameraBlockers = [];
  const cameraRay = new THREE.Raycaster();
  scene.add(world);

  function material(color, roughness) {
    return new THREE.MeshStandardMaterial({ color, roughness: roughness ?? 0.82, metalness: 0.02 });
  }

  function mesh(geometry, mat, position, parent) {
    const item = new THREE.Mesh(geometry, mat);
    item.position.set(position[0], position[1], position[2]);
    item.castShadow = true;
    item.receiveShadow = true;
    (parent || world).add(item);
    if (!parent) cameraBlockers.push(item);
    return item;
  }

  function createWorld() {
    const ground = mesh(new THREE.PlaneGeometry(220, 220), material(0x586b51), [0, -0.06, -45]);
    ground.rotation.x = -Math.PI / 2;

    const path = mesh(new THREE.PlaneGeometry(8, 145), material(0x8b826c, 0.96), [0, 0, -48]);
    path.rotation.x = -Math.PI / 2;
    path.rotation.z = -0.025;

    const mountainMat = material(0x526660, 1);
    for (let i = 0; i < 18; i += 1) {
      const angle = (i / 18) * Math.PI * 2;
      const radius = 72 + (i % 3) * 12;
      const height = 22 + (i % 5) * 7;
      const mountain = mesh(
        new THREE.ConeGeometry(12 + (i % 4) * 3, height, 7),
        mountainMat,
        [Math.sin(angle) * radius, height / 2 - 1, -48 + Math.cos(angle) * radius]
      );
      mountain.rotation.y = angle;
    }

    const wood = material(0x422f24);
    const roof = material(0x263936);
    [-12, 12].forEach((x) => mesh(new THREE.BoxGeometry(1.1, 8, 1.1), wood, [x, 4, 2]));
    mesh(new THREE.BoxGeometry(26, 1, 1.4), wood, [0, 8, 2]);
    const gateRoof = mesh(new THREE.ConeGeometry(18.2, 2.5, 4), roof, [0, 9.5, 2]);
    gateRoof.rotation.y = Math.PI / 4;
    gateRoof.scale.z = 0.38;

    for (let i = 0; i < 26; i += 1) {
      const side = i % 2 === 0 ? -1 : 1;
      const z = 8 - i * 4.7;
      const trunk = mesh(new THREE.CylinderGeometry(0.18, 0.3, 3.8, 6), wood, [side * (12 + (i % 3) * 2.4), 1.9, z]);
      const crown = mesh(new THREE.ConeGeometry(2.4 + (i % 2), 6.5, 7), material(0x315847), [trunk.position.x, 5.3, z]);
      crown.rotation.y = i;
    }

    const templeBase = mesh(new THREE.BoxGeometry(16, 4.5, 11), material(0x8a7964), [0, 2.25, -96]);
    const templeRoof = mesh(new THREE.ConeGeometry(13, 4, 4), roof, [0, 6.2, -96]);
    templeRoof.rotation.y = Math.PI / 4;
    templeRoof.scale.z = 0.7;
    templeBase.receiveShadow = true;
  }

  function createPlayer() {
    const group = new THREE.Group();
    const robe = material(0x334c54);
    const dark = material(0x171d1d);
    const skin = material(0xd7b08d);
    mesh(new THREE.CylinderGeometry(0.48, 0.76, 1.7, 8), robe, [0, 1.05, 0], group);
    mesh(new THREE.SphereGeometry(0.34, 12, 10), skin, [0, 2.15, 0], group);
    mesh(new THREE.CylinderGeometry(0.18, 0.27, 0.5, 8), dark, [0, 2.57, 0], group);
    const sword = mesh(new THREE.BoxGeometry(0.08, 0.08, 2.3), material(0xb5c8c8, 0.28), [0.55, 1.15, 0], group);
    sword.rotation.x = 0.18;
    sword.rotation.z = -0.24;
    group.traverse((child) => { if (child.isMesh) child.castShadow = true; });
    scene.add(group);
    return group;
  }

  createWorld();
  const playerMesh = createPlayer();

  function resize() {
    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / Math.max(height, 1);
    camera.updateProjectionMatrix();
  }

  function update(dt) {
    if (state.mode !== 'playing') return;
    const forward = Number(Boolean(state.keys.KeyW || state.keys.ArrowUp)) - Number(Boolean(state.keys.KeyS || state.keys.ArrowDown));
    const strafe = Number(Boolean(state.keys.KeyD || state.keys.ArrowRight)) - Number(Boolean(state.keys.KeyA || state.keys.ArrowLeft));
    const magnitude = Math.hypot(forward, strafe);
    if (magnitude > 0) {
      const speed = 7.2;
      const dx = (Math.sin(state.cameraYaw) * forward + Math.cos(state.cameraYaw) * strafe) / magnitude;
      const dz = (-Math.cos(state.cameraYaw) * forward + Math.sin(state.cameraYaw) * strafe) / magnitude;
      state.player.x += dx * speed * dt;
      state.player.z += dz * speed * dt;
      state.player.facing = Math.atan2(dx, dz);
    }

    state.player.vy -= 22 * dt;
    state.player.y += state.player.vy * dt;
    if (state.player.y <= 0) {
      state.player.y = 0;
      state.player.vy = 0;
      state.player.grounded = true;
    }

    state.player.x = THREE.MathUtils.clamp(state.player.x, -10, 10);
    state.player.z = THREE.MathUtils.clamp(state.player.z, -108, 18);
    playerMesh.position.set(state.player.x, state.player.y, state.player.z);
    playerMesh.rotation.y = state.player.facing;

    const lookHeight = 1.35 + state.cameraPitch * 3;
    const distance = 8.8;
    const target = new THREE.Vector3(state.player.x, state.player.y + 1.35, state.player.z);
    const desired = new THREE.Vector3(
      target.x - Math.sin(state.cameraYaw) * distance,
      target.y + 4.2 + lookHeight,
      target.z + Math.cos(state.cameraYaw) * distance
    );
    const cameraVector = desired.clone().sub(target);
    const desiredDistance = cameraVector.length();
    cameraRay.set(target, cameraVector.normalize());
    cameraRay.far = desiredDistance;
    const hit = cameraRay.intersectObjects(cameraBlockers, false)[0];
    const safeDistance = hit ? Math.max(2.5, hit.distance - 0.45) : desiredDistance;
    const safePosition = target.clone().add(cameraVector.multiplyScalar(safeDistance));
    camera.position.lerp(safePosition, 1 - Math.pow(0.0008, dt));
    camera.lookAt(target);
  }

  function render() {
    renderer.render(scene, camera);
  }

  let lastTime = performance.now();
  function frame(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    update(dt);
    render();
    requestAnimationFrame(frame);
  }

  function startGame() {
    state.mode = 'playing';
    state.objective = '沿山路熟悉移动方式';
    objectiveText.textContent = state.objective;
    startScreen.classList.add('is-hidden');
    hud.classList.add('is-visible');
    canvas.focus();
  }

  function jump() {
    if (state.mode === 'playing' && state.player.grounded) {
      state.player.vy = 9.3;
      state.player.grounded = false;
    }
  }

  startButton.addEventListener('click', startGame);
  window.addEventListener('keydown', (event) => {
    state.keys[event.code] = true;
    if (event.code === 'Space') {
      event.preventDefault();
      jump();
    }
    if (event.code === 'KeyF') {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.getElementById('game-shell').requestFullscreen?.();
    }
  });
  window.addEventListener('keyup', (event) => { state.keys[event.code] = false; });

  let dragging = false;
  let previousX = 0;
  let previousY = 0;
  canvas.addEventListener('pointerdown', (event) => {
    dragging = true;
    previousX = event.clientX;
    previousY = event.clientY;
    canvas.setPointerCapture?.(event.pointerId);
  });
  canvas.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    state.cameraYaw -= (event.clientX - previousX) * 0.006;
    state.cameraPitch = THREE.MathUtils.clamp(state.cameraPitch - (event.clientY - previousY) * 0.003, -0.55, 0.3);
    previousX = event.clientX;
    previousY = event.clientY;
  });
  canvas.addEventListener('pointerup', () => { dragging = false; });
  canvas.addEventListener('pointercancel', () => { dragging = false; });
  window.addEventListener('resize', resize);
  document.addEventListener('fullscreenchange', resize);

  window.render_game_to_text = function () {
    return JSON.stringify({
      coordinateSystem: 'origin at mountain gate; +x right/east, +y up, -z follows the road toward the village',
      mode: state.mode,
      objective: state.objective,
      player: {
        x: Number(state.player.x.toFixed(2)),
        y: Number(state.player.y.toFixed(2)),
        z: Number(state.player.z.toFixed(2)),
        verticalVelocity: Number(state.player.vy.toFixed(2)),
        grounded: state.player.grounded,
      },
      controls: 'WASD/arrows move, drag rotates camera, Space jumps, F fullscreen',
    });
  };

  window.advanceTime = function (ms) {
    const steps = Math.max(1, Math.round(ms / (1000 / 60)));
    for (let i = 0; i < steps; i += 1) update(1 / 60);
    render();
  };

  resize();
  camera.position.set(0, 6.5, 21);
  camera.lookAt(0, 1.35, 12);
  update(0);
  render();
  requestAnimationFrame(frame);
}());
