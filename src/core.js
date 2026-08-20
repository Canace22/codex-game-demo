(function () {
  'use strict';

  const GY = window.GY;
  const Stage = GY.Stage;
  const shell = document.getElementById('game-shell');
  const canvas = document.getElementById('game-canvas');
  const startScreen = document.getElementById('start-screen');
  const startButton = document.getElementById('start-btn');
  const title = startScreen.querySelector('h1');
  const chapter = startScreen.querySelector('.start-card__chapter');
  const intro = startScreen.querySelector('.start-card__intro');

  const state = {
    mode: 'menu',
    stage: Stage.TITLE,
    stageTime: 0,
    playTime: 0,
    paused: false,
    nearby: null,
    respawnTimer: 0,
    defeatCount: 0,
    checkpoint: 'START',
    checkpointPosition: null,
    roadCleared: false,
    villageBriefed: false,
    bridge: {
      usedDash: false,
      usedAirDash: false,
      usedDoubleJump: false,
      steppingLandings: 0,
      lastSurface: '',
      visited: [],
    },
    mobileMove: { x: 0, y: 0 },
    keys: Object.create(null),
    cameraYaw: 0,
    cameraPitch: -0.13,
  };

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x91aaa7, 0.0085);
  const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 430);
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.setClearColor(0x91aaa7, 0.18);

  scene.add(new THREE.HemisphereLight(0xdde8dd, 0x26332c, 1.25));
  const sun = new THREE.DirectionalLight(0xffe4b8, 2.05);
  sun.position.set(-34, 48, 35);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1536, 1536);
  sun.shadow.camera.left = -48;
  sun.shadow.camera.right = 48;
  sun.shadow.camera.top = 48;
  sun.shadow.camera.bottom = -48;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 130;
  scene.add(sun);

  const world = GY.createWorld(scene);
  const effects = GY.createEffects(scene);
  const audio = GY.createAudio();
  const startSpawn = world.getSpawn('START');
  const playerVisual = GY.createHumanoid(scene, {
    color: 0x344e5d,
    accent: 0xa9d7cf,
    weapon: 'sword',
    showHealth: false,
  });
  playerVisual.group.position.set(startSpawn.x, startSpawn.y, startSpawn.z);
  playerVisual.group.rotation.y = startSpawn.facing;
  const player = {
    id: 'player',
    name: '少侠',
    role: 'sword',
    kind: 'player',
    visual: playerVisual,
    hp: GY.Config.player.maxHp,
    maxHp: GY.Config.player.maxHp,
    qi: GY.Config.player.maxQi,
    maxQi: GY.Config.player.maxQi,
    alive: true,
    invulnerable: 0,
    hot: 0,
    hotTick: 0,
    actionPose: 0,
    moving: false,
    vy: 0,
    grounded: true,
    jumpsUsed: 0,
    dashRemaining: 0,
    dashDirection: { x: 0, z: -1 },
    waterGrace: 0,
    canWaterStep: true,
    currentSurface: 'gate_courtyard',
    cooldowns: { attack: 0, dodge: 0, skill1: 0, skill2: 0 },
  };
  state.checkpointPosition = Object.assign({}, startSpawn);

  let combat;
  const ui = GY.createUI(shell, {
    onAction(action, value) {
      if (action === 'move') {
        state.mobileMove.x = value && Number.isFinite(value.x) ? value.x : 0;
        state.mobileMove.y = value && Number.isFinite(value.y) ? value.y : 0;
        return;
      }
      if (value === false) return;
      performAction(action);
    },
    onLook(dx, dy) {
      state.cameraYaw -= dx * 0.006;
      state.cameraPitch = GY.clamp(state.cameraPitch - dy * 0.0032, -0.5, 0.28);
    },
  });

  combat = GY.createCombat(scene, effects, ui, player, {
    getSurface(x, z) { return world.getSurface(x, z, state.stage); },
    onRoadCleared() {
      state.roadCleared = true;
      ui.showToast('山路影徒已清除，断桥就在前方', 'success');
      audio.play('checkpoint');
    },
    onDefenseComplete() { setStage(Stage.BOSS_INTRO); },
    onDefenseFailed() {
      state.respawnTimer = 2;
      state.defeatCount += 1;
      ui.showToast('村民尽数倒下，重整阵形再守一次', 'danger');
    },
    onBossDefeated() {
      setStage(Stage.RETURN_TO_GATE);
      audio.play('victory');
    },
    onPlayerDown() {
      if (state.respawnTimer > 0) return;
      state.respawnTimer = 2;
      state.defeatCount += 1;
      player.visual.group.visible = false;
      ui.showToast('气息涣散，正在返回最近安全处', 'danger');
    },
  });

  const cameraRay = new THREE.Raycaster();
  const tempTarget = new THREE.Vector3();
  const tempDesired = new THREE.Vector3();
  const tempDirection = new THREE.Vector3();
  const PLAYER_COLLISION_RADIUS = 0.68;
  camera.position.set(startSpawn.x, startSpawn.y + 6, startSpawn.z + 9);
  camera.lookAt(startSpawn.x, startSpawn.y + 1.4, startSpawn.z);

  function resolvePlayerMove(nextX, nextZ) {
    const position = player.visual.group.position;
    const resolved = world.resolveMove(
      { x: position.x, z: position.z },
      { x: GY.clamp(nextX, -27, 27), z: GY.clamp(nextZ, -139, 87) },
      PLAYER_COLLISION_RADIUS
    );
    position.x = resolved.x;
    position.z = resolved.z;
    return resolved;
  }

  function setCheckpoint(name, sourcePosition) {
    const map = {
      gate: 'GATE',
      bridgeNorth: 'BRIDGE_NORTH',
      bridgeMid: 'BRIDGE_MID',
      bridgeSouth: 'BRIDGE_SOUTH',
      village: 'VILLAGE',
      temple: 'ARENA',
    };
    const spawnName = map[name] || name;
    const spawn = world.getSpawn(spawnName);
    if (!spawn && !sourcePosition) return;
    state.checkpoint = spawnName;
    state.checkpointPosition = spawn || { x: sourcePosition.x, y: sourcePosition.y, z: sourcePosition.z, facing: player.visual.group.rotation.y };
  }

  function setStage(nextStage) {
    state.stage = nextStage;
    state.stageTime = 0;
    state.nearby = null;
    world.setStage(nextStage);
    if (nextStage === Stage.GATE_OFFER) {
      combat.setMode('idle');
      setCheckpoint('GATE');
      ui.showToast('山门执事正在等你', 'neutral');
    } else if (nextStage === Stage.ROAD_TO_BRIDGE) {
      state.roadCleared = false;
      combat.setMode('road');
      ui.showToast('任务接取：驰援澄江村', 'success');
      audio.play('checkpoint');
    } else if (nextStage === Stage.BRIDGE_CROSSING) {
      combat.setMode('idle');
      setCheckpoint('BRIDGE_NORTH');
      ui.showToast('断桥已毁：疾冲、二段跳并踏石而行', 'focus');
    } else if (nextStage === Stage.VILLAGE_ARRIVAL) {
      combat.setMode('idle');
      state.villageBriefed = false;
      setCheckpoint('BRIDGE_SOUTH');
      ui.showToast('已抵达对岸，澄江村就在前方', 'success');
      audio.play('checkpoint');
    } else if (nextStage === Stage.TEMPLE_DEFENSE) {
      setCheckpoint('ARENA');
      combat.resetParty(state.checkpointPosition);
      combat.setMode('defense');
      ui.showToast('保护村民，三波影徒正在逼近', 'danger');
      audio.play('danger');
    } else if (nextStage === Stage.BOSS_INTRO) {
      combat.setMode('idle');
      ui.showToast('一股失控真气席卷古寺……', 'danger');
      audio.play('danger');
    } else if (nextStage === Stage.BOSS_FIGHT) {
      combat.resetParty(world.getSpawn('ARENA'));
      combat.setMode('boss');
      ui.showToast('沈烬尘：谁也休想阻我破境！', 'danger');
    } else if (nextStage === Stage.RETURN_TO_GATE) {
      combat.setMode('idle');
      setCheckpoint('BRIDGE_SOUTH');
      ui.showToast('首领已败，归云石径已显现', 'success');
    } else if (nextStage === Stage.COMPLETE) {
      combat.setMode('idle');
      state.mode = 'complete';
      showCompletion();
    }
  }

  function getObjective() {
    const copy = GY.QuestCopy[state.stage] || GY.QuestCopy[Stage.TITLE];
    let objective = copy.action;
    let stageLabel = copy.progress;
    let current;
    let total;
    if (state.stage === Stage.ROAD_TO_BRIDGE) {
      const remaining = combat.actors.enemies.length;
      current = GY.clamp(2 - remaining, 0, 2);
      total = 2;
      stageLabel = `影徒 ${current}/2`;
      if (state.roadCleared) objective = '继续沿山路前往断桥';
    } else if (state.stage === Stage.BRIDGE_CROSSING) {
      current = state.bridge.steppingLandings;
      total = 6;
      stageLabel = `${state.bridge.usedDash ? '疾冲✓' : '疾冲'} · ${state.bridge.usedDoubleJump ? '二段跳✓' : '二段跳'}`;
    } else if (state.stage === Stage.VILLAGE_ARRIVAL && state.villageBriefed) {
      objective = '赶往照水寺保护被困村民';
      stageLabel = '寺院方向';
    } else if (state.stage === Stage.TEMPLE_DEFENSE) {
      current = combat.state.wave;
      total = combat.state.wavesTotal;
      const alive = combat.actors.villagers.filter((actor) => actor.alive).length;
      stageLabel = `第 ${Math.max(1, current)}/3 波 · 村民 ${alive}/3`;
    } else if (state.stage === Stage.BOSS_FIGHT) {
      const boss = combat.actors.boss;
      current = boss.maxHp - boss.hp;
      total = boss.maxHp;
      stageLabel = combat.state.bossAttack ? combat.state.bossAttack.name : '观察招式并配合队友';
    }
    return { copy, objective, stageLabel, current, total };
  }

  function updateNearby() {
    state.nearby = null;
    const position = player.visual.group.position;
    if (state.stage === Stage.GATE_OFFER) {
      const npc = world.getSpawn('GATE_MASTER');
      if (GY.distance2D(position, npc) < 4.2) state.nearby = { id: 'gate-master', text: '听取澄江村求援', key: 'F', visible: true, urgent: true };
    } else if (state.stage === Stage.VILLAGE_ARRIVAL && !state.villageBriefed) {
      const elder = world.getSpawn('VILLAGE');
      if (GY.distance2D(position, elder) < 5) state.nearby = { id: 'village-elder', text: '询问照水寺险情', key: 'F', visible: true, urgent: true };
    } else if (state.stage === Stage.RETURN_TO_GATE) {
      const npc = world.getSpawn('GATE_MASTER');
      if (GY.distance2D(position, npc) < 4.8) state.nearby = { id: 'return-gate', text: '向山门执事交付任务', key: 'F', visible: true, urgent: true };
    }
  }

  function interact() {
    if (!state.nearby) return false;
    if (state.nearby.id === 'gate-master') setStage(Stage.ROAD_TO_BRIDGE);
    else if (state.nearby.id === 'village-elder') {
      state.villageBriefed = true;
      ui.showToast('村民：影徒都涌向了照水寺！', 'danger');
      audio.play('danger');
    } else if (state.nearby.id === 'return-gate') setStage(Stage.COMPLETE);
    return true;
  }

  function movementInput() {
    const keyboardForward = Number(Boolean(state.keys.KeyW || state.keys.ArrowUp)) - Number(Boolean(state.keys.KeyS || state.keys.ArrowDown));
    const keyboardStrafe = Number(Boolean(state.keys.KeyD || state.keys.ArrowRight)) - Number(Boolean(state.keys.KeyA || state.keys.ArrowLeft));
    let forward = keyboardForward + state.mobileMove.y;
    let strafe = keyboardStrafe + state.mobileMove.x;
    const magnitude = Math.hypot(forward, strafe);
    if (magnitude > 1) {
      forward /= magnitude;
      strafe /= magnitude;
    }
    return { forward, strafe, magnitude: Math.min(1, magnitude) };
  }

  function startJump() {
    if (state.mode !== 'playing' || state.paused || state.respawnTimer > 0) return false;
    if (player.grounded) {
      player.vy = GY.Config.player.jumpSpeed;
      player.grounded = false;
      player.jumpsUsed = 1;
      return true;
    }
    if (player.jumpsUsed < 2) {
      player.vy = GY.Config.player.jumpSpeed * 0.92;
      player.jumpsUsed = 2;
      if (state.stage === Stage.BRIDGE_CROSSING) state.bridge.usedDoubleJump = true;
      effects.ring(player.visual.group.position, 0x92e8db, 0.9, 0.32, false);
      return true;
    }
    return false;
  }

  function startDash() {
    if (state.mode !== 'playing' || state.paused || player.qi < GY.Config.player.dashCost || player.dashRemaining > 0) return false;
    const input = movementInput();
    let dx = Math.sin(state.cameraYaw) * input.forward + Math.cos(state.cameraYaw) * input.strafe;
    let dz = -Math.cos(state.cameraYaw) * input.forward + Math.sin(state.cameraYaw) * input.strafe;
    if (Math.hypot(dx, dz) < 0.1) {
      dx = Math.sin(player.visual.group.rotation.y);
      dz = Math.cos(player.visual.group.rotation.y);
    }
    const length = Math.hypot(dx, dz) || 1;
    player.dashDirection.x = dx / length;
    player.dashDirection.z = dz / length;
    player.dashRemaining = 0.32;
    player.qi -= GY.Config.player.dashCost;
    if (state.stage === Stage.BRIDGE_CROSSING) {
      state.bridge.usedDash = true;
      if (!player.grounded) state.bridge.usedAirDash = true;
    }
    effects.ring(player.visual.group.position, 0x7ed8cf, 1.1, 0.3, false);
    return true;
  }

  function performAction(action) {
    if (state.mode !== 'playing' || state.paused || state.respawnTimer > 0) return false;
    if (action === 'jump') return startJump();
    if (action === 'dash') return startDash();
    if (action === 'command') return Boolean(combat.toggleCommand());
    if (action === 'focus') {
      if (combat.state.command !== 'focus') combat.toggleCommand();
      return true;
    }
    if (action === 'regroup') {
      if (combat.state.command !== 'follow') combat.toggleCommand();
      return true;
    }
    if (action === 'interact') return interact();
    const used = combat.action(action);
    if (used) audio.play(action === 'attack' || action === 'dodge' ? 'attack' : 'skill');
    if (action === 'dodge' && used) {
      const input = movementInput();
      const angle = input.magnitude > 0.1
        ? Math.atan2(
          Math.sin(state.cameraYaw) * input.forward + Math.cos(state.cameraYaw) * input.strafe,
          -Math.cos(state.cameraYaw) * input.forward + Math.sin(state.cameraYaw) * input.strafe
        )
        : player.visual.group.rotation.y;
      const position = player.visual.group.position;
      resolvePlayerMove(
        position.x + Math.sin(angle) * 3.8,
        position.z + Math.cos(angle) * 3.8
      );
    }
    return used;
  }

  function respawnFromFall() {
    const checkpoint = state.checkpointPosition || startSpawn;
    player.visual.group.position.set(checkpoint.x, checkpoint.y, checkpoint.z);
    player.visual.group.rotation.y = checkpoint.facing || Math.PI;
    player.vy = 0;
    player.grounded = true;
    player.jumpsUsed = 0;
    player.dashRemaining = 0;
    player.waterGrace = 0;
    player.canWaterStep = true;
    player.invulnerable = 1;
    ui.showToast('落水，已回到最近安全落脚点', 'neutral');
  }

  function resetEncounter() {
    const checkpoint = state.checkpointPosition || startSpawn;
    combat.resetParty(checkpoint);
    player.qi = player.maxQi;
    player.vy = 0;
    player.visual.group.visible = true;
    if (state.stage === Stage.TEMPLE_DEFENSE) combat.setMode('defense');
    else if (state.stage === Stage.BOSS_FIGHT) combat.setMode('boss');
    else if (state.stage === Stage.ROAD_TO_BRIDGE) combat.setMode('road');
    state.respawnTimer = 0;
  }

  function updatePlayer(dt) {
    const group = player.visual.group;
    if (state.respawnTimer > 0) {
      state.respawnTimer -= dt;
      if (state.respawnTimer <= 0) resetEncounter();
      return;
    }
    if (!player.alive) return;
    const input = movementInput();
    let dx = Math.sin(state.cameraYaw) * input.forward + Math.cos(state.cameraYaw) * input.strafe;
    let dz = -Math.cos(state.cameraYaw) * input.forward + Math.sin(state.cameraYaw) * input.strafe;
    const length = Math.hypot(dx, dz);
    if (length > 0.001) {
      dx /= length;
      dz /= length;
    }
    let speed = GY.Config.player.moveSpeed * input.magnitude;
    if (player.dashRemaining > 0) {
      player.dashRemaining -= dt;
      dx = player.dashDirection.x;
      dz = player.dashDirection.z;
      speed = GY.Config.player.sprintSpeed;
    }
    player.moving = speed > 0.1;
    if (player.moving) {
      resolvePlayerMove(
        group.position.x + dx * speed * dt,
        group.position.z + dz * speed * dt
      );
      group.rotation.y = Math.atan2(dx, dz);
    }
    group.position.x = GY.clamp(group.position.x, -27, 27);
    group.position.z = GY.clamp(group.position.z, -139, 87);
    player.qi = Math.min(player.maxQi, player.qi + GY.Config.player.qiRegen * dt);
    const previousSurface = player.currentSurface;
    const surface = world.getSurface(group.position.x, group.position.z, state.stage);
    player.currentSurface = surface ? surface.type : 'air';
    player.vy -= GY.Config.player.gravity * dt;
    group.position.y += player.vy * dt;
    if (surface && player.vy <= 0 && group.position.y <= surface.y + 0.18) {
      group.position.y = surface.y;
      player.vy = 0;
      player.grounded = true;
      player.jumpsUsed = 0;
      player.waterGrace = 0;
      player.canWaterStep = true;
      const canAdvanceCheckpoint = state.stage === Stage.BRIDGE_CROSSING
        || state.stage === Stage.VILLAGE_ARRIVAL
        || state.stage === Stage.TEMPLE_DEFENSE
        || state.stage === Stage.BOSS_INTRO
        || state.stage === Stage.BOSS_FIGHT
        || state.stage === Stage.RETURN_TO_GATE
        || (state.stage === Stage.ROAD_TO_BRIDGE && state.roadCleared);
      if (surface.checkpoint && canAdvanceCheckpoint) setCheckpoint(surface.checkpoint, group.position);
      if (state.stage === Stage.BRIDGE_CROSSING && surface.type === 'stepping_stone') {
        const landingId = surface.id || `${group.position.x.toFixed(1)}:${group.position.z.toFixed(1)}`;
        state.bridge.lastSurface = landingId;
        if (!state.bridge.visited.includes(landingId)) {
          state.bridge.visited.push(landingId);
          state.bridge.steppingLandings = state.bridge.visited.length;
        }
      } else if (previousSurface === 'stepping_stone') {
        state.bridge.lastSurface = '';
      }
    } else {
      player.grounded = false;
      const overRiver = world.getZone('RIVER').contains(group.position.x, group.position.z);
      if (!surface && overRiver && player.canWaterStep && group.position.y <= -0.82 && group.position.y > -1.65 && player.vy < 0) {
        group.position.y = -0.82;
        player.vy = 0;
        player.waterGrace = 0.35;
        player.canWaterStep = false;
        player.jumpsUsed = Math.min(player.jumpsUsed, 1);
        effects.ring(group.position, 0xa8e9e4, 1.1, 0.45, false);
      }
    }
    if (player.waterGrace > 0) {
      player.waterGrace -= dt;
      if (player.waterGrace <= 0) player.vy = -2;
    }
    if (group.position.y < -4) respawnFromFall();
  }

  function updateQuestTriggers() {
    const position = player.visual.group.position;
    if (state.stage === Stage.ROAD_TO_BRIDGE && state.roadCleared && position.z <= 12.5) setStage(Stage.BRIDGE_CROSSING);
    else if (state.stage === Stage.BRIDGE_CROSSING && position.z < -31.2) setStage(Stage.VILLAGE_ARRIVAL);
    else if (state.stage === Stage.VILLAGE_ARRIVAL && state.villageBriefed && position.z < -96) setStage(Stage.TEMPLE_DEFENSE);
    else if (state.stage === Stage.BOSS_INTRO && state.stageTime >= 3.6) setStage(Stage.BOSS_FIGHT);
  }

  function updateCamera(dt) {
    const position = player.visual.group.position;
    tempTarget.set(position.x, position.y + 1.35, position.z);
    const distance = 8.6;
    const height = 4.1 + state.cameraPitch * 4.2;
    tempDesired.set(
      tempTarget.x - Math.sin(state.cameraYaw) * distance,
      tempTarget.y + height,
      tempTarget.z + Math.cos(state.cameraYaw) * distance
    );
    tempDirection.copy(tempDesired).sub(tempTarget);
    const desiredDistance = tempDirection.length();
    tempDirection.normalize();
    cameraRay.set(tempTarget, tempDirection);
    cameraRay.far = desiredDistance;
    const hit = cameraRay.intersectObjects(world.cameraBlockers, true)[0];
    const safeDistance = hit ? Math.max(0.2, hit.distance - 0.45) : desiredDistance;
    tempDesired.copy(tempTarget).add(tempDirection.multiplyScalar(safeDistance));
    const alpha = 1 - Math.pow(0.0012, Math.max(dt, 1 / 120));
    if (hit && camera.position.distanceTo(tempTarget) > safeDistance + 0.12) camera.position.copy(tempDesired);
    else camera.position.lerp(tempDesired, alpha);
    camera.lookAt(tempTarget);
  }

  function bossUiSnapshot(bossState) {
    if (!bossState) return null;
    const telegraph = bossState.attack ? {
      label: bossState.attack,
      active: true,
      progress: 1 - GY.clamp(bossState.telegraphMs / 2500, 0, 1),
      tone: 'danger',
    } : null;
    return {
      visible: true,
      active: true,
      name: '沈烬尘',
      rank: '走火入魔的武林高手',
      hp: bossState.hp,
      maxHp: bossState.maxHp,
      break: bossState.breakGauge,
      maxBreak: bossState.breakRequired,
      broken: bossState.stunned,
      telegraph,
    };
  }

  function snapshotForUi() {
    const objective = getObjective();
    const combatState = combat.getSnapshot();
    return {
      objective: objective.objective,
      quest: {
        label: objective.copy.title,
        stageLabel: objective.stageLabel,
        current: objective.current,
        total: objective.total,
        complete: state.stage === Stage.COMPLETE,
      },
      player: { hp: player.hp, maxHp: player.maxHp, qi: player.qi, maxQi: player.maxQi },
      companions: combatState.companions.map((actor) => Object.assign({}, actor, { down: actor.state === 'down', status: actor.state === 'down' ? '倒地' : (actor.state === 'engaged' ? '交战' : '跟随') })),
      partyOrder: combatState.command === 'focus' ? 'focus' : 'regroup',
      boss: bossUiSnapshot(combatState.boss),
      interaction: state.nearby,
      abilities: {
        attack: { label: '普通攻击', remaining: player.cooldowns.attack, duration: GY.Config.player.attackCooldown, enabled: player.alive },
        dodge: { label: '闪避', remaining: player.cooldowns.dodge, duration: GY.Config.player.dodgeCooldown, enabled: player.alive },
        skill1: { label: '回风式', remaining: player.cooldowns.skill1, duration: GY.Config.player.skill1Cooldown, enabled: player.alive },
        skill2: { label: '穿云刺', remaining: player.cooldowns.skill2, duration: GY.Config.player.skill2Cooldown, enabled: player.alive },
        jump: { label: player.grounded ? '跳跃' : '二段跳', remaining: 0, duration: 1, enabled: player.jumpsUsed < 2 },
        dash: { label: '轻功疾冲', remaining: 0, duration: 1, enabled: player.qi >= GY.Config.player.dashCost },
      },
      inCombat: combat.state.mode !== 'idle',
      uiVisible: state.mode === 'playing' || window.innerHeight > window.innerWidth,
      cinematic: state.stage === Stage.BOSS_INTRO,
    };
  }

  function update(dt) {
    if (state.mode !== 'playing' || state.paused) {
      world.update(0, state.playTime);
      updateCamera(dt);
      ui.update(snapshotForUi());
      return;
    }
    state.playTime += dt;
    state.stageTime += dt;
    updatePlayer(dt);
    combat.update(dt, state.playTime);
    updateNearby();
    updateQuestTriggers();
    world.update(dt, state.playTime);
    updateCamera(dt);
    ui.update(snapshotForUi());
  }

  function render() { renderer.render(scene, camera); }

  function resize() {
    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / Math.max(1, height);
    camera.updateProjectionMatrix();
  }

  function startGame() {
    audio.unlock();
    if (state.mode === 'complete') {
      location.reload();
      return;
    }
    state.mode = 'playing';
    state.paused = false;
    startScreen.classList.add('is-hidden');
    canvas.focus();
    setStage(Stage.GATE_OFFER);
  }

  function showCompletion() {
    const minutes = Math.floor(state.playTime / 60);
    const seconds = Math.floor(state.playTime % 60).toString().padStart(2, '0');
    title.textContent = '江岸复宁';
    chapter.textContent = '任务完成';
    intro.textContent = `用时 ${minutes}:${seconds} · 倒地 ${state.defeatCount} 次 · 五人平安归山`;
    startButton.textContent = '再历此程';
    startScreen.classList.remove('is-hidden');
  }

  startButton.addEventListener('click', startGame);
  window.addEventListener('keydown', (event) => {
    state.keys[event.code] = true;
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) event.preventDefault();
    if (event.repeat) return;
    if (event.code === 'Space') performAction('jump');
    else if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') performAction('dash');
    else if (event.code === 'KeyJ' || event.code === 'KeyB') performAction('attack');
    else if (event.code === 'KeyK') performAction('dodge');
    else if (event.code === 'KeyQ') performAction('skill1');
    else if (event.code === 'KeyE') performAction('skill2');
    else if (event.code === 'KeyR') performAction('command');
    else if (event.code === 'KeyF' || event.code === 'Enter') performAction('interact');
    else if (event.code === 'KeyG') {
      if (document.fullscreenElement) document.exitFullscreen();
      else shell.requestFullscreen?.();
    } else if (event.code === 'Escape' && state.mode === 'playing') {
      state.paused = !state.paused;
      ui.showToast(state.paused ? '已暂停 · 按 Esc 继续' : '继续前行', 'neutral');
    }
  });
  window.addEventListener('keyup', (event) => { state.keys[event.code] = false; });
  window.addEventListener('blur', () => {
    Object.keys(state.keys).forEach((key) => { state.keys[key] = false; });
    state.mobileMove.x = 0;
    state.mobileMove.y = 0;
    looking = false;
    lookPointer = null;
    lookButton = -1;
    canvas.classList.remove('is-looking');
  });

  let looking = false;
  let lookPointer = null;
  let lookButton = -1;
  let lookStartX = 0;
  let lookStartY = 0;
  let previousX = 0;
  let previousY = 0;
  const LOOK_DRAG_THRESHOLD = 4;
  canvas.addEventListener('pointerdown', (event) => {
    if (lookPointer !== null) return;
    if (event.pointerType === 'mouse' && ![0, 1, 2].includes(event.button)) return;
    event.preventDefault();
    lookPointer = event.pointerId;
    lookButton = event.pointerType === 'mouse' ? event.button : -1;
    lookStartX = event.clientX;
    lookStartY = event.clientY;
    previousX = event.clientX;
    previousY = event.clientY;
    looking = event.pointerType !== 'mouse' || event.button === 1;
    if (looking) canvas.classList.add('is-looking');
    canvas.setPointerCapture?.(event.pointerId);
  });
  canvas.addEventListener('pointermove', (event) => {
    if (event.pointerId !== lookPointer) return;
    if (!looking && (lookButton === 0 || lookButton === 2)) {
      looking = Math.hypot(event.clientX - lookStartX, event.clientY - lookStartY) >= LOOK_DRAG_THRESHOLD;
      if (looking) canvas.classList.add('is-looking');
    }
    if (!looking) return;
    state.cameraYaw -= (event.clientX - previousX) * 0.006;
    state.cameraPitch = GY.clamp(state.cameraPitch - (event.clientY - previousY) * 0.0032, -0.5, 0.28);
    previousX = event.clientX;
    previousY = event.clientY;
  });
  function stopLook(event) {
    if (event.pointerId !== lookPointer) return;
    const clickAction = event.type === 'pointerup' && !looking
      ? (lookButton === 0 ? 'attack' : (lookButton === 2 ? 'dodge' : ''))
      : '';
    looking = false;
    lookPointer = null;
    lookButton = -1;
    canvas.classList.remove('is-looking');
    if (clickAction) performAction(clickAction);
  }
  canvas.addEventListener('pointerup', stopLook);
  canvas.addEventListener('pointercancel', stopLook);
  canvas.addEventListener('lostpointercapture', stopLook);
  canvas.addEventListener('auxclick', (event) => {
    if (event.button === 1) event.preventDefault();
  });
  canvas.addEventListener('contextmenu', (event) => event.preventDefault());
  window.addEventListener('resize', resize);
  document.addEventListener('fullscreenchange', resize);

  function statePayload() {
    const objective = getObjective();
    const combatState = combat.getSnapshot();
    const position = player.visual.group.position;
    return {
      coordinateSystem: 'world origin near bridge; +x east/right, +y up, decreasing z travels from mountain gate to temple',
      mode: state.mode,
      paused: state.paused,
      questStage: state.stage,
      objective: objective.objective,
      objectiveProgress: objective.stageLabel,
      checkpoint: state.checkpoint,
      player: {
        x: Number(position.x.toFixed(2)),
        y: Number(position.y.toFixed(2)),
        z: Number(position.z.toFixed(2)),
        hp: Math.round(player.hp),
        maxHp: player.maxHp,
        qi: Math.round(player.qi),
        grounded: player.grounded,
        jumpsUsed: player.jumpsUsed,
        cooldowns: Object.fromEntries(Object.entries(player.cooldowns).map(([key, value]) => [key, Number(value.toFixed(2))])),
      },
      bridge: Object.assign({}, state.bridge),
      companions: combatState.companions,
      partyOrder: combatState.command,
      villagers: combatState.villagers,
      enemies: combatState.enemies,
      boss: combatState.boss,
      healingDone: combatState.healingDone,
      damageStats: combatState.damageStats,
      nearbyInteractables: state.nearby ? [state.nearby.id] : [],
      viewport: { width: window.innerWidth, height: window.innerHeight, orientation: window.innerWidth >= window.innerHeight ? 'landscape' : 'portrait' },
      camera: { yaw: Number(state.cameraYaw.toFixed(3)), pitch: Number(state.cameraPitch.toFixed(3)) },
      controls: 'WASD/arrows move; mouse drag look; Space double jump; Shift dash; J/left-click attack; K/right-click dodge; Q/E skills; R party command; F interact; G fullscreen; Esc pause',
    };
  }

  let deterministicMode = false;
  window.render_game_to_text = function () { return JSON.stringify(statePayload()); };
  window.advanceTime = function (ms) {
    deterministicMode = true;
    const steps = Math.max(1, Math.min(7200, Math.round(ms / (1000 / 60))));
    for (let i = 0; i < steps; i += 1) update(1 / 60);
    render();
  };

  if (new URLSearchParams(location.search).has('debug')) {
    window.__GY_TEST__ = {
      start: startGame,
      action: performAction,
      setStage,
      teleport(target) {
        const point = typeof target === 'string' ? world.getSpawn(target) : target;
        if (!point) return false;
        player.visual.group.position.set(point.x, point.y || 0, point.z);
        player.vy = 0;
        player.grounded = true;
        updateNearby();
        updateCamera(1 / 30);
        render();
        return true;
      },
      clearEnemies() {
        combat.actors.enemies.forEach((enemy) => { enemy.hp = 0; enemy.alive = false; enemy.visual.group.visible = false; });
      },
      healParty() {
        combat.heal(player, player.maxHp);
        combat.actors.companions.forEach((actor) => combat.heal(actor, actor.maxHp));
      },
      setInvulnerable(seconds) {
        player.invulnerable = Math.max(player.invulnerable, seconds || 30);
        combat.actors.companions.forEach((actor) => { actor.invulnerable = Math.max(actor.invulnerable, seconds || 30); });
      },
      damageBoss(amount) { combat.damage(combat.actors.boss, amount || combat.actors.boss.maxHp, 'player'); },
      damagePlayer(amount) { combat.damage(player, amount || player.maxHp); },
      advance(ms) {
        const steps = Math.max(1, Math.min(18000, Math.round(ms / (1000 / 60))));
        for (let i = 0; i < steps; i += 1) update(1 / 60);
      },
      state: statePayload,
    };
  }

  resize();
  ui.update(snapshotForUi());
  render();
  let lastTime = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, Math.max(0, (now - lastTime) / 1000));
    lastTime = now;
    if (!deterministicMode) {
      update(dt);
      render();
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}());
