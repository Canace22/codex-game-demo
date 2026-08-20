(function () {
  'use strict';

  const GY = window.GY = window.GY || {};

  GY.createCombat = function (scene, effects, ui, player, callbacks) {
    const cb = Object.assign({
      onRoadCleared() {},
      onDefenseComplete() {},
      onDefenseFailed() {},
      onBossDefeated() {},
      onPlayerDown() {},
      getSurface() { return null; },
    }, callbacks || {});
    const random = GY.seededRandom(20260820);
    const actors = {
      player,
      companions: [],
      villagers: [],
      enemies: [],
      boss: null,
    };
    const combat = {
      mode: 'idle',
      command: 'follow',
      wave: 0,
      wavesTotal: 3,
      defeated: 0,
      roadTotal: 2,
      bossAttack: null,
      breakGauge: 0,
      breakRequired: 260,
      seenAttacks: [],
      breakSuccesses: 0,
      focusTarget: null,
      time: 0,
      damageStats: { player: 0, spear: 0, archer: 0, healer: 0, scout: 0 },
      healingDone: 0,
    };

    const formation = {
      spear: { x: -2.3, z: -1.5 },
      archer: { x: 3.1, z: 3.1 },
      healer: { x: -3.1, z: 3.4 },
      scout: { x: 2.25, z: -1.7 },
    };

    function makeActor(options) {
      const visual = GY.createHumanoid(scene, options.visual);
      const x = options.x ?? 0;
      const z = options.z ?? 0;
      const surface = cb.getSurface(x, z);
      const y = options.y ?? (surface ? surface.y : 0);
      visual.group.position.set(x, y, z);
      visual.group.visible = options.visible !== false;
      return {
        id: options.id,
        name: options.name || options.id,
        role: options.role || options.id,
        kind: options.kind || 'ally',
        visual,
        hp: options.hp,
        maxHp: options.hp,
        alive: true,
        downTimer: 0,
        attackTimer: random() * 0.6,
        specialTimer: options.specialTimer || 0,
        invulnerable: 0,
        hot: 0,
        hotTick: 0,
        actionPose: 0,
        target: null,
        threat: 0,
        speed: options.speed || 4.2,
        damage: options.damage || 10,
        attackRate: options.attackRate || 1.2,
        range: options.range || 2.6,
      };
    }

    Object.keys(GY.RoleCopy).forEach((role) => {
      const copy = GY.RoleCopy[role];
      const stats = {
        spear: { hp: 620, damage: 14, attackRate: 1.1, range: 3, weapon: 'spear' },
        archer: { hp: 440, damage: 15, attackRate: 1, range: 13, weapon: 'bow' },
        healer: { hp: 420, damage: 6, attackRate: 1.3, range: 10, weapon: 'fan' },
        scout: { hp: 480, damage: 20, attackRate: 1, range: 3.2, weapon: 'daggers' },
      }[role];
      const actor = makeActor({
        id: role,
        name: copy.name,
        role,
        kind: 'companion',
        x: formation[role].x,
        z: 70 + formation[role].z,
        hp: stats.hp,
        damage: stats.damage,
        attackRate: stats.attackRate,
        range: stats.range,
        visual: { color: copy.color, accent: copy.accent, weapon: stats.weapon, showHealth: false },
      });
      if (role === 'healer') actor.healTimer = 2.5;
      if (role === 'scout') actor.burstTimer = 4;
      actors.companions.push(actor);
    });

    const villagerPositions = [
      { x: -5, z: -106 },
      { x: 0, z: -108 },
      { x: 5, z: -106 },
    ];
    villagerPositions.forEach((position, index) => {
      const actor = makeActor({
        id: `villager-${index + 1}`,
        name: `村民${index + 1}`,
        role: 'villager',
        kind: 'villager',
        x: position.x,
        z: position.z,
        hp: 150,
        visible: false,
        visual: { color: 0x7a7063 + index * 0x080604, accent: 0xc5b68f, weapon: 'fan', scale: 0.88, showHealth: true },
      });
      actors.villagers.push(actor);
    });

    const boss = makeActor({
      id: 'boss',
      name: '沈烬尘',
      role: 'boss',
      kind: 'boss',
      x: 0,
      z: -121,
      hp: GY.Config.boss.maxHp,
      damage: 42,
      attackRate: 1.6,
      range: 3.1,
      speed: 3.1,
      visible: false,
      visual: { color: 0x2c2028, accent: GY.Config.colors.danger, weapon: 'claws', scale: 1.32, hostile: true, showHealth: false },
    });
    boss.specialTimer = 4.5;
    boss.specialIndex = 0;
    boss.stunTimer = 0;
    actors.boss = boss;

    function position(actor) {
      return actor.visual.group.position;
    }

    function snapActorToSurface(actor) {
      if (!actor || actor.kind === 'player') return;
      const at = position(actor);
      const surface = cb.getSurface(at.x, at.z);
      if (surface) at.y = surface.y;
    }

    function collisionRadius(actor) {
      if (actor.kind === 'boss') return 1.05;
      if (actor.kind === 'villager') return 0.55;
      if (actor.kind === 'enemy') return 0.64;
      return 0.7;
    }

    function separationWeight(actor) {
      if (actor.kind === 'player') return 0;
      if (actor.kind === 'boss') return 0.35;
      if (actor.kind === 'villager') return 0.55;
      return 1;
    }

    function separateActors() {
      const active = [player].concat(actors.companions, actors.villagers, actors.enemies, [boss])
        .filter((actor) => actor && actor.alive && actor.visual.group.visible);
      for (let pass = 0; pass < 3; pass += 1) {
        for (let aIndex = 0; aIndex < active.length; aIndex += 1) {
          for (let bIndex = aIndex + 1; bIndex < active.length; bIndex += 1) {
            const a = active[aIndex];
            const b = active[bIndex];
            const aPosition = position(a);
            const bPosition = position(b);
            let dx = bPosition.x - aPosition.x;
            let dz = bPosition.z - aPosition.z;
            let distance = Math.hypot(dx, dz);
            const minimum = collisionRadius(a) + collisionRadius(b) + 0.12;
            if (distance >= minimum) continue;
            if (distance < 0.001) {
              const angle = ((aIndex + 1) * 2.17 + (bIndex + 1) * 1.31) % (Math.PI * 2);
              dx = Math.cos(angle);
              dz = Math.sin(angle);
              distance = 1;
            }
            const aWeight = separationWeight(a);
            const bWeight = separationWeight(b);
            const totalWeight = aWeight + bWeight;
            if (totalWeight <= 0) continue;
            const overlap = minimum - distance;
            const nx = dx / distance;
            const nz = dz / distance;
            aPosition.x -= nx * overlap * aWeight / totalWeight;
            aPosition.z -= nz * overlap * aWeight / totalWeight;
            bPosition.x += nx * overlap * bWeight / totalWeight;
            bPosition.z += nz * overlap * bWeight / totalWeight;
          }
        }
      }
      active.forEach(snapActorToSurface);
    }

    function resetActor(actor, at) {
      actor.hp = actor.maxHp;
      actor.alive = true;
      actor.downTimer = 0;
      actor.invulnerable = 0;
      actor.hot = 0;
      actor.actionPose = 0;
      actor.visual.group.visible = true;
      actor.visual.rig.visible = true;
      actor.visual.setHealth(1);
      if (at) {
        const surface = cb.getSurface(at.x, at.z);
        actor.visual.group.position.set(at.x, at.y ?? (surface ? surface.y : 0), at.z);
      }
    }

    function removeEnemy(enemy) {
      enemy.visual.remove();
      const index = actors.enemies.indexOf(enemy);
      if (index >= 0) actors.enemies.splice(index, 1);
    }

    function clearEnemies() {
      actors.enemies.slice().forEach(removeEnemy);
    }

    function spawnEnemy(id, x, z, hp, damage) {
      const enemy = makeActor({
        id,
        name: '蚀心影徒',
        role: 'enemy',
        kind: 'enemy',
        x,
        z,
        hp: hp || 140,
        damage: damage || 16,
        attackRate: 1.2,
        range: 2.5,
        speed: 3.4,
        visual: { color: 0x292d36, accent: 0x8e3f50, weapon: 'sword', hostile: true, showHealth: true, scale: 0.94 },
      });
      actors.enemies.push(enemy);
      return enemy;
    }

    function nearest(list, from, filter) {
      let target = null;
      let best = Infinity;
      list.forEach((candidate) => {
        if (!candidate.alive || candidate.visual.group.visible === false || (filter && !filter(candidate))) return;
        const distance = GY.distance2D(position(candidate), from);
        if (distance < best) {
          best = distance;
          target = candidate;
        }
      });
      return { target, distance: best };
    }

    function heal(actor, amount) {
      if (!actor.alive) return 0;
      const before = actor.hp;
      actor.hp = Math.min(actor.maxHp, actor.hp + amount);
      actor.visual.setHealth(actor.hp / actor.maxHp);
      return actor.hp - before;
    }

    function down(actor) {
      if (actor.kind === 'player') {
        actor.hp = 0;
        actor.alive = false;
        actor.visual.setHealth(0);
        cb.onPlayerDown();
        return;
      }
      if (actor.kind === 'villager' || actor.kind === 'enemy' || actor.kind === 'boss') {
        actor.hp = 0;
        actor.alive = false;
        actor.visual.setHealth(0);
        actor.visual.group.visible = false;
        return;
      }
      actor.hp = 0;
      actor.alive = false;
      actor.downTimer = 10;
      actor.visual.setHealth(0);
      actor.visual.animate('down', combat.time, 1);
    }

    function damage(actor, amount, source) {
      if (!actor || !actor.alive || actor.invulnerable > 0) return 0;
      const applied = Math.min(actor.hp, amount);
      actor.hp -= applied;
      actor.visual.setHealth(actor.hp / actor.maxHp);
      actor.actionPose = Math.max(actor.actionPose, 0.16);
      if (actor.hp <= 0) down(actor);
      if (source && combat.damageStats[source] != null) combat.damageStats[source] += applied;
      return applied;
    }

    function moveToward(actor, target, dt, stopDistance, speedMultiplier) {
      const from = position(actor);
      const dx = target.x - from.x;
      const dz = target.z - from.z;
      const distance = Math.hypot(dx, dz);
      if (distance <= stopDistance || distance < 0.001) return false;
      const step = Math.min(distance - stopDistance, actor.speed * (speedMultiplier || 1) * dt);
      from.x += dx / distance * step;
      from.z += dz / distance * step;
      snapActorToSurface(actor);
      actor.visual.face(target);
      return true;
    }

    function hostiles() {
      if (combat.mode === 'boss' && boss.alive && boss.visual.group.visible) return [boss];
      return actors.enemies;
    }

    function playerTarget(maxRange) {
      return nearest(hostiles(), position(player), (target) => GY.distance2D(position(target), position(player)) <= maxRange).target;
    }

    function usePlayerAction(action) {
      if (!player.alive) return false;
      const cooldowns = player.cooldowns;
      if (action === 'attack') {
        if (cooldowns.attack > 0) return false;
        cooldowns.attack = GY.Config.player.attackCooldown;
        player.actionPose = 0.28;
        effects.slash(position(player), player.visual.group.rotation.y, GY.Config.colors.friendly);
        const target = playerTarget(3.5);
        if (target) damage(target, 28, 'player');
        return true;
      }
      if (action === 'skill1') {
        if (cooldowns.skill1 > 0) return false;
        cooldowns.skill1 = GY.Config.player.skill1Cooldown;
        player.actionPose = 0.45;
        effects.ring(position(player), GY.Config.colors.friendly, 4.2, 0.65, false);
        hostiles().forEach((target) => {
          if (GY.distance2D(position(target), position(player)) <= 4.25) damage(target, 70, 'player');
        });
        return true;
      }
      if (action === 'skill2') {
        if (cooldowns.skill2 > 0) return false;
        cooldowns.skill2 = GY.Config.player.skill2Cooldown;
        player.actionPose = 0.5;
        const target = playerTarget(8.5);
        if (target) {
          effects.beam(position(player), position(target), 0x9ef3ef, 0.3);
          damage(target, 105, 'player');
          if (combat.bossAttack && combat.bossAttack.type === 'drain') combat.breakGauge += 120;
        }
        return true;
      }
      if (action === 'dodge') {
        if (cooldowns.dodge > 0) return false;
        cooldowns.dodge = GY.Config.player.dodgeCooldown;
        player.invulnerable = 0.45;
        effects.ring(position(player), 0xb9f4e9, 1.3, 0.38, false);
        return true;
      }
      return false;
    }

    function chooseEnemyTarget(enemy) {
      const allies = [player].concat(actors.companions);
      if (combat.mode === 'defense' && actors.villagers.some((actor) => actor.alive)) {
        const victimPool = random() < 0.58 ? actors.villagers : allies;
        return nearest(victimPool, position(enemy)).target;
      }
      return nearest(allies, position(enemy)).target;
    }

    function updateEnemy(enemy, dt) {
      if (!enemy.alive) return;
      enemy.invulnerable = Math.max(0, enemy.invulnerable - dt);
      enemy.attackTimer -= dt;
      if (!enemy.target || !enemy.target.alive) enemy.target = chooseEnemyTarget(enemy);
      if (!enemy.target) return;
      const distance = GY.distance2D(position(enemy), position(enemy.target));
      const moving = moveToward(enemy, position(enemy.target), dt, enemy.range * 0.82, 1);
      enemy.visual.animate(moving ? 'move' : (enemy.actionPose > 0 ? 'attack' : 'idle'), combat.time, 1);
      if (distance <= enemy.range && enemy.attackTimer <= 0) {
        enemy.attackTimer = enemy.attackRate;
        enemy.actionPose = 0.22;
        effects.slash(position(enemy), enemy.visual.group.rotation.y, 0x9d4350);
        damage(enemy.target, enemy.damage);
      }
    }

    function companionDesired(actor) {
      const lead = position(player);
      const offset = formation[actor.role];
      return { x: lead.x + offset.x, y: 0, z: lead.z + offset.z };
    }

    function updateHealer(actor, dt) {
      actor.healTimer -= dt;
      if (actor.healTimer > 0 || !actor.alive) return;
      const allies = [player].concat(actors.companions);
      const needsHelp = allies.some((ally) => ally.alive && ally.hp / ally.maxHp < 0.72);
      if (!needsHelp) return;
      actor.healTimer = 8;
      effects.ring(position(actor), GY.Config.colors.healing, 5.6, 1.25, false);
      allies.forEach((ally) => {
        if (!ally.alive) return;
        const restored = heal(ally, 95);
        ally.hot = 4;
        ally.hotTick = 1;
        combat.healingDone += restored;
      });
      ui.showToast('苏叶施展「和光回春」', 'heal');
    }

    function updateHot(actor, dt) {
      if (actor.hot <= 0 || !actor.alive) return;
      actor.hot -= dt;
      actor.hotTick -= dt;
      if (actor.hotTick <= 0) {
        actor.hotTick += 1;
        combat.healingDone += heal(actor, 12);
      }
    }

    function updateCompanion(actor, dt) {
      actor.invulnerable = Math.max(0, actor.invulnerable - dt);
      actor.actionPose = Math.max(0, actor.actionPose - dt);
      updateHot(actor, dt);
      if (!actor.alive) {
        actor.downTimer -= dt;
        actor.visual.animate('down', combat.time, 1);
        if (actor.downTimer <= 0) {
          actor.alive = true;
          actor.hp = actor.maxHp * 0.35;
          actor.visual.rig.visible = true;
          actor.visual.setHealth(actor.hp / actor.maxHp);
          actor.invulnerable = 2;
          ui.showToast(`${actor.name}重新起身`, 'heal');
        }
        return;
      }

      if (actor.role === 'healer') updateHealer(actor, dt);
      actor.attackTimer -= dt;
      if (actor.burstTimer != null) actor.burstTimer -= dt;
      let target = null;
      if (combat.command === 'focus' || combat.mode === 'defense' || combat.mode === 'road') {
        target = nearest(hostiles(), position(actor)).target;
      } else {
        const nearby = nearest(hostiles(), position(actor));
        if (nearby.distance < 5) target = nearby.target;
      }

      if (!target) {
        const desired = companionDesired(actor);
        const moving = moveToward(actor, desired, dt, 0.35, 1.25);
        actor.visual.animate(moving ? 'move' : 'idle', combat.time, 1);
        return;
      }

      actor.target = target;
      const combatSlots = {
        spear: { x: -2.35, z: 1.1 },
        archer: { x: 4.35, z: 5.8 },
        healer: { x: -4.45, z: 5.9 },
        scout: { x: 2.5, z: 0.4 },
      };
      const targetPosition = position(target);
      const slot = combatSlots[actor.role];
      const desiredPosition = { x: targetPosition.x + slot.x, y: targetPosition.y, z: targetPosition.z + slot.z };
      const moving = moveToward(actor, desiredPosition, dt, 0.32, actor.role === 'scout' ? 1.35 : 1);
      actor.visual.face(targetPosition);
      actor.visual.animate(moving ? 'move' : (actor.actionPose > 0 ? 'attack' : 'idle'), combat.time, 1);
      const distance = GY.distance2D(position(actor), targetPosition);
      const rate = actor.attackRate * (combat.command === 'focus' ? 0.8 : 1);
      if (distance <= actor.range && actor.attackTimer <= 0) {
        actor.attackTimer = rate;
        actor.actionPose = 0.26;
        if (actor.role === 'archer' || actor.role === 'healer') {
          effects.projectile(position(actor), position(target), actor.role === 'healer' ? 0xe9d69b : 0x99d6ea, 0.26);
        } else {
          effects.slash(position(actor), actor.visual.group.rotation.y, GY.Config.colors.friendly);
        }
        damage(target, actor.damage, actor.role);
        if (combat.bossAttack && combat.bossAttack.type === 'drain' && combat.command === 'focus') combat.breakGauge += actor.role === 'spear' ? 18 : 12;
      }

      if (actor.role === 'scout' && actor.burstTimer <= 0 && distance <= 8) {
        actor.burstTimer = 9;
        const from = position(actor);
        let dx = from.x - targetPosition.x;
        let dz = from.z - targetPosition.z;
        const length = Math.hypot(dx, dz) || 1;
        dx /= length;
        dz /= length;
        from.set(targetPosition.x + dx * 1.95, targetPosition.y, targetPosition.z + dz * 1.95);
        effects.slash(position(target), actor.visual.group.rotation.y, 0x80ece3);
        damage(target, 60, 'scout');
        if (combat.bossAttack && combat.bossAttack.type === 'drain' && combat.command === 'focus') combat.breakGauge += 22;
      }
    }

    function livingAllies() {
      return [player].concat(actors.companions).filter((actor) => actor.alive);
    }

    function chooseBossTarget() {
      const spear = actors.companions.find((actor) => actor.role === 'spear' && actor.alive);
      if (spear && random() < 0.68) return spear;
      const allies = livingAllies();
      return allies[Math.floor(random() * allies.length)] || player;
    }

    function beginBossAttack(type) {
      const attack = { type, remaining: 0, targets: [], positions: [] };
      if (type === 'spin') {
        attack.remaining = 0.95;
        attack.name = '断岳回风';
        effects.ring(position(boss), GY.Config.colors.danger, 4.8, attack.remaining, true);
      } else if (type === 'ground') {
        attack.remaining = 1.8;
        attack.name = '焚脉落印';
        const allies = livingAllies();
        attack.targets = [player];
        if (allies.length > 1) attack.targets.push(allies[Math.floor(random() * allies.length)]);
        attack.targets = Array.from(new Set(attack.targets));
        attack.positions = attack.targets.map((target) => ({ x: position(target).x, y: 0, z: position(target).z }));
        attack.positions.forEach((point) => effects.ring(point, 0xd74f56, 2.3, attack.remaining, true));
      } else {
        attack.remaining = 2.5;
        attack.name = '锁脉夺息';
        const healer = actors.companions.find((actor) => actor.role === 'healer' && actor.alive);
        attack.targets = [healer || livingAllies().sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0] || player];
        combat.breakGauge = 0;
        effects.beam(position(boss), position(attack.targets[0]), 0xa55ac8, attack.remaining);
        ui.showToast('首领正在锁脉：集火并用穿云刺破招！', 'danger');
      }
      combat.bossAttack = attack;
      if (!combat.seenAttacks.includes(attack.name)) combat.seenAttacks.push(attack.name);
    }

    function resolveBossAttack() {
      const attack = combat.bossAttack;
      if (!attack) return;
      if (attack.type === 'spin') {
        livingAllies().forEach((actor) => {
          if (GY.distance2D(position(actor), position(boss)) <= 4.8) damage(actor, 90);
        });
        effects.ring(position(boss), 0xff6a66, 5.1, 0.32, false);
      } else if (attack.type === 'ground') {
        attack.positions.forEach((point) => {
          livingAllies().forEach((actor) => {
            if (GY.distance2D(position(actor), point) <= 2.3) damage(actor, 125);
          });
          effects.ring(point, 0xe35b52, 2.45, 0.5, false);
        });
      } else if (combat.breakGauge >= combat.breakRequired) {
        boss.stunTimer = 3;
        combat.breakSuccesses += 1;
        ui.showToast('破招成功！沈烬尘气息紊乱', 'success');
        effects.ring(position(boss), 0x76e6de, 3.8, 0.8, false);
      } else {
        damage(attack.targets[0], 150);
        heal(boss, 450);
        ui.showToast('锁脉未破，首领汲取气血', 'danger');
      }
      combat.bossAttack = null;
      boss.specialTimer = boss.hp / boss.maxHp < 0.45 ? 4.6 : 5.5;
    }

    function evadeCompanionGround(actor, attack, dt) {
      if (attack.type !== 'ground' || attack.remaining > 0.9) return false;
      const index = attack.targets.indexOf(actor);
      if (index < 0) return false;
      const point = attack.positions[index];
      const from = position(actor);
      let dx = from.x - point.x;
      let dz = from.z - point.z;
      if (Math.hypot(dx, dz) < 0.05) {
        dx = actor.role === 'archer' ? 1 : -1;
        dz = actor.role === 'healer' ? 1 : -1;
      }
      const length = Math.hypot(dx, dz);
        from.x += dx / length * 7.5 * dt;
        from.z += dz / length * 7.5 * dt;
        snapActorToSurface(actor);
      return true;
    }

    function updateBoss(dt) {
      if (!boss.alive) return;
      boss.invulnerable = Math.max(0, boss.invulnerable - dt);
      boss.actionPose = Math.max(0, boss.actionPose - dt);
      boss.visual.animate(boss.actionPose > 0 ? 'attack' : 'idle', combat.time, 1.4);
      if (boss.stunTimer > 0) {
        boss.stunTimer -= dt;
        boss.visual.rig.rotation.z = Math.sin(combat.time * 16) * 0.09;
        return;
      }
      boss.visual.rig.rotation.z *= 0.8;
      if (combat.bossAttack) {
        combat.bossAttack.remaining -= dt;
        if (combat.bossAttack.type === 'drain' && combat.bossAttack.targets[0]) {
          effects.beam(position(boss), position(combat.bossAttack.targets[0]), 0xa55ac8, 0.12);
        }
        actors.companions.forEach((actor) => evadeCompanionGround(actor, combat.bossAttack, dt));
        if (combat.breakGauge >= combat.breakRequired && combat.bossAttack.type === 'drain') combat.bossAttack.remaining = 0;
        if (combat.bossAttack.remaining <= 0) resolveBossAttack();
        return;
      }

      boss.specialTimer -= dt;
      boss.attackTimer -= dt;
      if (boss.specialTimer <= 0) {
        const type = ['spin', 'ground', 'drain'][boss.specialIndex % 3];
        boss.specialIndex += 1;
        beginBossAttack(type);
        return;
      }
      if (!boss.target || !boss.target.alive || random() < dt * 0.1) boss.target = chooseBossTarget();
      if (!boss.target) return;
      const distance = GY.distance2D(position(boss), position(boss.target));
      moveToward(boss, position(boss.target), dt, 2.35, 1);
      boss.visual.face(position(boss.target));
      if (distance <= boss.range && boss.attackTimer <= 0) {
        boss.attackTimer = boss.attackRate;
        boss.actionPose = 0.3;
        effects.slash(position(boss), boss.visual.group.rotation.y, 0xd74c57);
        damage(boss.target, boss.damage);
      }
    }

    function checkEnemyDeaths() {
      const defeated = actors.enemies.filter((enemy) => !enemy.alive);
      if (!defeated.length) return;
      defeated.forEach((enemy) => {
        combat.defeated += 1;
        removeEnemy(enemy);
      });
      if (actors.enemies.length > 0) return;
      if (combat.mode === 'road') {
        combat.mode = 'idle';
        cb.onRoadCleared();
      } else if (combat.mode === 'defense') {
        if (combat.wave < combat.wavesTotal) {
          combat.nextWaveTimer = 1.6;
        } else if (actors.villagers.some((actor) => actor.alive)) {
          combat.mode = 'idle';
          cb.onDefenseComplete();
        }
      }
    }

    function spawnDefenseWave(wave) {
      const count = [3, 4, 5][wave - 1];
      const radius = 15;
      for (let i = 0; i < count; i += 1) {
        const angle = (i / count) * Math.PI * 2 + wave * 0.4;
        spawnEnemy(`wave-${wave}-${i}`, Math.sin(angle) * radius, -112 + Math.cos(angle) * radius, 140 + wave * 12, 14 + wave * 2);
      }
      combat.wave = wave;
      combat.nextWaveTimer = 0;
      ui.showToast(`第 ${wave} 波影徒来袭`, 'danger');
    }

    function setMode(mode) {
      clearEnemies();
      combat.mode = mode;
      combat.defeated = 0;
      combat.wave = 0;
      combat.nextWaveTimer = 0;
      combat.bossAttack = null;
      boss.visual.group.visible = false;
      actors.villagers.forEach((actor) => { actor.visual.group.visible = false; });

      if (mode === 'road') {
        spawnEnemy('road-1', -1.8, 43, 120, 12);
        spawnEnemy('road-2', 2.2, 27, 120, 12);
      }
      if (mode === 'defense') {
        actors.villagers.forEach((actor, index) => resetActor(actor, villagerPositions[index]));
        spawnDefenseWave(1);
      }
      if (mode === 'boss') {
        resetActor(boss, { x: 0, z: -121 });
        boss.specialTimer = 4;
        boss.specialIndex = 0;
        boss.stunTimer = 0;
        boss.attackTimer = 1;
        combat.command = 'follow';
        combat.seenAttacks = [];
        combat.breakSuccesses = 0;
      }
    }

    function resetParty(around) {
      resetActor(player, around);
      player.invulnerable = 3;
      player.cooldowns.attack = 0;
      player.cooldowns.dodge = 0;
      player.cooldowns.skill1 = 0;
      player.cooldowns.skill2 = 0;
      actors.companions.forEach((actor) => {
        const offset = formation[actor.role];
        resetActor(actor, { x: around.x + offset.x, y: around.y || 0, z: around.z + offset.z });
        if (actor.role === 'healer') actor.healTimer = 2;
        if (actor.role === 'scout') actor.burstTimer = 3;
      });
    }

    function update(dt, time) {
      combat.time = time;
      [player].concat(actors.companions, actors.villagers, actors.enemies, [boss]).forEach((actor) => {
        actor.invulnerable = Math.max(0, (actor.invulnerable || 0) - dt);
        actor.actionPose = Math.max(0, (actor.actionPose || 0) - dt);
        if (actor.barGroup) actor.barGroup.lookAt(actor.barGroup.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 0, 1)));
      });
      Object.keys(player.cooldowns).forEach((key) => { player.cooldowns[key] = Math.max(0, player.cooldowns[key] - dt); });
      updateHot(player, dt);

      actors.companions.forEach((actor) => updateCompanion(actor, dt));
      actors.enemies.slice().forEach((enemy) => updateEnemy(enemy, dt));

      if (combat.mode === 'defense') {
        if (!actors.villagers.some((actor) => actor.alive)) {
          combat.mode = 'idle';
          cb.onDefenseFailed();
        } else if (combat.nextWaveTimer > 0) {
          combat.nextWaveTimer -= dt;
          if (combat.nextWaveTimer <= 0) spawnDefenseWave(combat.wave + 1);
        }
      }
      if (combat.mode === 'boss') updateBoss(dt);
      separateActors();
      checkEnemyDeaths();

      if (combat.mode === 'boss' && !boss.alive && boss.visual.group.visible === false) {
        combat.mode = 'idle';
        combat.bossAttack = null;
        cb.onBossDefeated();
      }
      player.visual.animate(player.actionPose > 0 ? 'attack' : (player.moving ? 'move' : 'idle'), time, 1);
      effects.update(dt);
    }

    function toggleCommand() {
      combat.command = combat.command === 'focus' ? 'follow' : 'focus';
      ui.showToast(combat.command === 'focus' ? '队令：集火当前目标' : '队令：回到我身边', combat.command === 'focus' ? 'focus' : 'neutral');
      return combat.command;
    }

    function getSnapshot() {
      return {
        mode: combat.mode,
        command: combat.command,
        wave: combat.wave,
        wavesTotal: combat.wavesTotal,
        defeated: combat.defeated,
        roadTotal: combat.roadTotal,
        villagers: actors.villagers.map((actor) => ({
          id: actor.id,
          hp: Math.round(actor.hp),
          maxHp: actor.maxHp,
          alive: actor.alive,
          x: Number(position(actor).x.toFixed(2)),
          y: Number(position(actor).y.toFixed(2)),
          z: Number(position(actor).z.toFixed(2)),
        })),
        companions: actors.companions.map((actor) => ({
          id: actor.id,
          name: actor.name,
          role: actor.role,
          hp: Math.round(actor.hp),
          maxHp: actor.maxHp,
          state: actor.alive ? (actor.target && actor.target.alive ? 'engaged' : 'following') : 'down',
          target: actor.target && actor.target.alive ? actor.target.id : null,
          x: Number(position(actor).x.toFixed(2)),
          y: Number(position(actor).y.toFixed(2)),
          z: Number(position(actor).z.toFixed(2)),
        })),
        enemies: actors.enemies.map((actor) => ({
          id: actor.id,
          hp: Math.round(actor.hp),
          maxHp: actor.maxHp,
          x: Number(position(actor).x.toFixed(2)),
          y: Number(position(actor).y.toFixed(2)),
          z: Number(position(actor).z.toFixed(2)),
        })),
        boss: boss.visual.group.visible ? {
          hp: Math.round(boss.hp),
          maxHp: boss.maxHp,
          attack: combat.bossAttack ? combat.bossAttack.name : null,
          telegraphMs: combat.bossAttack ? Math.max(0, Math.round(combat.bossAttack.remaining * 1000)) : 0,
          breakGauge: Math.round(combat.breakGauge),
          breakRequired: combat.breakRequired,
          stunned: boss.stunTimer > 0,
          seenAttacks: combat.seenAttacks.slice(),
          breakSuccesses: combat.breakSuccesses,
          x: Number(position(boss).x.toFixed(2)),
          y: Number(position(boss).y.toFixed(2)),
          z: Number(position(boss).z.toFixed(2)),
        } : null,
        healingDone: Math.round(combat.healingDone),
        damageStats: Object.assign({}, combat.damageStats),
      };
    }

    return {
      actors,
      state: combat,
      setMode,
      update,
      action: usePlayerAction,
      toggleCommand,
      resetParty,
      clearEnemies,
      getSnapshot,
      damage,
      heal,
      spawnEnemy,
    };
  };
}());
