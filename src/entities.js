(function () {
  'use strict';

  const GY = window.GY = window.GY || {};

  function standard(color, options) {
    return new THREE.MeshStandardMaterial(Object.assign({
      color,
      roughness: 0.78,
      metalness: 0.03,
      flatShading: true,
    }, options || {}));
  }

  function addMesh(parent, geometry, material, position) {
    const item = new THREE.Mesh(geometry, material);
    if (position) item.position.set(position[0], position[1], position[2]);
    item.castShadow = true;
    item.receiveShadow = true;
    parent.add(item);
    return item;
  }

  function addWeapon(parent, weapon, accentMaterial, darkMaterial) {
    const rig = new THREE.Group();
    const gripOffsets = {
      bow: [0.3, -1.02, 0.18],
      fan: [0.34, -1.02, 0.2],
      spear: [0.2, -1.02, 0.14],
    };
    const grip = gripOffsets[weapon] || [0.22, -1.02, 0.16];
    rig.position.set(grip[0], grip[1], grip[2]);
    parent.add(rig);

    if (weapon === 'spear') {
      const shaft = addMesh(rig, new THREE.CylinderGeometry(0.035, 0.035, 3.15, 6), darkMaterial, [0, 0.8, 0]);
      shaft.rotation.z = -0.05;
      addMesh(rig, new THREE.ConeGeometry(0.14, 0.52, 4), accentMaterial, [0.13, 2.58, 0]).rotation.z = 0.05;
    } else if (weapon === 'bow') {
      const bow = addMesh(rig, new THREE.TorusGeometry(0.58, 0.045, 5, 16, Math.PI), accentMaterial, [0, 0.44, 0]);
      bow.rotation.y = Math.PI / 2;
    } else if (weapon === 'fan') {
      const fan = addMesh(rig, new THREE.ConeGeometry(0.5, 0.68, 12, 1, true, -Math.PI / 2, Math.PI), accentMaterial, [0, 0.38, 0.08]);
      fan.rotation.x = Math.PI / 2;
    } else if (weapon === 'daggers') {
      [-0.13, 0.13].forEach((x) => {
        const dagger = addMesh(rig, new THREE.BoxGeometry(0.06, 0.9, 0.08), accentMaterial, [x, 0.5, 0]);
        dagger.rotation.z = x * 0.8;
      });
    } else if (weapon === 'claws') {
      for (let i = -1; i <= 1; i += 1) {
        const claw = addMesh(rig, new THREE.ConeGeometry(0.045, 0.62, 5), accentMaterial, [i * 0.1, 0.1, 0.38]);
        claw.rotation.x = -Math.PI / 2;
      }
    } else {
      const blade = addMesh(rig, new THREE.BoxGeometry(0.075, 1.9, 0.11), accentMaterial, [0, 1.02, 0]);
      blade.rotation.z = -0.04;
      addMesh(rig, new THREE.BoxGeometry(0.5, 0.09, 0.12), darkMaterial, [0, 0.04, 0]);
    }
    rig.userData.restRotation = new THREE.Euler(0, 0, weapon === 'spear' ? -0.08 : -0.14);
    rig.rotation.copy(rig.userData.restRotation);
    return rig;
  }

  GY.createHumanoid = function (scene, options) {
    const opts = Object.assign({
      color: 0x395a61,
      accent: 0x9ccbc4,
      skin: 0xd5ae8b,
      weapon: 'sword',
      scale: 1,
      hostile: false,
      showHealth: false,
    }, options || {});

    const group = new THREE.Group();
    group.userData.entity = true;
    const rig = new THREE.Group();
    group.add(rig);

    const cloth = standard(opts.color);
    const trim = standard(opts.accent, { roughness: 0.48, metalness: 0.12 });
    const dark = standard(0x151c1d);
    const skin = standard(opts.skin);

    const robe = addMesh(rig, new THREE.CylinderGeometry(0.43, 0.72, 1.6, 8), cloth, [0, 1.08, 0]);
    addMesh(rig, new THREE.CylinderGeometry(0.5, 0.56, 0.25, 8), trim, [0, 1.55, 0]);
    const head = addMesh(rig, new THREE.SphereGeometry(0.32, 10, 8), skin, [0, 2.08, 0]);
    addMesh(rig, new THREE.CylinderGeometry(0.16, 0.26, 0.48, 7), dark, [0, 2.48, 0]);
    const sash = addMesh(rig, new THREE.TorusGeometry(0.46, 0.065, 5, 14), trim, [0, 1.27, 0]);
    sash.rotation.x = Math.PI / 2;

    const leftArmPivot = new THREE.Group();
    const rightArmPivot = new THREE.Group();
    leftArmPivot.position.set(-0.42, 1.82, 0);
    rightArmPivot.position.set(0.42, 1.82, 0);
    leftArmPivot.rotation.z = -0.18;
    rightArmPivot.rotation.z = 0.18;
    rig.add(leftArmPivot, rightArmPivot);
    const leftArm = addMesh(leftArmPivot, new THREE.CylinderGeometry(0.1, 0.13, 1.02, 7), cloth, [0, -0.51, 0]);
    const rightArm = addMesh(rightArmPivot, new THREE.CylinderGeometry(0.1, 0.13, 1.02, 7), cloth, [0, -0.51, 0]);
    const weaponRig = addWeapon(rightArmPivot, opts.weapon, trim, dark);

    if (opts.hostile) {
      const aura = addMesh(rig, new THREE.TorusGeometry(0.86, 0.045, 6, 28), new THREE.MeshBasicMaterial({
        color: opts.accent,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
      }), [0, 0.08, 0]);
      aura.rotation.x = Math.PI / 2;
      aura.userData.pulse = true;
    }

    let barFill = null;
    let barGroup = null;
    if (opts.showHealth) {
      barGroup = new THREE.Group();
      barGroup.position.y = 3.05;
      const back = addMesh(barGroup, new THREE.PlaneGeometry(1.45, 0.13), new THREE.MeshBasicMaterial({ color: 0x191d1c }), [0, 0, 0]);
      back.castShadow = false;
      barFill = addMesh(barGroup, new THREE.PlaneGeometry(1.37, 0.075), new THREE.MeshBasicMaterial({ color: opts.hostile ? 0xd25459 : 0x75d9b5 }), [0, 0, 0.01]);
      barFill.castShadow = false;
      group.add(barGroup);
    }

    group.scale.setScalar(opts.scale);
    scene.add(group);

    return {
      group,
      rig,
      robe,
      head,
      leftArm,
      rightArm,
      weaponRig,
      barGroup,
      setHealth(ratio) {
        if (!barFill) return;
        const value = GY.clamp(ratio, 0, 1);
        barFill.scale.x = Math.max(0.001, value);
        barFill.position.x = -(1 - value) * 0.685;
        if (barGroup) barGroup.visible = value > 0;
      },
      face(target) {
        const dx = target.x - group.position.x;
        const dz = target.z - group.position.z;
        if (Math.abs(dx) + Math.abs(dz) > 0.001) group.rotation.y = Math.atan2(dx, dz);
      },
      animate(kind, time, intensity) {
        const strength = intensity == null ? 1 : intensity;
        const restWeapon = weaponRig.userData.restRotation;
        rig.position.y = kind === 'move' ? Math.sin(time * 12) * 0.045 * strength : Math.sin(time * 2.2) * 0.018;
        if (kind === 'attack') {
          const swing = Math.sin(time * 28);
          rightArmPivot.rotation.x = -0.62 + swing * 0.5;
          rightArmPivot.rotation.z = 0.28 + Math.abs(swing) * 0.06;
          leftArmPivot.rotation.x = -0.16 - swing * 0.08;
          weaponRig.rotation.x = restWeapon.x + swing * 0.18;
          weaponRig.rotation.z = restWeapon.z + swing * 0.06;
        } else if (kind === 'down') {
          rig.rotation.z = GY.damp(rig.rotation.z, Math.PI / 2, 10, 1 / 60);
          rig.position.y = -0.45;
        } else {
          const gait = kind === 'move' ? Math.sin(time * 12) * 0.24 * strength : 0;
          leftArmPivot.rotation.x = GY.damp(leftArmPivot.rotation.x, gait, 12, 1 / 60);
          rightArmPivot.rotation.x = GY.damp(rightArmPivot.rotation.x, -gait, 12, 1 / 60);
          leftArmPivot.rotation.z = GY.damp(leftArmPivot.rotation.z, -0.18, 12, 1 / 60);
          rightArmPivot.rotation.z = GY.damp(rightArmPivot.rotation.z, 0.18, 12, 1 / 60);
          weaponRig.rotation.x = GY.damp(weaponRig.rotation.x, restWeapon.x, 12, 1 / 60);
          weaponRig.rotation.z = GY.damp(weaponRig.rotation.z, restWeapon.z, 12, 1 / 60);
          rig.rotation.z *= 0.82;
        }
      },
      remove() {
        scene.remove(group);
        group.traverse((child) => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) child.material.dispose();
        });
      },
    };
  };

  GY.createEffects = function (scene) {
    const effects = [];

    function add(effect) {
      scene.add(effect.mesh);
      effects.push(effect);
      return effect.mesh;
    }

    function ring(position, color, radius, duration, filled) {
      const geometry = filled
        ? new THREE.CircleGeometry(radius, 48)
        : new THREE.RingGeometry(Math.max(0.05, radius - 0.14), radius, 48);
      const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: filled ? 0.27 : 0.82,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const item = new THREE.Mesh(geometry, material);
      item.rotation.x = -Math.PI / 2;
      item.position.set(position.x, (position.y || 0) + 0.08, position.z);
      return add({ mesh: item, age: 0, duration: duration || 0.7, kind: 'ring', baseOpacity: material.opacity });
    }

    function slash(position, rotation, color) {
      const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.88, depthWrite: false, side: THREE.DoubleSide });
      const item = new THREE.Mesh(new THREE.RingGeometry(1.2, 1.65, 28, 1, -1.1, 2.2), material);
      item.position.set(position.x, (position.y || 0) + 1.25, position.z);
      item.rotation.set(Math.PI / 2, rotation || 0, 0);
      return add({ mesh: item, age: 0, duration: 0.32, kind: 'slash', baseOpacity: 0.88 });
    }

    function beam(from, to, color, duration) {
      const start = new THREE.Vector3(from.x, (from.y || 0) + 1.4, from.z);
      const end = new THREE.Vector3(to.x, (to.y || 0) + 1.4, to.z);
      const length = start.distanceTo(end);
      const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.72, depthWrite: false });
      const item = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, length, 8), material);
      item.position.copy(start).lerp(end, 0.5);
      item.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.clone().sub(start).normalize());
      return add({ mesh: item, age: 0, duration: duration || 0.45, kind: 'beam', baseOpacity: 0.72 });
    }

    function projectile(from, to, color, duration) {
      const item = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 7, 6),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, depthWrite: false })
      );
      const start = new THREE.Vector3(from.x, (from.y || 0) + 1.25, from.z);
      const end = new THREE.Vector3(to.x, (to.y || 0) + 1.2, to.z);
      item.position.copy(start);
      return add({ mesh: item, age: 0, duration: duration || 0.32, kind: 'projectile', start, end, baseOpacity: 0.9 });
    }

    function update(dt) {
      for (let i = effects.length - 1; i >= 0; i -= 1) {
        const effect = effects[i];
        effect.age += dt;
        const t = GY.clamp(effect.age / effect.duration, 0, 1);
        if (effect.kind === 'ring') effect.mesh.scale.setScalar(0.72 + t * 0.45);
        if (effect.kind === 'slash') effect.mesh.scale.setScalar(0.75 + t * 0.65);
        if (effect.kind === 'projectile') effect.mesh.position.copy(effect.start).lerp(effect.end, t);
        effect.mesh.material.opacity = effect.baseOpacity * (1 - t);
        if (t >= 1) {
          scene.remove(effect.mesh);
          effect.mesh.geometry.dispose();
          effect.mesh.material.dispose();
          effects.splice(i, 1);
        }
      }
    }

    return { ring, slash, beam, projectile, update };
  };
}());
