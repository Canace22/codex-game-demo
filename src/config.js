(function () {
  'use strict';

  const GY = window.GY = window.GY || {};

  GY.Stage = Object.freeze({
    TITLE: 'TITLE',
    GATE_OFFER: 'GATE_OFFER',
    ROAD_TO_BRIDGE: 'ROAD_TO_BRIDGE',
    BRIDGE_CROSSING: 'BRIDGE_CROSSING',
    VILLAGE_ARRIVAL: 'VILLAGE_ARRIVAL',
    TEMPLE_DEFENSE: 'TEMPLE_DEFENSE',
    BOSS_INTRO: 'BOSS_INTRO',
    BOSS_FIGHT: 'BOSS_FIGHT',
    RETURN_TO_GATE: 'RETURN_TO_GATE',
    COMPLETE: 'COMPLETE',
  });

  GY.Config = Object.freeze({
    player: {
      maxHp: 320,
      maxQi: 100,
      moveSpeed: 7.2,
      sprintSpeed: 17,
      jumpSpeed: 8.6,
      gravity: 22,
      dashCost: 30,
      qiRegen: 20,
      dodgeCooldown: 3,
      attackCooldown: 0.55,
      skill1Cooldown: 5,
      skill2Cooldown: 9,
    },
    boss: { maxHp: 7200 },
    colors: {
      friendly: 0x65cfc9,
      healing: 0xf2d791,
      danger: 0x9d3039,
      dangerDark: 0x4f1520,
      focus: 0x74e0ff,
    },
  });

  GY.QuestCopy = Object.freeze({
    TITLE: { title: '江岸危局', action: '踏入江湖，开始这段旅程', progress: '' },
    GATE_OFFER: { title: '山门急信', action: '前往山门执事处听取求援', progress: '靠近后交互' },
    ROAD_TO_BRIDGE: { title: '驰援澄江村', action: '沿山路前往江岸，清除拦路影徒', progress: '影徒 0/2' },
    BRIDGE_CROSSING: { title: '飞越断桥', action: '利用疾冲、二段跳和踏水落脚点抵达对岸', progress: '轻功试炼' },
    VILLAGE_ARRIVAL: { title: '村口求援', action: '找到澄江村民，了解照水寺险情', progress: '靠近后交互' },
    TEMPLE_DEFENSE: { title: '守住照水寺', action: '保护三名村民，击退来袭影徒', progress: '第 1/3 波' },
    BOSS_INTRO: { title: '邪意现身', action: '走火入魔的沈烬尘闯入寺院', progress: '准备迎战' },
    BOSS_FIGHT: { title: '合力破局', action: '与四名队友击败沈烬尘', progress: '识破三式杀招' },
    RETURN_TO_GATE: { title: '归山复命', action: '沿归云石径返回山门交付任务', progress: '首领已败' },
    COMPLETE: { title: '江岸复宁', action: '任务完成', progress: '' },
  });

  GY.RoleCopy = Object.freeze({
    spear: { name: '陆沉舟', label: '枪卫', color: 0x7fa7a2, accent: 0xd2a65a },
    archer: { name: '闻雁', label: '弓手', color: 0x526b86, accent: 0xd09f62 },
    healer: { name: '苏叶', label: '医者', color: 0xe0d2ae, accent: 0x78b8a9 },
    scout: { name: '越青崖', label: '影行', color: 0x477a73, accent: 0x69d8d0 },
  });

  GY.clamp = function (value, min, max) {
    return Math.max(min, Math.min(max, value));
  };

  GY.distance2D = function (a, b) {
    return Math.hypot(a.x - b.x, a.z - b.z);
  };

  GY.damp = function (current, target, lambda, dt) {
    return THREE.MathUtils.lerp(current, target, 1 - Math.exp(-lambda * dt));
  };

  GY.seededRandom = function (seed) {
    let value = seed >>> 0;
    return function () {
      value = (value * 1664525 + 1013904223) >>> 0;
      return value / 4294967296;
    };
  };
}());
