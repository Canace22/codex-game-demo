(function () {
  'use strict';

  window.GY = window.GY || {};

  const STAGE_RETURN = 'RETURN_TO_GATE';
  const SURFACE_EPSILON = 0.04;

  function normalizeName(value) {
    return String(value || '')
      .trim()
      .replace(/[\s-]+/g, '_')
      .toUpperCase();
  }

  function createWorld(scene) {
    if (!window.THREE) throw new Error('GY.createWorld requires the Three.js global.');
    if (!scene || typeof scene.add !== 'function') throw new Error('GY.createWorld requires a THREE.Scene.');

    const THREE = window.THREE;
    const root = new THREE.Group();
    root.name = '归云谷世界';
    scene.add(root);

    const cameraBlockers = [];
    const walkBlockers = [];
    const markers = Object.create(null);
    const markerList = [];
    const animatedBanners = [];
    const waterRipples = [];
    const spectralPieces = [];
    const flickerMeshes = [];
    const lanternFlames = Object.create(null);
    let currentStage = '';
    let elapsed = 0;

    const palette = {
      grass: 0x304b3d,
      moss: 0x1f4032,
      path: 0xb0b8b3,
      pathEdge: 0x75817e,
      stone: 0xa0aaa5,
      stoneDark: 0x637173,
      plaster: 0x756c5c,
      wood: 0x8d6d58,
      woodLight: 0xb18b6d,
      roof: 0x647875,
      roofEdge: 0x668d86,
      cloth: 0x672d25,
      river: 0x175867,
      riverLight: 0x8ed0c4,
      spectral: 0x7ee8d0,
      gold: 0xe4c477,
    };

    function makeMaterial(color, options) {
      const settings = options || {};
      return new THREE.MeshStandardMaterial({
        color,
        roughness: settings.roughness === undefined ? 0.9 : settings.roughness,
        metalness: settings.metalness === undefined ? 0.02 : settings.metalness,
        transparent: Boolean(settings.transparent),
        opacity: settings.opacity === undefined ? 1 : settings.opacity,
        emissive: settings.emissive === undefined ? 0x000000 : settings.emissive,
        emissiveIntensity: settings.emissiveIntensity === undefined ? 0 : settings.emissiveIntensity,
        side: settings.side === undefined ? THREE.FrontSide : settings.side,
        depthWrite: settings.depthWrite === undefined ? true : settings.depthWrite,
        map: settings.map || null,
        flatShading: settings.flatShading === undefined ? true : settings.flatShading,
      });
    }

    function themedTexture(name) {
      return typeof window.GY.getThemeTexture === 'function'
        ? window.GY.getThemeTexture(name)
        : null;
    }

    const materials = {
      grass: makeMaterial(palette.grass),
      moss: makeMaterial(palette.moss),
      path: makeMaterial(palette.path, { roughness: 1, map: themedTexture('stone'), flatShading: false }),
      pathEdge: makeMaterial(palette.pathEdge),
      stone: makeMaterial(palette.stone, { map: themedTexture('stone'), flatShading: false }),
      stoneDark: makeMaterial(palette.stoneDark, { map: themedTexture('stone'), flatShading: false }),
      plaster: makeMaterial(palette.plaster),
      wood: makeMaterial(palette.wood, { map: themedTexture('cedar'), flatShading: false }),
      woodLight: makeMaterial(palette.woodLight, { map: themedTexture('cedar'), flatShading: false }),
      roof: makeMaterial(palette.roof, { map: themedTexture('cedar'), flatShading: false }),
      roofEdge: makeMaterial(palette.roofEdge, { map: themedTexture('cedar'), flatShading: false }),
      cloth: makeMaterial(palette.cloth, { side: THREE.DoubleSide, map: themedTexture('cloth'), flatShading: false }),
      darkCloth: makeMaterial(0x172426),
      river: makeMaterial(palette.river, {
        roughness: 0.24,
        metalness: 0.08,
        transparent: true,
        opacity: 0.78,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
      riverLight: makeMaterial(palette.riverLight, {
        roughness: 0.28,
        transparent: true,
        opacity: 0.34,
        emissive: 0x2d786e,
        emissiveIntensity: 0.28,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
      marker: makeMaterial(palette.gold, {
        roughness: 0.25,
        metalness: 0.12,
        emissive: 0x8a5c1b,
        emissiveIntensity: 0.8,
      }),
      markerRing: makeMaterial(0xffedb0, {
        roughness: 0.2,
        transparent: true,
        opacity: 0.72,
        emissive: 0xb8792c,
        emissiveIntensity: 0.75,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
      spectral: makeMaterial(palette.spectral, {
        roughness: 0.18,
        transparent: true,
        opacity: 0.44,
        emissive: 0x2fbba1,
        emissiveIntensity: 1.1,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
      flame: makeMaterial(0xffba55, {
        roughness: 0.2,
        transparent: true,
        opacity: 0.86,
        emissive: 0xff7027,
        emissiveIntensity: 1.6,
        depthWrite: false,
      }),
    };

    function addMesh(geometry, material, position, options) {
      const settings = options || {};
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(position[0], position[1], position[2]);
      if (settings.rotation) mesh.rotation.set(settings.rotation[0], settings.rotation[1], settings.rotation[2]);
      if (settings.scale) mesh.scale.set(settings.scale[0], settings.scale[1], settings.scale[2]);
      mesh.castShadow = settings.castShadow === undefined ? true : settings.castShadow;
      mesh.receiveShadow = settings.receiveShadow === undefined ? true : settings.receiveShadow;
      mesh.name = settings.name || '';
      (settings.parent || root).add(mesh);
      if (settings.blocker) cameraBlockers.push(mesh);
      return mesh;
    }

    function addBox(size, material, position, options) {
      return addMesh(new THREE.BoxGeometry(size[0], size[1], size[2]), material, position, options);
    }

    function addCylinder(radiusTop, radiusBottom, height, segments, material, position, options) {
      return addMesh(
        new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments),
        material,
        position,
        options
      );
    }

    function addWalkCircle(x, z, radius, name) {
      walkBlockers.push({ type: 'circle', x, z, radius, name: name || '圆形障碍' });
    }

    function addWalkRect(x, z, width, depth, rotation, name) {
      walkBlockers.push({
        type: 'rect',
        x,
        z,
        halfWidth: width / 2,
        halfDepth: depth / 2,
        rotation: rotation || 0,
        name: name || '矩形障碍',
      });
    }

    function overlapsWalkBlocker(point, radius, blocker) {
      const dx = point.x - blocker.x;
      const dz = point.z - blocker.z;
      if (blocker.type === 'circle') {
        const minimum = radius + blocker.radius;
        return dx * dx + dz * dz < minimum * minimum;
      }

      const cosine = Math.cos(blocker.rotation);
      const sine = Math.sin(blocker.rotation);
      const localX = dx * cosine + dz * sine;
      const localZ = -dx * sine + dz * cosine;
      const nearestX = THREE.MathUtils.clamp(localX, -blocker.halfWidth, blocker.halfWidth);
      const nearestZ = THREE.MathUtils.clamp(localZ, -blocker.halfDepth, blocker.halfDepth);
      const offsetX = localX - nearestX;
      const offsetZ = localZ - nearestZ;
      return offsetX * offsetX + offsetZ * offsetZ < radius * radius;
    }

    function isWalkBlocked(point, radius) {
      return walkBlockers.some(function (blocker) {
        return overlapsWalkBlocker(point, radius, blocker);
      });
    }

    function resolveMoveStep(previous, deltaX, deltaZ, radius) {
      const full = { x: previous.x + deltaX, z: previous.z + deltaZ };
      if (isWalkBlocked(previous, radius)) return full;
      if (!isWalkBlocked(full, radius)) return full;

      const xOnly = { x: full.x, z: previous.z };
      const zOnly = { x: previous.x, z: full.z };
      const canMoveX = !isWalkBlocked(xOnly, radius);
      const canMoveZ = !isWalkBlocked(zOnly, radius);
      if (canMoveX && canMoveZ) return Math.abs(deltaX) >= Math.abs(deltaZ) ? xOnly : zOnly;
      if (canMoveX) return xOnly;
      if (canMoveZ) return zOnly;
      return { x: previous.x, z: previous.z };
    }

    function resolveMove(previous, next, radius) {
      const start = {
        x: Number.isFinite(previous && previous.x) ? previous.x : 0,
        z: Number.isFinite(previous && previous.z) ? previous.z : 0,
      };
      if (!next || !Number.isFinite(next.x) || !Number.isFinite(next.z)) {
        return { x: start.x, z: start.z, blocked: true };
      }

      const safeRadius = Math.max(0.05, Number.isFinite(radius) ? radius : 0.65);
      const deltaX = next.x - start.x;
      const deltaZ = next.z - start.z;
      const distance = Math.hypot(deltaX, deltaZ);
      const steps = Math.max(1, Math.ceil(distance / Math.max(0.18, safeRadius * 0.45)));
      const stepX = deltaX / steps;
      const stepZ = deltaZ / steps;
      let current = start;
      for (let index = 0; index < steps; index += 1) {
        current = resolveMoveStep(current, stepX, stepZ, safeRadius);
      }
      return {
        x: current.x,
        z: current.z,
        blocked: Math.abs(current.x - next.x) > 0.001 || Math.abs(current.z - next.z) > 0.001,
      };
    }

    function roadCenter(z) {
      return Math.sin((z - 10) * 0.105) * 2.15 + Math.sin((z + 2) * 0.045) * 0.75;
    }

    function roadHeight(z) {
      return 1.02 + THREE.MathUtils.clamp((z - 10) / 50, 0, 1) * 2.98;
    }

    function makeRibbon(zStart, zEnd, segments, widthAt, centerAt, heightAt, material, yOffset) {
      const positions = [];
      const indices = [];
      const uvs = [];
      const offset = yOffset || 0;
      for (let i = 0; i <= segments; i += 1) {
        const amount = i / segments;
        const z = THREE.MathUtils.lerp(zStart, zEnd, amount);
        const width = typeof widthAt === 'function' ? widthAt(z) : widthAt;
        const center = typeof centerAt === 'function' ? centerAt(z) : centerAt;
        const y = (typeof heightAt === 'function' ? heightAt(z) : heightAt) + offset;
        positions.push(center - width / 2, y, z, center + width / 2, y, z);
        uvs.push(0, amount * 3, 1, amount * 3);
        if (i < segments) {
          const base = i * 2;
          if (zEnd >= zStart) {
            indices.push(base, base + 2, base + 1, base + 2, base + 3, base + 1);
          } else {
            indices.push(base, base + 1, base + 2, base + 2, base + 1, base + 3);
          }
        }
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
      geometry.setIndex(indices);
      geometry.computeVertexNormals();
      return addMesh(geometry, material, [0, 0, 0], {
        castShadow: false,
        receiveShadow: true,
      });
    }

    function createTerrain() {
      makeRibbon(9.8, 60, 30, 38, roadCenter, function (z) { return roadHeight(z) - 0.16; }, materials.grass);
      makeRibbon(9.8, 60, 34, 8.2, roadCenter, roadHeight, materials.path, 0.02);

      addBox([38, 4.1, 31], materials.grass, [0, 1.94, 73.5], { castShadow: false });
      addBox([29, 0.22, 26], materials.path, [0, 4.02, 72], { castShadow: false });

      makeRibbon(-31.2, -94, 24, function (z) {
        return z < -43 && z > -82 ? 41 : 26;
      }, function (z) {
        return Math.sin((z + 33) * 0.08) * 1.15;
      }, function (z) {
        return 0.8 - THREE.MathUtils.clamp((-z - 32) / 62, 0, 1) * 0.1;
      }, materials.grass);

      makeRibbon(-30.5, -103, 32, function (z) {
        return z < -45 && z > -82 ? 8 : 6.8;
      }, function (z) {
        return Math.sin((z + 33) * 0.08) * 1.15;
      }, function (z) {
        return 0.82 - THREE.MathUtils.clamp((-z - 32) / 70, 0, 1) * 0.1;
      }, materials.path, 0.025);

      addCylinder(22.5, 22.5, 1.8, 48, materials.grass, [0, -0.16, -116], {
        castShadow: false,
      });
      const arena = addMesh(new THREE.CircleGeometry(19.5, 48), materials.path, [0, 0.76, -116], {
        rotation: [-Math.PI / 2, 0, 0],
        castShadow: false,
        receiveShadow: true,
        name: '古寺演武场',
      });
      arena.userData.zone = 'TEMPLE_ARENA';

      const river = addMesh(new THREE.PlaneGeometry(64, 40), materials.river, [0, -1.12, -10], {
        rotation: [-Math.PI / 2, 0, 0],
        castShadow: false,
        receiveShadow: true,
        name: '照影河',
      });
      river.renderOrder = -1;

      for (let i = 0; i < 11; i += 1) {
        const ripple = addMesh(
          new THREE.RingGeometry(0.7 + (i % 3) * 0.18, 0.79 + (i % 3) * 0.18, 22),
          materials.riverLight,
          [-23 + i * 4.6, -1.08, -25 + (i % 5) * 7.7],
          {
            rotation: [-Math.PI / 2, 0, 0],
            castShadow: false,
            receiveShadow: false,
          }
        );
        ripple.userData.phase = i * 0.71;
        waterRipples.push(ripple);
      }

      for (let i = 0; i < 7; i += 1) {
        const x = i % 2 === 0 ? -30 - i * 1.9 : 29 + i * 1.7;
        const z = 2 - i * 9.2;
        addCylinder(8 + (i % 3) * 2, 12 + (i % 2) * 3, 16 + (i % 4) * 4, 7, materials.stoneDark, [x, 4.5, z], {
          rotation: [0, i * 0.36, (i % 2 ? 1 : -1) * 0.08],
          blocker: true,
          name: '河谷峭壁',
        });
      }
    }

    function createRoof(parent, x, y, z, width, depth, scale, material) {
      const eave = addBox([width + 1.1, 0.32, depth + 1.1], material || materials.roof, [x, y, z], {
        parent,
        blocker: true,
      });
      eave.scale.z = scale || 1;
      const roof = addMesh(new THREE.ConeGeometry(1, 1.65, 4), material || materials.roof, [x, y + 0.88, z], {
        rotation: [0, Math.PI / 4, 0],
        scale: [width * 0.78, 1, depth * 0.66 * (scale || 1)],
        parent,
        blocker: true,
      });
      return roof;
    }

    function createLantern(parent, x, y, z, color) {
      addCylinder(0.06, 0.06, 1.3, 6, materials.wood, [x, y + 0.65, z], { parent });
      const lamp = addMesh(new THREE.OctahedronGeometry(0.32, 0), color || materials.flame, [x, y, z], {
        parent,
        castShadow: false,
        receiveShadow: false,
      });
      lamp.userData.phase = x * 0.7 + z * 0.2;
      flickerMeshes.push(lamp);
      return lamp;
    }

    function createVillageLantern(key, x, z) {
      const ground = getSurface(x, z);
      const y = ground ? ground.y : 0.78;
      addCylinder(0.22, 0.28, 0.9, 7, materials.stoneDark, [x, y + 0.45, z], { name: '灯座' });
      addCylinder(0.07, 0.07, 1.15, 6, materials.wood, [x, y + 1.5, z]);
      const emberMaterial = makeMaterial(0x384850, {
        roughness: 0.6,
        emissive: 0x16232a,
        emissiveIntensity: 0.32,
      });
      const flame = addMesh(new THREE.OctahedronGeometry(0.3, 0), emberMaterial, [x, y + 2.1, z], {
        castShadow: false,
        receiveShadow: false,
        name: '平安灯',
      });
      flame.userData.phase = x * 0.7 + z * 0.2;
      flame.userData.lit = false;
      flickerMeshes.push(flame);
      lanternFlames[key] = flame;
      createMarker(key, [x, y + 3.1, z], 'lantern');
    }

    function lightLantern(key) {
      const flame = lanternFlames[key];
      if (!flame || flame.userData.lit) return false;
      flame.userData.lit = true;
      flame.material.color.setHex(0xffba55);
      flame.material.emissive.setHex(0xff7027);
      flame.material.emissiveIntensity = 1.6;
      if (markers[key]) markers[key].visible = false;
      return true;
    }

    function resetLanterns() {
      Object.keys(lanternFlames).forEach(function (key) {
        const flame = lanternFlames[key];
        flame.userData.lit = false;
        flame.material.color.setHex(0x384850);
        flame.material.emissive.setHex(0x16232a);
        flame.material.emissiveIntensity = 0.32;
        if (markers[key]) markers[key].visible = true;
      });
    }

    function createGate() {
      const gate = new THREE.Group();
      gate.name = '栖岚山门';
      root.add(gate);

      addBox([36, 5.8, 1.6], materials.stoneDark, [0, 2.1, 86], { parent: gate, blocker: true });
      addBox([9.5, 4.5, 2], materials.stone, [-13, 5.3, 76], { parent: gate, blocker: true });
      addBox([9.5, 4.5, 2], materials.stone, [13, 5.3, 76], { parent: gate, blocker: true });
      addBox([2.1, 9.2, 2.2], materials.wood, [-6.1, 8.55, 76], { parent: gate, blocker: true });
      addBox([2.1, 9.2, 2.2], materials.wood, [6.1, 8.55, 76], { parent: gate, blocker: true });
      addBox([14.2, 1.05, 2.4], materials.woodLight, [0, 12.45, 76], { parent: gate, blocker: true });
      addWalkRect(0, 86, 36, 1.6, 0, '山门后墙');
      addWalkRect(-13, 76, 9.5, 2, 0, '山门左侧墙');
      addWalkRect(13, 76, 9.5, 2, 0, '山门右侧墙');
      addWalkRect(-6.1, 76, 2.1, 2.2, 0, '山门左柱');
      addWalkRect(6.1, 76, 2.1, 2.2, 0, '山门右柱');
      createRoof(gate, 0, 13.3, 76, 19, 5.4, 1, materials.roof);
      createRoof(gate, 0, 15.2, 76, 13.5, 4.1, 1, materials.roofEdge);

      for (let i = 0; i < 5; i += 1) {
        addBox([12 - i * 1.55, 0.22, 1.65], materials.stone, [0, 4.12 - i * 0.3, 60.5 + i * 1.6], {
          parent: gate,
          castShadow: false,
        });
      }

      [-8.2, 8.2].forEach(function (x, index) {
        const banner = addMesh(new THREE.PlaneGeometry(1.5, 4.2), materials.cloth, [x, 10.25, 75.3], {
          parent: gate,
          rotation: [0, 0, index ? -0.04 : 0.04],
          castShadow: true,
          receiveShadow: false,
        });
        banner.userData.baseRotation = banner.rotation.z;
        banner.userData.phase = index * 1.6;
        animatedBanners.push(banner);
      });

      createLantern(gate, -4.2, 7.4, 74.7);
      createLantern(gate, 4.2, 7.4, 74.7);
    }

    function createHouse(x, z, width, depth, rotation, ruined) {
      const house = new THREE.Group();
      house.position.set(x, 0.76, z);
      house.rotation.y = rotation || 0;
      house.name = ruined ? '废弃民居' : '江畔民居';
      root.add(house);
      addWalkRect(x, z, width, depth, rotation, house.name);

      const wallHeight = ruined ? 2.4 : 3.6;
      addBox([width, wallHeight, depth], ruined ? materials.stone : materials.plaster, [0, wallHeight / 2, 0], {
        parent: house,
        blocker: true,
      });
      addBox([width * 0.18, wallHeight * 0.72, 0.22], materials.wood, [0, wallHeight * 0.36, -depth / 2 - 0.12], {
        parent: house,
      });
      if (!ruined) {
        createRoof(house, 0, wallHeight + 0.18, 0, width + 1.2, depth + 1.2, 1, materials.roof);
        createLantern(house, -width * 0.3, wallHeight * 0.62, -depth / 2 - 0.32);
      } else {
        const brokenRoof = addBox([width * 0.7, 0.32, depth + 0.7], materials.roof, [-width * 0.18, wallHeight + 0.2, 0], {
          parent: house,
          rotation: [0, 0, -0.17],
          blocker: true,
        });
        brokenRoof.scale.z = 0.72;
      }
      return house;
    }

    function createNpc(x, z, robeColor, name, facing) {
      const npc = new THREE.Group();
      npc.position.set(x, getSurface(x, z) ? getSurface(x, z).y : 0.78, z);
      npc.rotation.y = facing || 0;
      npc.name = name;
      npc.userData.npc = true;
      npc.userData.role = name;
      root.add(npc);
      addWalkCircle(x, z, 0.58, name);
      const robeMaterial = makeMaterial(robeColor, {
        map: themedTexture('cloth'),
        flatShading: false,
      });
      addMesh(new THREE.CylinderGeometry(0.34, 0.62, 1.55, 7), robeMaterial, [0, 0.79, 0], { parent: npc });
      addMesh(new THREE.SphereGeometry(0.27, 9, 7), makeMaterial(0xd2a47f), [0, 1.77, 0], { parent: npc });
      addCylinder(0.13, 0.2, 0.38, 7, materials.darkCloth, [0, 2.11, 0], { parent: npc });
      return npc;
    }

    function createMarker(key, position, kind) {
      const marker = new THREE.Group();
      marker.position.set(position[0], position[1], position[2]);
      marker.name = key;
      marker.userData.interactable = true;
      marker.userData.kind = kind || 'quest';
      marker.userData.baseY = position[1];
      const diamond = addMesh(new THREE.OctahedronGeometry(0.37, 0), materials.marker, [0, 0, 0], {
        parent: marker,
        castShadow: false,
        receiveShadow: false,
      });
      diamond.rotation.z = Math.PI / 4;
      addMesh(new THREE.TorusGeometry(0.66, 0.055, 6, 28), materials.markerRing, [0, 0, 0], {
        parent: marker,
        rotation: [Math.PI / 2, 0, 0],
        castShadow: false,
        receiveShadow: false,
      });
      root.add(marker);
      markers[key] = marker;
      markerList.push(marker);
      return marker;
    }

    function createVillage() {
      createHouse(-13, -48, 7.4, 6.2, 0.12, false);
      createHouse(13.5, -51, 7.7, 6.5, -0.18, false);
      createHouse(-15.5, -65, 8.2, 6.4, -0.08, true);
      createHouse(14, -68, 7.3, 5.8, 0.14, false);
      createHouse(-11.5, -78, 6.8, 5.7, 0.22, true);

      addBox([13, 0.55, 4.2], materials.woodLight, [15.2, 0.15, -60], {
        rotation: [0, 0.08, 0],
        castShadow: false,
      });
      for (let i = 0; i < 5; i += 1) {
        addCylinder(0.18, 0.2, 2.4, 6, materials.wood, [10.4 + i * 2.5, -0.42, -60 + i * 0.2]);
      }

      createNpc(-3.8, -57, 0x6b5b4c, '江村里正', Math.PI);
      createNpc(4.6, -61.5, 0x596e67, '受伤村民', -2.6);
      createNpc(-6.8, -69, 0x806a56, '避难村民', 0.3);
      createNpc(6.2, -73.2, 0x5d5968, '守村青年', -0.5);
      createMarker('villageElder', [-3.8, 3.45, -57], 'npc');

      createVillageLantern('villageLantern1', -8, -53);
      createVillageLantern('villageLantern2', 9.5, -57);
      createVillageLantern('villageLantern3', -7, -73);
    }

    function createTemple() {
      const temple = new THREE.Group();
      temple.name = '残月古寺';
      root.add(temple);

      addBox([31, 1.4, 2.1], materials.stoneDark, [0, 1.25, -137], { parent: temple, blocker: true });
      addBox([2.2, 7.6, 2.2], materials.stone, [-11.5, 4.5, -132.5], { parent: temple, blocker: true });
      addBox([2.2, 6.2, 2.2], materials.stone, [11.5, 3.8, -132.5], { parent: temple, blocker: true });
      addBox([18.5, 4.7, 7], materials.plaster, [0, 3.05, -137.5], { parent: temple, blocker: true });
      addBox([4.2, 5.3, 1.1], materials.wood, [-6.3, 5.5, -133.7], { parent: temple, blocker: true });
      addBox([4.2, 3.8, 1.1], materials.wood, [6.3, 4.75, -133.7], { parent: temple, rotation: [0, 0, 0.23], blocker: true });
      addWalkRect(0, -137.5, 18.5, 7, 0, '古寺主殿');
      addWalkRect(-11.5, -132.5, 2.2, 2.2, 0, '古寺左残柱');
      addWalkRect(11.5, -132.5, 2.2, 2.2, 0, '古寺右残柱');
      addWalkRect(-11.8, -137, 7.1, 2.1, 0, '古寺后墙左段');
      addWalkRect(11.8, -137, 7.1, 2.1, 0, '古寺后墙右段');

      const leftRoof = addBox([12, 0.55, 8.6], materials.roof, [-4.2, 6.8, -137.1], {
        parent: temple,
        rotation: [0, 0, -0.12],
        blocker: true,
      });
      leftRoof.scale.z = 0.68;
      const rightRoof = addBox([8, 0.55, 8.2], materials.roofEdge, [6.6, 6.15, -137], {
        parent: temple,
        rotation: [0, 0, 0.24],
        blocker: true,
      });
      rightRoof.scale.z = 0.68;

      const columnPositions = [
        [-17, -126], [17, -126], [-20, -115], [20, -115], [-17, -104], [17, -104],
      ];
      columnPositions.forEach(function (position, index) {
        const height = index % 3 === 0 ? 3.5 : 5.7;
        addCylinder(0.5, 0.65, height, 7, materials.stone, [position[0], height / 2 + 0.75, position[1]], {
          parent: temple,
          rotation: [0, index * 0.2, index % 2 ? 0.04 : -0.04],
          blocker: true,
        });
        addWalkCircle(position[0], position[1], 0.64, '古寺外柱');
      });

      [-8.5, 8.5].forEach(function (x) {
        addCylinder(0.76, 0.9, 0.62, 9, materials.stoneDark, [x, 1.06, -101.5], { parent: temple });
        addWalkCircle(x, -101.5, 0.86, '古寺灯座');
        createLantern(temple, x, 2.65, -101.5);
      });

      const arenaRing = addMesh(new THREE.RingGeometry(15.8, 16.15, 48), materials.stoneDark, [0, 0.79, -116], {
        parent: temple,
        rotation: [-Math.PI / 2, 0, 0],
        castShadow: false,
      });
      arenaRing.name = '演武场边界';
      createMarker('bossFocus', [0, 3.6, -116], 'combat');
    }

    function createTree(x, z, scale, tintMaterial) {
      const surface = getSurface(x, z);
      const groundY = surface ? surface.y : (z > 10 ? Math.max(0.85, roadHeight(z) - 0.18) : 0.7);
      const tree = new THREE.Group();
      tree.position.set(x, groundY, z);
      tree.scale.setScalar(scale);
      tree.rotation.y = x * 0.18 + z * 0.07;
      root.add(tree);
      addWalkCircle(x, z, Math.max(0.24, scale * 0.27), '山松');
      addCylinder(0.16, 0.3, 3.3, 6, materials.wood, [0, 1.65, 0], { parent: tree });
      addMesh(new THREE.ConeGeometry(1.55, 3.7, 7), tintMaterial || materials.moss, [0, 4.15, 0], { parent: tree });
      addMesh(new THREE.ConeGeometry(1.15, 3.1, 7), materials.grass, [0.38, 5.55, 0.12], { parent: tree });
    }

    function createScenery() {
      const mountainMaterial = makeMaterial(0x304a47);
      const mountainFarMaterial = makeMaterial(0x4d625d);
      for (let i = 0; i < 18; i += 1) {
        const side = i % 2 === 0 ? -1 : 1;
        const row = Math.floor(i / 2);
        const x = side * (42 + (row % 3) * 9);
        const z = 92 - row * 28;
        const height = 24 + (i % 5) * 5.5;
        addMesh(new THREE.ConeGeometry(11 + (i % 4) * 2.5, height, 7), i % 3 ? mountainMaterial : mountainFarMaterial, [x, height / 2 - 3, z], {
          rotation: [0, i * 0.37, side * 0.04],
          blocker: true,
          name: '远山',
        });
      }

      for (let i = 0; i < 34; i += 1) {
        const z = 54 - i * 4.15;
        if (z < -36 && z > -84 && i % 3 === 0) continue;
        if (z < 9 && z > -31) continue;
        const side = i % 2 === 0 ? -1 : 1;
        const center = z > 10 ? roadCenter(z) : Math.sin((z + 33) * 0.08) * 1.15;
        const x = center + side * (8.5 + (i % 4) * 2.1);
        createTree(x, z, 0.78 + (i % 4) * 0.1, i % 3 ? materials.moss : materials.grass);
      }

      for (let i = 0; i < 15; i += 1) {
        const side = i % 2 === 0 ? -1 : 1;
        const z = 48 - i * 9.8;
        const x = side * (18 + (i % 3) * 3.5);
        const height = 2 + (i % 4) * 0.75;
        addMesh(new THREE.DodecahedronGeometry(height, 0), materials.stoneDark, [x, height * 0.42, z], {
          rotation: [i * 0.13, i * 0.29, 0],
          scale: [1.25, 0.78, 1],
          blocker: true,
          name: '苔石',
        });
      }
    }

    const bridgePlatforms = [
      { x: 0, z: 5.6, width: 4.8, depth: 4.4, y: 1.04, type: 'broken_bridge', checkpoint: 'bridgeNorth' },
      { x: -2.6, z: 0.1, width: 2.7, depth: 2.5, y: 0.78, type: 'stepping_stone' },
      { x: 1.55, z: -4.7, width: 2.35, depth: 2.15, y: 1.18, type: 'stepping_stone' },
      { x: -1.8, z: -9.4, width: 2.3, depth: 2.1, y: 0.62, type: 'stepping_stone', checkpoint: 'bridgeMid' },
      { x: 2.45, z: -14.2, width: 2.2, depth: 2.05, y: 1.12, type: 'stepping_stone' },
      { x: -2.05, z: -19.1, width: 2.1, depth: 2, y: 0.57, type: 'stepping_stone' },
      { x: 1.15, z: -23.9, width: 2.55, depth: 2.2, y: 0.98, type: 'stepping_stone' },
      { x: -0.2, z: -28.1, width: 4.7, depth: 3.2, y: 0.78, type: 'broken_bridge', checkpoint: 'bridgeSouth' },
    ];

    function createBridge() {
      bridgePlatforms.forEach(function (platform, index) {
        if (platform.type === 'stepping_stone') {
          addCylinder(
            Math.min(platform.width, platform.depth) * 0.48,
            Math.min(platform.width, platform.depth) * 0.63,
            1.25 + (index % 2) * 0.25,
            7,
            index % 2 ? materials.stone : materials.stoneDark,
            [platform.x, platform.y - 0.68, platform.z],
            { rotation: [0, index * 0.58, 0], name: '轻功落脚石' }
          );
          addBox([platform.width * 0.72, 0.12, platform.depth * 0.32], materials.moss, [platform.x, platform.y - 0.02, platform.z], {
            castShadow: false,
          });
        } else {
          addBox([platform.width, 0.34, platform.depth], materials.woodLight, [platform.x, platform.y - 0.17, platform.z], {
            name: '断桥残板',
          });
          for (let plank = -1; plank <= 1; plank += 1) {
            addBox([0.13, 0.18, platform.depth], materials.wood, [platform.x + plank * platform.width * 0.35, platform.y - 0.24, platform.z]);
          }
        }
      });

      [-4.4, 4.4].forEach(function (x) {
        addCylinder(0.22, 0.25, 3.7, 7, materials.wood, [x, 2.15, 7.6], { rotation: [0.06, 0, x < 0 ? -0.08 : 0.08] });
        addCylinder(0.2, 0.24, 3.1, 7, materials.wood, [x * 0.78, 1.62, -27.9], { rotation: [-0.09, 0, x < 0 ? 0.13 : -0.13] });
      });

      const spectralRoot = new THREE.Group();
      spectralRoot.name = '归途流光桥';
      spectralRoot.visible = false;
      root.add(spectralRoot);
      for (let i = 0; i < 11; i += 1) {
        const z = 7.8 - i * 3.55;
        const piece = addBox([4.7, 0.14, 2.85], materials.spectral, [0, 1.33, z], {
          parent: spectralRoot,
          castShadow: false,
          receiveShadow: false,
          name: '流光桥片',
        });
        piece.userData.phase = i * 0.54;
        spectralPieces.push(piece);
      }
      spectralRoot.userData.isReturnBridge = true;
      return spectralRoot;
    }

    function addRoadFurniture() {
      const posts = [52, 36, 19, -38, -87, -99];
      posts.forEach(function (z, index) {
        const center = z > 10 ? roadCenter(z) : Math.sin((z + 33) * 0.08) * 1.15;
        const side = index % 2 === 0 ? -1 : 1;
        const x = center + side * 4.7;
        const y = getSurface(center, z).y;
        addCylinder(0.11, 0.15, 2.8, 6, materials.wood, [x, y + 1.4, z]);
        createLantern(root, x, y + 2.4, z);
      });

      for (let i = 0; i < 10; i += 1) {
        const z = 49 - i * 4.1;
        const x = roadCenter(z) + (i % 2 ? -4.6 : 4.6);
        const y = roadHeight(z);
        addCylinder(0.22, 0.34, 0.75, 6, materials.stone, [x, y + 0.22, z], {
          rotation: [0, i * 0.3, 0.08],
        });
      }
    }

    const spectralRoot = createBridge();

    const spawnPoints = {
      GATE: { x: 0, y: 4.04, z: 70, facing: Math.PI },
      START: { x: 0, y: 4.04, z: 80, facing: Math.PI },
      GATE_MASTER: { x: 3.2, y: 4.04, z: 69, facing: -2.5 },
      ROAD: { x: roadCenter(42), y: roadHeight(42), z: 42, facing: Math.PI },
      BRIDGE_NORTH: { x: roadCenter(10.8), y: roadHeight(10.8), z: 10.8, facing: Math.PI },
      BRIDGE_MID: { x: -1.8, y: 0.66, z: -9.4, facing: Math.PI },
      BRIDGE_SOUTH: { x: -0.2, y: 0.82, z: -31.8, facing: Math.PI },
      VILLAGE: { x: 0, y: 0.78, z: -58, facing: Math.PI },
      VILLAGE_LANTERN_1: { x: -8, y: 0.78, z: -53, facing: 0 },
      VILLAGE_LANTERN_2: { x: 9.5, y: 0.78, z: -57, facing: 0 },
      VILLAGE_LANTERN_3: { x: -7, y: 0.78, z: -73, facing: 0 },
      TEMPLE: { x: 0, y: 0.75, z: -101, facing: Math.PI },
      ARENA: { x: 0, y: 0.78, z: -108, facing: Math.PI },
      BOSS: { x: 0, y: 0.78, z: -119, facing: 0 },
      RETURN_GATE: { x: 0, y: 4.04, z: 70, facing: 0 },
    };

    const spawnAliases = {
      PLAYER: 'START',
      QUEST_GIVER: 'GATE_MASTER',
      BRIDGENORTH: 'BRIDGE_NORTH',
      BRIDGEMID: 'BRIDGE_MID',
      BRIDGESOUTH: 'BRIDGE_SOUTH',
      TEMPLE_ENTRANCE: 'TEMPLE',
      BOSS_ARENA: 'ARENA',
      RETURNGATE: 'RETURN_GATE',
    };

    function makeZone(name, minX, maxX, minZ, maxZ, centerX, centerZ, radius) {
      return {
        name,
        minX,
        maxX,
        minZ,
        maxZ,
        center: { x: centerX, z: centerZ },
        radius: radius || null,
        contains: function (x, z) {
          if (radius) return Math.hypot(x - centerX, z - centerZ) <= radius;
          return x >= minX && x <= maxX && z >= minZ && z <= maxZ;
        },
      };
    }

    const zones = {
      GATE: makeZone('GATE', -18, 18, 57, 87, 0, 72),
      MOUNTAIN_ROAD: makeZone('MOUNTAIN_ROAD', -15, 15, 10, 59, 0, 34),
      BRIDGE: makeZone('BRIDGE', -8, 8, -31, 10, 0, -10),
      RIVER: makeZone('RIVER', -32, 32, -30, 10, 0, -10),
      VILLAGE: makeZone('VILLAGE', -21, 21, -84, -37, 0, -60),
      TEMPLE: makeZone('TEMPLE', -23, 23, -140, -87, 0, -116),
      TEMPLE_ARENA: makeZone('TEMPLE_ARENA', -20, 20, -136, -96, 0, -116, 20),
    };

    const zoneAliases = {
      ROAD: 'MOUNTAIN_ROAD',
      BROKEN_BRIDGE: 'BRIDGE',
      BOSS: 'TEMPLE_ARENA',
      ARENA: 'TEMPLE_ARENA',
      BOSS_ARENA: 'TEMPLE_ARENA',
    };

    function isReturnStage(stage) {
      return normalizeName(stage) === STAGE_RETURN;
    }

    function rectangleContains(platform, x, z) {
      return Math.abs(x - platform.x) <= platform.width / 2 + SURFACE_EPSILON
        && Math.abs(z - platform.z) <= platform.depth / 2 + SURFACE_EPSILON;
    }

    function getSurface(x, z, stage) {
      if (!Number.isFinite(x) || !Number.isFinite(z)) return null;
      const queryStage = stage === undefined ? currentStage : stage;

      if (isReturnStage(queryStage) && z >= -30.4 && z <= 10.2 && Math.abs(x) <= 2.38) {
        const result = { y: 1.4, type: 'spectral_bridge' };
        if (z > 7.2) result.checkpoint = 'bridgeNorth';
        if (z < -27.4) result.checkpoint = 'bridgeSouth';
        return result;
      }

      for (let i = 0; i < bridgePlatforms.length; i += 1) {
        const platform = bridgePlatforms[i];
        if (rectangleContains(platform, x, z)) {
          const result = { y: platform.y, type: platform.type, id: `bridge-platform-${i}` };
          if (platform.checkpoint) result.checkpoint = platform.checkpoint;
          return result;
        }
      }

      if (Math.hypot(x, z + 116) <= 21.4) {
        return { y: 0.76, type: 'temple_arena', checkpoint: 'temple' };
      }

      if (z >= -105 && z < -82 && Math.abs(x - Math.sin((z + 33) * 0.08) * 1.15) <= 5.8) {
        return { y: 0.72, type: 'temple_path' };
      }

      if (z >= -82 && z <= -30.4) {
        const center = Math.sin((z + 33) * 0.08) * 1.15;
        const halfWidth = z < -43 ? 19.5 : 12.5;
        if (Math.abs(x - center) <= halfWidth) {
          const result = { y: 0.8 - THREE.MathUtils.clamp((-z - 32) / 62, 0, 1) * 0.1, type: 'village_ground' };
          if (z > -36) result.checkpoint = 'bridgeSouth';
          if (z < -49 && z > -73) result.checkpoint = 'village';
          return result;
        }
      }

      if (z >= 57 && z <= 87 && Math.abs(x) <= 18.4) {
        return { y: 4.04, type: 'gate_courtyard', checkpoint: 'gate' };
      }

      if (z >= 9.8 && z < 60.5) {
        const center = roadCenter(z);
        if (Math.abs(x - center) <= 18.5) {
          const result = { y: roadHeight(z), type: 'mountain_road' };
          if (z < 13) result.checkpoint = 'bridgeNorth';
          return result;
        }
      }

      return null;
    }

    function getSpawn(name) {
      let key = normalizeName(name);
      key = spawnAliases[key] || key;
      const spawn = spawnPoints[key];
      if (!spawn) return null;
      return { x: spawn.x, y: spawn.y, z: spawn.z, facing: spawn.facing };
    }

    function getZone(name) {
      let key = normalizeName(name);
      key = zoneAliases[key] || key;
      return zones[key] || null;
    }

    function setStage(stage) {
      currentStage = normalizeName(stage);
      spectralRoot.visible = isReturnStage(currentStage);
      if (markers.gateMaster) {
        markers.gateMaster.visible = currentStage === 'AT_GATE'
          || currentStage === 'GATE_OFFER'
          || currentStage === STAGE_RETURN;
        markers.bridgeNorth.visible = currentStage === 'ROAD_TO_BRIDGE'
          || currentStage === 'BRIDGE_CROSSING';
        markers.bridgeSouth.visible = currentStage === 'BRIDGE_CROSSING';
        markers.villageElder.visible = currentStage === 'VILLAGE_ARRIVAL';
        ['villageLantern1', 'villageLantern2', 'villageLantern3'].forEach(function (key) {
          if (markers[key]) markers[key].visible = currentStage === 'VILLAGE_LANTERNS' && !lanternFlames[key].userData.lit;
        });
        markers.templeEntrance.visible = currentStage === 'TEMPLE_DEFENSE';
        markers.bossFocus.visible = currentStage === 'BOSS_INTRO'
          || currentStage === 'BOSS_FIGHT';
      }
      return currentStage;
    }

    function update(dt, time) {
      const safeDt = Number.isFinite(dt) ? THREE.MathUtils.clamp(dt, 0, 0.1) : 0;
      elapsed += safeDt;
      const clock = elapsed;
      void time;

      markerList.forEach(function (marker, index) {
        marker.position.y = marker.userData.baseY + Math.sin(clock * 2.4 + index * 0.8) * 0.16;
        marker.rotation.y = clock * 1.15 + index * 0.45;
      });

      animatedBanners.forEach(function (banner) {
        banner.rotation.z = banner.userData.baseRotation + Math.sin(clock * 1.65 + banner.userData.phase) * 0.055;
      });

      waterRipples.forEach(function (ripple, index) {
        const pulse = 0.86 + ((clock * 0.2 + index * 0.11) % 1) * 0.65;
        ripple.scale.setScalar(pulse);
        ripple.material.opacity = 0.16 + (1.55 - pulse) * 0.22;
        ripple.position.x += Math.sin(clock * 0.8 + ripple.userData.phase) * safeDt * 0.12;
      });

      spectralPieces.forEach(function (piece) {
        piece.position.y = 1.33 + Math.sin(clock * 2.1 + piece.userData.phase) * 0.07;
      });
      materials.spectral.opacity = 0.38 + Math.sin(clock * 2.4) * 0.08;

      flickerMeshes.forEach(function (flame) {
        const flicker = 0.9 + Math.sin(clock * 8.7 + flame.userData.phase) * 0.1;
        flame.scale.set(flicker, 0.86 + flicker * 0.14, flicker);
      });
    }

    createTerrain();
    createGate();
    createVillage();
    createTemple();
    createScenery();
    addRoadFurniture();

    createNpc(3.2, 69, 0x3f5963, '山门执事', -2.5);
    createMarker('gateMaster', [3.2, 6.75, 69], 'npc');
    createMarker('bridgeNorth', [roadCenter(11), 3.8, 11], 'checkpoint');
    createMarker('bridgeSouth', [-0.2, 3.45, -32], 'checkpoint');
    createMarker('templeEntrance', [0, 3.45, -101], 'objective');

    markers.bridgeNorth.visible = false;
    markers.bridgeSouth.visible = false;
    markers.templeEntrance.visible = false;
    markers.bossFocus.visible = false;

    setStage('AT_GATE');

    return {
      root,
      update,
      getSurface,
      getSpawn,
      getZone,
      lightLantern,
      resetLanterns,
      setStage,
      resolveMove,
      markers,
      cameraBlockers,
      walkBlockers,
    };
  }

  window.GY.createWorld = createWorld;
}());
