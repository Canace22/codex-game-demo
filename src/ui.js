(function (global) {
  'use strict';

  const GY = global.GY = global.GY || {};
  const ACTION_LABELS = {
    attack: ['斩', '普通攻击', 'J'],
    dodge: ['避', '闪避', 'Shift'],
    skill1: ['破', '流云破', 'Q'],
    skill2: ['御', '归潮式', 'E'],
    jump: ['跃', '二段跳', 'Space'],
    dash: ['冲', '轻功冲刺', 'R'],
    command: ['令', '队伍指令', 'G'],
    interact: ['应', '互动', 'F'],
  };
  const COMPANION_DEFAULTS = [
    { id: 'spear', name: '陆昭', role: '长枪控场', mark: '枪', tone: 'amber' },
    { id: 'archer', name: '闻雁', role: '远程弓箭', mark: '弓', tone: 'blue' },
    { id: 'healer', name: '苏叶', role: '治疗辅助', mark: '药', tone: 'jade' },
    { id: 'skirmisher', name: '凌霜', role: '轻功突袭', mark: '影', tone: 'violet' },
  ];
  const ABILITY_ORDER = ['attack', 'dodge', 'skill1', 'skill2', 'dash', 'jump'];
  const MOBILE_ORDER = ['attack', 'dodge', 'skill1', 'skill2', 'jump', 'dash', 'command', 'interact'];
  const DEFAULT_COOLDOWNS = { attack: 0.45, dodge: 4, skill1: 8, skill2: 12, dash: 3, jump: 1 };
  const TONE_NAMES = new Set(['neutral', 'jade', 'gold', 'danger', 'heal', 'break']);

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
  }

  function numberFrom(source, names, fallback) {
    if (!source) return fallback;
    for (let index = 0; index < names.length; index += 1) {
      const value = Number(source[names[index]]);
      if (Number.isFinite(value)) return value;
    }
    return fallback;
  }

  function ratio(value, maximum) {
    return maximum > 0 ? clamp(value / maximum, 0, 1) : 0;
  }

  function toneName(tone) {
    return TONE_NAMES.has(tone) ? tone : 'neutral';
  }

  function setBar(node, value) {
    node.style.setProperty('--gy-fill', `${Math.round(clamp(value, 0, 1) * 100)}%`);
  }

  function setText(node, value, fallback) {
    node.textContent = value === undefined || value === null || value === '' ? fallback : String(value);
  }

  function makeBar(className) {
    const bar = element('span', `gy-bar ${className || ''}`.trim());
    bar.append(element('span', 'gy-bar__fill'));
    return bar;
  }

  function makeActionButton(action, mobile) {
    const defaults = ACTION_LABELS[action];
    const button = element('button', `gy-action gy-action--${action}${mobile ? ' gy-action--mobile' : ''}`);
    button.type = 'button';
    button.dataset.action = action;
    button.setAttribute('aria-label', defaults[1]);
    button.innerHTML = [
      '<span class="gy-action__cooldown" aria-hidden="true"></span>',
      `<span class="gy-action__mark" aria-hidden="true">${defaults[0]}</span>`,
      `<span class="gy-action__name">${defaults[1]}</span>`,
      mobile ? '' : `<kbd class="gy-action__key">${defaults[2]}</kbd>`,
      '<span class="gy-action__timer" aria-hidden="true"></span>',
    ].join('');
    return button;
  }

  GY.createUI = function createUI(shell, callbacks) {
    if (!shell || typeof shell.appendChild !== 'function') {
      throw new TypeError('GY.createUI 需要一个有效的游戏容器元素');
    }

    const handlers = callbacks || {};
    const cleanup = [];
    const timers = new Set();
    const root = element('div', 'gy-ui');
    root.setAttribute('aria-label', '游戏界面');

    const quest = element('section', 'gy-quest');
    quest.setAttribute('aria-label', '当前任务');
    const questHead = element('div', 'gy-quest__head');
    const questLabel = element('span', 'gy-eyebrow', '当前目标');
    const questStage = element('span', 'gy-quest__stage');
    questHead.append(questLabel, questStage);
    const questText = element('strong', 'gy-quest__text', '在山门前整备');
    const questProgress = element('div', 'gy-quest__progress');
    const questBar = makeBar('gy-bar--quest');
    const questProgressText = element('span', 'gy-quest__progress-text');
    questProgress.append(questBar, questProgressText);
    quest.append(questHead, questText, questProgress);

    const vitals = element('section', 'gy-vitals');
    vitals.setAttribute('aria-label', '角色状态');
    const portrait = element('span', 'gy-vitals__portrait', '剑');
    portrait.setAttribute('aria-hidden', 'true');
    const vitalData = element('div', 'gy-vitals__data');
    const hpRow = element('div', 'gy-vital gy-vital--hp');
    const hpName = element('span', 'gy-vital__name', '气血');
    const hpText = element('span', 'gy-vital__value', '100 / 100');
    const hpBar = makeBar('gy-bar--hp');
    hpRow.append(hpName, hpText, hpBar);
    const qiRow = element('div', 'gy-vital gy-vital--qi');
    const qiName = element('span', 'gy-vital__name', '真气');
    const qiText = element('span', 'gy-vital__value', '100 / 100');
    const qiBar = makeBar('gy-bar--qi');
    qiRow.append(qiName, qiText, qiBar);
    vitalData.append(hpRow, qiRow);
    vitals.append(portrait, vitalData);

    const party = element('section', 'gy-party');
    party.setAttribute('aria-label', '五人小队');
    const partyHead = element('div', 'gy-party__head');
    const partyTitle = element('span', 'gy-eyebrow', '同行侠士');
    const partyOrders = element('div', 'gy-party__orders');
    const focusButton = element('button', 'gy-order', '集火');
    focusButton.type = 'button';
    focusButton.dataset.action = 'focus';
    focusButton.setAttribute('aria-label', '命令队友集火当前目标');
    const regroupButton = element('button', 'gy-order', '归队');
    regroupButton.type = 'button';
    regroupButton.dataset.action = 'regroup';
    regroupButton.setAttribute('aria-label', '命令队友回到身边');
    partyOrders.append(focusButton, regroupButton);
    partyHead.append(partyTitle, partyOrders);
    const partyList = element('div', 'gy-party__list');
    const companionViews = COMPANION_DEFAULTS.map((member) => {
      const card = element('article', `gy-companion gy-companion--${member.tone}`);
      card.dataset.companionId = member.id;
      const mark = element('span', 'gy-companion__mark', member.mark);
      mark.setAttribute('aria-hidden', 'true');
      const info = element('span', 'gy-companion__info');
      const name = element('strong', 'gy-companion__name', member.name);
      const role = element('span', 'gy-companion__role', member.role);
      const bar = makeBar('gy-bar--companion');
      info.append(name, role, bar);
      const status = element('span', 'gy-companion__status');
      card.append(mark, info, status);
      partyList.append(card);
      return { card, mark, name, role, bar, status, defaults: member };
    });
    party.append(partyHead, partyList);

    const boss = element('section', 'gy-boss');
    boss.setAttribute('aria-label', '首领状态');
    boss.hidden = true;
    const bossTop = element('div', 'gy-boss__top');
    const bossRank = element('span', 'gy-boss__rank', '首领');
    const bossName = element('strong', 'gy-boss__name', '无名高手');
    const bossHpText = element('span', 'gy-boss__value', '100%');
    bossTop.append(bossRank, bossName, bossHpText);
    const bossHpBar = makeBar('gy-bar--boss');
    const breakRow = element('div', 'gy-boss__break');
    const breakLabel = element('span', null, '破绽');
    const breakBar = makeBar('gy-bar--break');
    const breakValue = element('span', 'gy-boss__break-value', '0%');
    breakRow.append(breakLabel, breakBar, breakValue);
    const telegraph = element('div', 'gy-telegraph');
    telegraph.setAttribute('role', 'status');
    const telegraphPulse = element('span', 'gy-telegraph__pulse');
    telegraphPulse.setAttribute('aria-hidden', 'true');
    const telegraphText = element('strong', 'gy-telegraph__text');
    telegraph.append(telegraphPulse, telegraphText);
    boss.append(bossTop, bossHpBar, breakRow, telegraph);

    const interaction = element('div', 'gy-interaction');
    interaction.hidden = true;
    const interactionKey = element('kbd', 'gy-interaction__key', 'F');
    const interactionText = element('span', 'gy-interaction__text', '互动');
    interaction.append(interactionKey, interactionText);

    const abilities = element('section', 'gy-abilities');
    abilities.setAttribute('aria-label', '战斗技能');
    const actionViews = Object.create(null);
    ABILITY_ORDER.forEach((action) => {
      const button = makeActionButton(action, false);
      abilities.append(button);
      actionViews[action] = actionViews[action] || [];
      actionViews[action].push(button);
    });

    const toastLayer = element('div', 'gy-toasts');
    toastLayer.setAttribute('aria-live', 'polite');
    toastLayer.setAttribute('aria-atomic', 'false');
    const floatLayer = element('div', 'gy-floats');
    floatLayer.setAttribute('aria-hidden', 'true');

    const touchControls = element('section', 'gy-touch');
    touchControls.setAttribute('aria-label', '触控操作');
    const joystick = element('div', 'gy-joystick');
    joystick.setAttribute('role', 'application');
    joystick.setAttribute('aria-label', '移动摇杆');
    joystick.tabIndex = 0;
    const joystickRing = element('span', 'gy-joystick__ring');
    const joystickKnob = element('span', 'gy-joystick__knob');
    joystick.append(joystickRing, joystickKnob);
    const lookPad = element('div', 'gy-look-pad');
    lookPad.setAttribute('role', 'application');
    lookPad.setAttribute('aria-label', '拖动此区域转动镜头');
    lookPad.tabIndex = 0;
    const mobileActions = element('div', 'gy-mobile-actions');
    MOBILE_ORDER.forEach((action) => {
      const button = makeActionButton(action, true);
      mobileActions.append(button);
      actionViews[action] = actionViews[action] || [];
      actionViews[action].push(button);
    });
    touchControls.append(lookPad, joystick, mobileActions);

    const rotate = element('aside', 'gy-rotate');
    rotate.setAttribute('role', 'status');
    rotate.innerHTML = '<span class="gy-rotate__phone" aria-hidden="true"></span><strong>请横屏游玩</strong><span>旋转设备以展开轻功与战斗操作</span>';

    root.append(quest, boss, party, vitals, interaction, abilities, toastLayer, floatLayer, touchControls, rotate);
    shell.append(root);

    function listen(node, type, handler, options) {
      node.addEventListener(type, handler, options);
      cleanup.push(() => node.removeEventListener(type, handler, options));
    }

    function emitAction(action, pressed) {
      if (typeof handlers.onAction === 'function') handlers.onAction(action, pressed);
    }

    const buttons = Array.from(root.querySelectorAll('button[data-action]'));
    buttons.forEach((button) => {
      let pointerId = null;
      const release = (event) => {
        if (pointerId === null || (event.pointerId !== undefined && event.pointerId !== pointerId)) return;
        button.classList.remove('is-pressed');
        emitAction(button.dataset.action, false);
        pointerId = null;
      };
      listen(button, 'pointerdown', (event) => {
        if (button.disabled || pointerId !== null) return;
        event.preventDefault();
        pointerId = event.pointerId;
        button.classList.add('is-pressed');
        button.setPointerCapture?.(pointerId);
        emitAction(button.dataset.action, true);
      });
      listen(button, 'pointerup', release);
      listen(button, 'pointercancel', release);
      listen(button, 'lostpointercapture', release);
      listen(button, 'click', (event) => {
        if (event.detail !== 0 || button.disabled) return;
        emitAction(button.dataset.action, true);
        global.setTimeout(() => emitAction(button.dataset.action, false), 0);
      });
    });

    let joystickPointer = null;
    let joystickVector = { x: 0, y: 0 };

    function paintJoystick(x, y) {
      joystickVector = { x: clamp(x, -1, 1), y: clamp(y, -1, 1) };
      joystickKnob.style.transform = `translate(calc(-50% + ${joystickVector.x * 36}px), calc(-50% + ${joystickVector.y * 36}px))`;
      joystick.setAttribute('aria-valuetext', `横向 ${joystickVector.x.toFixed(2)}，纵向 ${(-joystickVector.y).toFixed(2)}`);
    }

    function updateJoystick(event) {
      const bounds = joystick.getBoundingClientRect();
      const radius = Math.max(34, Math.min(bounds.width, bounds.height) * 0.34);
      let x = (event.clientX - bounds.left - bounds.width / 2) / radius;
      let y = (event.clientY - bounds.top - bounds.height / 2) / radius;
      const length = Math.hypot(x, y);
      if (length > 1) {
        x /= length;
        y /= length;
      }
      paintJoystick(x, y);
      emitAction('move', { x, y: -y });
    }

    function releaseJoystick(event) {
      if (joystickPointer === null || (event.pointerId !== undefined && event.pointerId !== joystickPointer)) return;
      joystickPointer = null;
      paintJoystick(0, 0);
      emitAction('move', { x: 0, y: 0 });
    }

    listen(joystick, 'pointerdown', (event) => {
      if (joystickPointer !== null) return;
      event.preventDefault();
      joystickPointer = event.pointerId;
      joystick.setPointerCapture?.(event.pointerId);
      updateJoystick(event);
    });
    listen(joystick, 'pointermove', (event) => {
      if (event.pointerId === joystickPointer) updateJoystick(event);
    });
    listen(joystick, 'pointerup', releaseJoystick);
    listen(joystick, 'pointercancel', releaseJoystick);
    listen(joystick, 'lostpointercapture', releaseJoystick);
    listen(joystick, 'keydown', (event) => {
      const vectors = {
        ArrowLeft: [-1, joystickVector.y],
        ArrowRight: [1, joystickVector.y],
        ArrowUp: [joystickVector.x, -1],
        ArrowDown: [joystickVector.x, 1],
      };
      if (!vectors[event.key]) return;
      event.preventDefault();
      paintJoystick(vectors[event.key][0], vectors[event.key][1]);
      emitAction('move', { x: joystickVector.x, y: -joystickVector.y });
    });
    listen(joystick, 'keyup', (event) => {
      if (!event.key.startsWith('Arrow')) return;
      paintJoystick(0, 0);
      emitAction('move', { x: 0, y: 0 });
    });

    let lookPointer = null;
    let previousLookX = 0;
    let previousLookY = 0;
    function releaseLook(event) {
      if (lookPointer === null || (event.pointerId !== undefined && event.pointerId !== lookPointer)) return;
      lookPointer = null;
      lookPad.classList.remove('is-dragging');
    }
    listen(lookPad, 'pointerdown', (event) => {
      event.preventDefault();
      lookPointer = event.pointerId;
      previousLookX = event.clientX;
      previousLookY = event.clientY;
      lookPad.classList.add('is-dragging');
      lookPad.setPointerCapture?.(event.pointerId);
    });
    listen(lookPad, 'pointermove', (event) => {
      if (event.pointerId !== lookPointer) return;
      const dx = event.clientX - previousLookX;
      const dy = event.clientY - previousLookY;
      previousLookX = event.clientX;
      previousLookY = event.clientY;
      if (typeof handlers.onLook === 'function' && (dx || dy)) handlers.onLook(dx, dy);
    });
    listen(lookPad, 'pointerup', releaseLook);
    listen(lookPad, 'pointercancel', releaseLook);
    listen(lookPad, 'lostpointercapture', releaseLook);
    listen(lookPad, 'keydown', (event) => {
      const directions = { ArrowLeft: [-14, 0], ArrowRight: [14, 0], ArrowUp: [0, -10], ArrowDown: [0, 10] };
      if (!directions[event.key] || typeof handlers.onLook !== 'function') return;
      event.preventDefault();
      handlers.onLook(directions[event.key][0], directions[event.key][1]);
    });

    function updateQuest(snapshot) {
      const questState = snapshot.quest || {};
      const objective = snapshot.objective ?? questState.objective ?? questState.text;
      setText(questLabel, questState.label || questState.title, '当前目标');
      setText(questText, objective, '在山门前整备');
      setText(questStage, questState.stageLabel || questState.stage, '');

      const current = numberFrom(questState, ['current', 'step', 'value'], NaN);
      const total = numberFrom(questState, ['total', 'stepCount', 'max'], NaN);
      let progress = numberFrom(questState, ['progress', 'ratio'], NaN);
      if (Number.isFinite(current) && Number.isFinite(total) && total > 0) progress = current / total;
      if (progress > 1 && progress <= 100 && !Number.isFinite(total)) progress /= 100;
      const hasProgress = Number.isFinite(progress) || (Number.isFinite(current) && Number.isFinite(total));
      questProgress.hidden = !hasProgress;
      if (hasProgress) {
        setBar(questBar, progress);
        const progressLabel = questState.progressLabel || (Number.isFinite(current) && Number.isFinite(total) ? `${current} / ${total}` : `${Math.round(clamp(progress, 0, 1) * 100)}%`);
        questProgressText.textContent = progressLabel;
      }
      quest.classList.toggle('is-complete', Boolean(questState.complete || questState.completed));
    }

    function updateVitals(snapshot) {
      const player = snapshot.player || snapshot.vitals || {};
      const hp = numberFrom(player, ['hp', 'health', 'currentHp'], 100);
      const maxHp = numberFrom(player, ['maxHp', 'healthMax', 'maximumHp'], Math.max(100, hp));
      const qi = numberFrom(player, ['qi', 'energy', 'currentQi'], 100);
      const maxQi = numberFrom(player, ['maxQi', 'energyMax', 'maximumQi'], Math.max(100, qi));
      hpText.textContent = `${Math.ceil(Math.max(0, hp))} / ${Math.ceil(Math.max(1, maxHp))}`;
      qiText.textContent = `${Math.ceil(Math.max(0, qi))} / ${Math.ceil(Math.max(1, maxQi))}`;
      setBar(hpBar, ratio(hp, maxHp));
      setBar(qiBar, ratio(qi, maxQi));
      vitals.classList.toggle('is-danger', maxHp > 0 && hp / maxHp <= 0.28);
      vitals.classList.toggle('is-down', hp <= 0);
    }

    function updateParty(snapshot) {
      const members = snapshot.companions || snapshot.party?.members || snapshot.party || [];
      companionViews.forEach((view, index) => {
        const member = Array.isArray(members) ? (members[index] || {}) : (members[view.defaults.id] || {});
        const hp = numberFrom(member, ['hp', 'health', 'currentHp'], 100);
        const maxHp = numberFrom(member, ['maxHp', 'healthMax', 'maximumHp'], Math.max(100, hp));
        setText(view.name, member.name, view.defaults.name);
        setText(view.role, member.role || member.roleLabel, view.defaults.role);
        setText(view.mark, member.mark, view.defaults.mark);
        setBar(view.bar, ratio(hp, maxHp));
        const down = Boolean(member.down || member.defeated || hp <= 0);
        const status = down ? '倒地' : (member.statusLabel || member.status || '');
        setText(view.status, status, '');
        view.card.classList.toggle('is-down', down);
        view.card.classList.toggle('is-targeted', Boolean(member.targeted || member.underAttack));
        view.card.setAttribute('aria-label', `${view.name.textContent}，${view.role.textContent}，气血 ${Math.max(0, Math.ceil(hp))}/${Math.max(1, Math.ceil(maxHp))}${status ? `，${status}` : ''}`);
      });
      const order = snapshot.partyOrder || snapshot.party?.order || '';
      focusButton.classList.toggle('is-active', order === 'focus');
      regroupButton.classList.toggle('is-active', order === 'regroup' || order === 'follow');
      focusButton.setAttribute('aria-pressed', String(order === 'focus'));
      regroupButton.setAttribute('aria-pressed', String(order === 'regroup' || order === 'follow'));
    }

    function updateBoss(snapshot) {
      const bossState = snapshot.boss;
      const visible = Boolean(bossState && bossState.visible !== false && bossState.active !== false);
      boss.hidden = !visible;
      if (!visible) return;

      const hp = numberFrom(bossState, ['hp', 'health', 'currentHp'], 100);
      const maxHp = numberFrom(bossState, ['maxHp', 'healthMax', 'maximumHp'], Math.max(100, hp));
      const hpRatio = ratio(hp, maxHp);
      setText(bossName, bossState.name, '无名高手');
      setText(bossRank, bossState.rank || bossState.title, '首领');
      setBar(bossHpBar, hpRatio);
      bossHpText.textContent = `${Math.round(hpRatio * 100)}%`;

      const breakAmount = numberFrom(bossState, ['break', 'breakValue', 'stagger', 'poiseDamage'], 0);
      const breakMaximum = numberFrom(bossState, ['maxBreak', 'breakMax', 'maxStagger', 'poise'], 100);
      const breakRatio = ratio(breakAmount, breakMaximum);
      setBar(breakBar, breakRatio);
      breakValue.textContent = `${Math.round(breakRatio * 100)}%`;
      boss.classList.toggle('is-broken', Boolean(bossState.broken || bossState.staggered));

      const telegraphState = bossState.telegraph;
      const telegraphLabel = typeof telegraphState === 'string' ? telegraphState : telegraphState?.label || telegraphState?.name || '';
      const telegraphActive = Boolean(telegraphLabel && telegraphState?.active !== false);
      setText(telegraphText, telegraphLabel, '');
      telegraph.hidden = !telegraphActive;
      telegraph.className = `gy-telegraph gy-telegraph--${toneName(telegraphState?.tone === 'danger' ? 'danger' : telegraphState?.tone)}`;
      const telegraphProgress = numberFrom(telegraphState, ['progress', 'ratio'], 0);
      telegraph.style.setProperty('--gy-telegraph-progress', clamp(telegraphProgress, 0, 1));
      boss.classList.toggle('is-telegraphing', telegraphActive);
    }

    function updateInteraction(snapshot) {
      const interactionState = snapshot.interaction || snapshot.prompt;
      const text = typeof interactionState === 'string' ? interactionState : interactionState?.text || interactionState?.label || '';
      const visible = Boolean(text && interactionState?.visible !== false && interactionState?.active !== false);
      interaction.hidden = !visible;
      if (!visible) return;
      setText(interactionText, text, '互动');
      setText(interactionKey, interactionState?.key, 'F');
      interaction.classList.toggle('is-urgent', Boolean(interactionState?.urgent));
    }

    function updateAbilities(snapshot) {
      const abilityStates = snapshot.abilities || snapshot.skills || {};
      const cooldowns = snapshot.cooldowns || {};
      Object.keys(actionViews).forEach((action) => {
        const value = abilityStates[action];
        const ability = typeof value === 'number' ? { cooldown: value } : (value || {});
        const cooldownValue = typeof cooldowns[action] === 'number' ? cooldowns[action] : undefined;
        const remaining = cooldownValue ?? numberFrom(ability, ['remaining', 'cooldownRemaining', 'cooldown'], 0);
        const duration = numberFrom(ability, ['duration', 'cooldownDuration', 'maxCooldown'], DEFAULT_COOLDOWNS[action] || Math.max(remaining, 1));
        const cooldownRatio = remaining > 0 ? ratio(remaining, duration) : 0;
        actionViews[action].forEach((button) => {
          const defaults = ACTION_LABELS[action];
          const label = ability.label || ability.name || defaults[1];
          button.querySelector('.gy-action__name').textContent = label;
          button.setAttribute('aria-label', remaining > 0 ? `${label}，冷却 ${remaining.toFixed(1)} 秒` : label);
          button.style.setProperty('--gy-cooldown', cooldownRatio);
          button.querySelector('.gy-action__timer').textContent = remaining > 0.05 ? (remaining >= 10 ? Math.ceil(remaining) : remaining.toFixed(1)) : '';
          button.classList.toggle('is-cooling', remaining > 0.05);
          button.classList.toggle('is-ready', Boolean(ability.ready || ability.highlight));
          button.disabled = ability.enabled === false || ability.locked === true;
        });
      });
    }

    function update(snapshot) {
      const state = snapshot || {};
      root.classList.toggle('is-hidden', state.uiVisible === false || state.hideUI === true);
      root.classList.toggle('is-combat', Boolean(state.inCombat || state.combat || state.boss));
      root.classList.toggle('is-cinematic', Boolean(state.cinematic));
      updateQuest(state);
      updateVitals(state);
      updateParty(state);
      updateBoss(state);
      updateInteraction(state);
      updateAbilities(state);
    }

    function showToast(text, tone) {
      if (text === undefined || text === null || text === '') return null;
      const toast = element('div', `gy-toast gy-toast--${toneName(tone)}`, String(text));
      toastLayer.append(toast);
      requestAnimationFrame(() => toast.classList.add('is-visible'));
      const timer = global.setTimeout(() => {
        toast.classList.remove('is-visible');
        const removeTimer = global.setTimeout(() => {
          toast.remove();
          timers.delete(removeTimer);
        }, 260);
        timers.add(removeTimer);
        timers.delete(timer);
      }, 2300);
      timers.add(timer);
      return toast;
    }

    function showFloat(text, x, y, tone) {
      if (text === undefined || text === null || text === '') return null;
      const float = element('span', `gy-float gy-float--${toneName(tone)}`, String(text));
      float.style.left = `${Number.isFinite(x) ? x : global.innerWidth / 2}px`;
      float.style.top = `${Number.isFinite(y) ? y : global.innerHeight / 2}px`;
      floatLayer.append(float);
      requestAnimationFrame(() => float.classList.add('is-visible'));
      const timer = global.setTimeout(() => {
        float.remove();
        timers.delete(timer);
      }, 1050);
      timers.add(timer);
      return float;
    }

    function destroy() {
      cleanup.splice(0).forEach((remove) => remove());
      timers.forEach((timer) => global.clearTimeout(timer));
      timers.clear();
      root.remove();
    }

    setBar(questBar, 0);
    setBar(hpBar, 1);
    setBar(qiBar, 1);
    companionViews.forEach((view) => setBar(view.bar, 1));
    update({});

    return {
      root,
      update,
      showToast,
      showFloat,
      setMobileVector(x, y) { paintJoystick(x, -y); },
      destroy,
    };
  };
}(window));
