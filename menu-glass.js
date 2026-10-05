// Vaso escarchado adaptado del ejemplo compartido por el propietario.
// Los valores del ejemplo son fijos: 62 % de escarcha, 21 gotas,
// rastro de 8 px y transparencia del rastro de 16 %.
(() => {
  const frostLevel = 0.62;
  const dropCount = 21;
  const trailWidth = 8;
  const trailTransparency = 0.16;
  const trailLifetime = 3;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobileScreen = window.matchMedia("(max-width: 720px)");

  const activeGlasses = new Map();
  const cachedGlasses = new WeakMap();
  const inactiveGlasses = [];
  const maxInactiveTextures = 8;
  let observedRoot;
  let observer;
  let frameId = 0;
  let lastFrame = 0;
  let elapsed = 0;

  const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver((entries) => {
    for (const entry of entries) {
      const state = activeGlasses.get(entry.target);
      if (!state) continue;
      if (!resizeFrost(state)) continue;
      state.trails = [];
      state.droplets.forEach((drop) => respawn(state, drop, true));
      drawFrost(state);
    }
  });

  function resizeFrost(state) {
    const ratio = Math.min(window.devicePixelRatio || 1, mobileScreen.matches ? 1.25 : 1.5);
    const width = state.canvas.clientWidth;
    const height = state.canvas.clientHeight;
    if (!width || !height) return false;
    const pixelWidth = Math.round(width * ratio);
    const pixelHeight = Math.round(height * ratio);
    if (state.texture && state.width === width && state.height === height &&
      state.canvas.width === pixelWidth && state.canvas.height === pixelHeight) return false;

    state.width = width;
    state.height = height;
    state.canvas.width = pixelWidth;
    state.canvas.height = pixelHeight;
    state.context.setTransform(ratio, 0, 0, ratio, 0, 0);

    state.texture = document.createElement("canvas");
    state.texture.width = state.canvas.width;
    state.texture.height = state.canvas.height;
    const textureContext = state.texture.getContext("2d");
    textureContext.scale(ratio, ratio);

    state.mask = document.createElement("canvas");
    state.mask.width = state.canvas.width;
    state.mask.height = state.canvas.height;
    state.maskContext = state.mask.getContext("2d");
    state.maskContext.scale(ratio, ratio);

    const haze = textureContext.createLinearGradient(0, 0, state.width, 0);
    haze.addColorStop(0, "#e9fbffc4");
    haze.addColorStop(0.16, "#e5faff50");
    haze.addColorStop(0.5, "#e6faff20");
    haze.addColorStop(0.84, "#e5faff60");
    haze.addColorStop(1, "#e9fbffc4");
    textureContext.fillStyle = haze;
    textureContext.fillRect(0, 0, state.width, state.height);

    for (let i = 0; i < 1150; i += 1) {
      const x = Math.random() * state.width;
      const y = Math.random() * state.height;
      const nearEdge = x < 34 || x > state.width - 34;
      textureContext.fillStyle = `rgba(247,255,255,${(nearEdge ? 0.26 : 0.14) + Math.random() * 0.33})`;
      textureContext.beginPath();
      textureContext.arc(x, y, 0.25 + Math.random() * 1.15, 0, Math.PI * 2);
      textureContext.fill();
    }
    return true;
  }

  function respawn(state, drop, spread = false) {
    drop.active = true;
    drop.size = 3.5 + Math.random() * 7;
    drop.x = 7 + Math.random() * Math.max(1, state.width - drop.size - 14);
    drop.y = 65 + (spread ? Math.random() * Math.max(1, state.height - 95) : Math.random() * 16);
    drop.speed = 7 + Math.random() * 12;
    drop.vx = 0;
    drop.turnAt = elapsed + 0.3 + Math.random() * 1.5;
    drop.pauseUntil = 0;
    drop.lastMerged = -10;
    drop.lastTrailAt = elapsed;
    drop.element.style.width = `${drop.size}px`;
    drop.element.style.height = `${drop.size * 1.45}px`;
    drop.element.style.display = "";
    drop.element.style.transform = `translate3d(${drop.x}px, ${drop.y}px, 0)`;
  }

  function makeDrops(state) {
    const fragment = document.createDocumentFragment();
    state.droplets = [];
    for (let i = 0; i < dropCount; i += 1) {
      const element = document.createElement("span");
      element.className = "drop";
      const drop = { element };
      respawn(state, drop, true);
      state.droplets.push(drop);
      fragment.append(element);
    }
    state.drops.replaceChildren(fragment);
  }

  function moveDrops(state, dt) {
    for (const drop of state.droplets) {
      if (!drop.active) {
        if (elapsed >= drop.respawnAt) respawn(state, drop);
        continue;
      }
      if (elapsed < drop.pauseUntil) continue;
      if (elapsed >= drop.turnAt) {
        drop.vx = (Math.random() - 0.5) * 15;
        drop.turnAt = elapsed + 0.6 + Math.random() * 1.6;
        if (Math.random() < 0.2) drop.pauseUntil = elapsed + 0.4 + Math.random() * 1.1;
      }
      drop.x = Math.max(5, Math.min(state.width - drop.size - 5, drop.x + drop.vx * dt));
      drop.y += drop.speed * dt;
      if (drop.y > state.height - drop.size * 1.45 - 5) {
        respawn(state, drop);
        continue;
      }
      drop.element.style.transform = `translate3d(${drop.x.toFixed(1)}px, ${drop.y.toFixed(1)}px, 0)`;
      if (elapsed - drop.lastTrailAt >= 0.12) {
        state.trails.push({ x: drop.x + drop.size / 2, y: drop.y + drop.size, time: elapsed });
        drop.lastTrailAt = elapsed;
      }
    }

    // Las gotas próximas se unen y descienden un poco más rápido.
    for (let i = 0; i < state.droplets.length; i += 1) {
      const a = state.droplets[i];
      if (!a.active || elapsed - a.lastMerged < 0.7) continue;
      for (let j = i + 1; j < state.droplets.length; j += 1) {
        const b = state.droplets[j];
        if (!b.active || elapsed - b.lastMerged < 0.7) continue;
        const dx = Math.abs(a.x + a.size / 2 - b.x - b.size / 2);
        const dy = Math.abs(a.y + a.size * 0.7 - b.y - b.size * 0.7);
        if (dx > (a.size + b.size) * 0.45 || dy > (a.size + b.size) * 0.62) continue;
        const areaA = a.size ** 2;
        const areaB = b.size ** 2;
        a.x = (a.x * areaA + b.x * areaB) / (areaA + areaB);
        a.y = (a.y * areaA + b.y * areaB) / (areaA + areaB);
        a.size = Math.min(19, Math.sqrt(areaA + areaB));
        a.speed = Math.min(57, Math.max(a.speed, b.speed) * 1.32 + 3);
        a.pauseUntil = 0;
        a.lastMerged = elapsed;
        a.element.style.width = `${a.size}px`;
        a.element.style.height = `${a.size * 1.45}px`;
        b.active = false;
        b.element.style.display = "none";
        b.respawnAt = elapsed + 1.5 + Math.random() * 3;
        break;
      }
    }
    state.trails = state.trails.filter((point) => elapsed - point.time < trailLifetime);
  }

  function drawFrost(state) {
    if (!state.texture) return;
    const { context, maskContext, width, height } = state;
    context.clearRect(0, 0, width, height);
    context.globalAlpha = frostLevel;
    context.drawImage(state.texture, 0, 0, width, height);

    maskContext.clearRect(0, 0, width, height);
    maskContext.fillStyle = "#fff";
    for (const point of state.trails) {
      const remaining = 1 - (elapsed - point.time) / trailLifetime;
      if (remaining <= 0) continue;
      maskContext.beginPath();
      maskContext.arc(point.x, point.y, (trailWidth / 2) * remaining, 0, Math.PI * 2);
      maskContext.fill();
    }
    context.globalCompositeOperation = "destination-out";
    context.globalAlpha = trailTransparency;
    context.drawImage(state.mask, 0, 0, width, height);
    context.globalAlpha = 1;
    context.globalCompositeOperation = "source-over";
  }

  function tick(timestamp) {
    if (!activeGlasses.size || reducedMotion.matches || document.hidden) {
      frameId = 0;
      lastFrame = 0;
      return;
    }
    if (timestamp - lastFrame >= (mobileScreen.matches ? 66 : 33)) {
      const dt = lastFrame ? Math.min((timestamp - lastFrame) / 1000, 0.05) : 0;
      lastFrame = timestamp;
      elapsed += dt;
      for (const state of activeGlasses.values()) {
        moveDrops(state, dt);
        drawFrost(state);
      }
    }
    frameId = requestAnimationFrame(tick);
  }

  function start() {
    if (!frameId && activeGlasses.size && !reducedMotion.matches && !document.hidden) {
      lastFrame = 0;
      frameId = requestAnimationFrame(tick);
    }
  }

  function activate(glass) {
    if (mobileScreen.matches) {
      // Mobile: only use the animated WebP beer layer.
      // IntersectionObserver activates it only for cards near the viewport.
      const image = glass.querySelector(".mobile-beer-animation");
      if (!reducedMotion.matches && image && !image.getAttribute("src")) image.src = image.dataset.src;
      glass.classList.add("is-active");
      return;
    }

    const mobileImage = glass.querySelector(".mobile-beer-animation");
    mobileImage?.removeAttribute("src");
    if (activeGlasses.has(glass)) return;
    let state = cachedGlasses.get(glass);
    if (!state) {
      const canvas = glass.querySelector(".frost");
      const context = canvas.getContext("2d");
      if (!context) return;
      state = {
        glass, canvas, context, drops: glass.querySelector(".drops"),
        droplets: [], trails: [], texture: null,
      };
      cachedGlasses.set(glass, state);
    } else {
      const previous = inactiveGlasses.indexOf(state);
      if (previous !== -1) inactiveGlasses.splice(previous, 1);
    }
    if (resizeFrost(state)) {
      state.trails = [];
      if (state.droplets.length) state.droplets.forEach((drop) => respawn(state, drop, true));
      else makeDrops(state);
    } else if (!state.droplets.length) {
      // A hidden glass can have zero size until its first visible frame.
      return;
    }
    drawFrost(state);
    glass.classList.add("is-active");
    activeGlasses.set(glass, state);
    resizeObserver?.observe(glass);
    start();
  }

  function deactivate(glass) {
    const mobileImage = glass.querySelector(".mobile-beer-animation");
    mobileImage?.removeAttribute("src");
    const state = activeGlasses.get(glass);
    if (!state) {
      glass.classList.remove("is-active");
      return;
    }
    glass.classList.remove("is-active");
    resizeObserver?.unobserve(glass);
    state.trails = [];
    activeGlasses.delete(glass);
    inactiveGlasses.push(state);
    if (inactiveGlasses.length > maxInactiveTextures) {
      const oldest = inactiveGlasses.shift();
      oldest.texture = null;
      oldest.mask = null;
      oldest.maskContext = null;
      oldest.canvas.width = 0;
      oldest.canvas.height = 0;
    }
    if (!activeGlasses.size && frameId) {
      cancelAnimationFrame(frameId);
      frameId = 0;
      lastFrame = 0;
    }
  }

  window.setupFrostedMenu = (root) => {
    observer?.disconnect();
    observedRoot?.querySelectorAll(".menu-item").forEach((glass) => deactivate(glass));
    observedRoot = root;
    const glasses = root.querySelectorAll(".menu-item");
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !entry.target.hidden) activate(entry.target);
          else deactivate(entry.target);
        }
      }, { rootMargin: "120px 0px" });
      glasses.forEach((glass) => observer.observe(glass));
    } else {
      glasses.forEach((glass) => { if (!glass.hidden) activate(glass); });
    }
  };

  window.refreshFrostedMenu = (root) => {
    root.querySelectorAll(".menu-item").forEach((glass) => {
      if (glass.hidden) {
        deactivate(glass);
        return;
      }
      if (observer) {
        const bounds = glass.getBoundingClientRect();
        if (bounds.top > window.innerHeight + 120 || bounds.bottom < -120) {
          deactivate(glass);
          return;
        }
      }
      activate(glass);
    });
  };

  window.addEventListener("resize", () => {
    if (resizeObserver) return;
    for (const state of activeGlasses.values()) {
      if (!resizeFrost(state)) continue;
      state.trails = [];
      state.droplets.forEach((drop) => respawn(state, drop, true));
      drawFrost(state);
    }
  });
  document.addEventListener("visibilitychange", start);
  reducedMotion.addEventListener?.("change", () => {
    if (reducedMotion.matches && frameId) {
      cancelAnimationFrame(frameId);
      frameId = 0;
      lastFrame = 0;
    } else start();
  });
  mobileScreen.addEventListener?.("change", () => {
    if (observedRoot) window.setupFrostedMenu(observedRoot);
  });
})();
