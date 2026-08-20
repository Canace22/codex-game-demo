(function () {
  'use strict';

  const GY = window.GY = window.GY || {};
  const THREE = window.THREE;
  const assets = {
    cloth: { source: 'assets/textures/robe-cloth-512.jpg', repeat: 2 },
    stone: { source: 'assets/textures/bluestone-512.jpg', repeat: 4 },
    cedar: { source: 'assets/textures/dark-cedar-512.jpg', repeat: 3 },
  };
  const cache = Object.create(null);
  const records = Object.create(null);
  const loader = new THREE.TextureLoader();
  const localFile = window.location && window.location.protocol === 'file:';

  if (localFile) loader.setCrossOrigin(null);

  function seededRandom(seed) {
    let value = seed >>> 0;
    return function () {
      value = (value * 1664525 + 1013904223) >>> 0;
      return value / 4294967296;
    };
  }

  function makeLocalCanvas(name) {
    const size = 128;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const random = seededRandom(name === 'cloth' ? 17 : (name === 'stone' ? 29 : 43));
    canvas.width = size;
    canvas.height = size;

    if (name === 'cloth') {
      context.fillStyle = '#c7cbc2';
      context.fillRect(0, 0, size, size);
      for (let line = 0; line < size; line += 3) {
        context.strokeStyle = line % 6 ? 'rgba(71,87,81,.22)' : 'rgba(236,231,211,.42)';
        context.beginPath();
        context.moveTo(line + 0.5, 0);
        context.lineTo(line + 0.5, size);
        context.stroke();
        context.beginPath();
        context.moveTo(0, line + 0.5);
        context.lineTo(size, line + 0.5);
        context.stroke();
      }
    } else if (name === 'stone') {
      context.fillStyle = '#39494f';
      context.fillRect(0, 0, size, size);
      const rows = 8;
      const rowHeight = size / rows;
      for (let row = 0; row < rows; row += 1) {
        const offset = row % 2 ? -12 : 0;
        for (let column = offset; column < size; column += 25) {
          const inset = 1.5;
          const tone = 72 + Math.floor(random() * 18);
          context.fillStyle = `rgb(${tone - 9},${tone + 3},${tone + 6})`;
          context.fillRect(column + inset, row * rowHeight + inset, 22, rowHeight - inset * 2);
          context.strokeStyle = 'rgba(168,179,174,.2)';
          context.strokeRect(column + inset + 0.5, row * rowHeight + inset + 0.5, 21, rowHeight - inset * 2 - 1);
        }
      }
    } else {
      context.fillStyle = '#30221b';
      context.fillRect(0, 0, size, size);
      for (let line = 0; line < size; line += 2) {
        const alpha = 0.08 + random() * 0.16;
        context.strokeStyle = `rgba(188,128,76,${alpha.toFixed(3)})`;
        context.beginPath();
        context.moveTo(0, line + Math.sin(line * 0.37) * 0.7);
        context.bezierCurveTo(36, line - 1, 92, line + 1, size, line);
        context.stroke();
      }
    }
    return canvas;
  }

  function configureTexture(texture, name) {
    const asset = assets[name];
    texture.name = `归云录纹理:${name}`;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(asset.repeat, asset.repeat);
    texture.encoding = THREE.sRGBEncoding;
    texture.anisotropy = 2;
    return texture;
  }

  function getTexture(name) {
    const asset = assets[name];
    if (!asset) return null;
    if (cache[name]) return cache[name];

    const record = { name, source: asset.source, repeat: asset.repeat, status: 'loading' };
    records[name] = record;
    if (localFile) {
      record.status = 'local-safe';
      cache[name] = configureTexture(new THREE.CanvasTexture(makeLocalCanvas(name)), name);
      return cache[name];
    }

    const texture = loader.load(
      asset.source,
      function () {
        record.status = 'loaded';
        texture.needsUpdate = true;
      },
      undefined,
      function () {
        record.status = 'fallback';
      }
    );
    cache[name] = configureTexture(texture, name);
    return texture;
  }

  function getStatus() {
    const entries = Object.values(records);
    return {
      requested: entries.length,
      loaded: entries.filter(function (entry) { return entry.status === 'loaded' || entry.status === 'local-safe'; }).length,
      fallback: entries.filter(function (entry) { return entry.status === 'fallback'; }).length,
      assets: Object.keys(assets).map(function (name) {
        const entry = records[name];
        return { name, status: entry ? entry.status : 'pending' };
      }),
    };
  }

  GY.getThemeTexture = getTexture;
  GY.getThemeTextureStatus = getStatus;
}());
