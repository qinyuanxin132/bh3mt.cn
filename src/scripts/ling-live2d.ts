const preferenceKey = "bh3mt:ling-live2d:v1";
let corePromise: Promise<void> | undefined;

function loadCore(base: string) {
  if ((window as any).Live2DCubismCore) return Promise.resolve();
  if (!corePromise)
    corePromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `${base}vendor/live2d/live2dcubismcore.min.js`;
      script.async = true;
      const timeout = window.setTimeout(
        () => fail(new Error("Cubism Core load timed out")),
        20000,
      );
      const fail = (error: Error) => {
        clearTimeout(timeout);
        script.remove();
        corePromise = undefined;
        reject(error);
      };
      script.onload = () => {
        clearTimeout(timeout);
        if ((window as any).Live2DCubismCore) resolve();
        else fail(new Error("Cubism Core unavailable"));
      };
      script.onerror = () => fail(new Error("Cubism Core failed to load"));
      document.head.append(script);
    });
  return corePromise;
}

export function initLingLive2D() {
  const root = document.querySelector<HTMLElement>(".ling-live2d");
  if (!root || root.dataset.initialized) return;
  root.dataset.initialized = "true";
  const base = root.dataset.base ?? "/";
  const stage = root.querySelector<HTMLElement>(".ling-live2d-stage")!;
  const view = root.querySelector<HTMLElement>(".ling-live2d-view")!;
  const canvas = root.querySelector<HTMLCanvasElement>("canvas")!;
  const poster = root.querySelector<HTMLImageElement>(".ling-live2d-poster")!;
  const notice = root.querySelector<HTMLElement>(".ling-live2d-notice")!;
  const launcher = root.querySelector<HTMLButtonElement>(
    ".ling-live2d-launcher",
  )!;
  const retry = root.querySelector<HTMLButtonElement>(".ling-live2d-retry")!;
  const pause = root.querySelector<HTMLButtonElement>(
    '[data-ling-action="pause"]',
  )!;
  const drag = root.querySelector<HTMLButtonElement>(".ling-live2d-drag")!;
  const abort = new AbortController();
  const signal = abort.signal;
  let app: any;
  let model: any;
  let pending: Promise<void> | undefined;
  let open = false;
  let paused = false;
  let disposed = false;
  let automaticCanceled = false;
  let interactionIndex = 0;
  let expressionIndex = -1;
  let lastInteraction = 0;
  let pointerTarget = { x: 0, y: 0 };
  let position: { x: number; y: number } | undefined;
  let dragging:
    { id: number; x: number; y: number; left: number; top: number } | undefined;
  const motions = [
    "TapHead",
    "TapEarLeft",
    "TapEarRight",
    "TapEyeLeft",
    "TapEyeRight",
  ];
  const expressions = ["微笑", "惊讶", "难过", "生气"];
  const actionButtons = root.querySelectorAll<HTMLButtonElement>(
    '[data-ling-action]:not([data-ling-action="close"])',
  );

  const persist = () => {
    try {
      localStorage.setItem(preferenceKey, JSON.stringify({ open, position }));
    } catch {
      /* Storage may be disabled. */
    }
  };
  const setPosition = (x: number, y: number) => {
    const rect = root.getBoundingClientRect();
    position = {
      x: Math.max(0, Math.min(innerWidth - rect.width, x)),
      y: Math.max(0, Math.min(innerHeight - rect.height, y)),
    };
    root.style.left = `${position.x}px`;
    root.style.top = `${position.y}px`;
    root.style.bottom = "auto";
  };
  const fit = () => {
    if (app && model && open) {
      const { width, height } = view.getBoundingClientRect();
      if (width && height) {
        app.renderer.resize(width, height);
        model.scale.set(
          Math.min(
            width / model.internalModel.width,
            height / model.internalModel.height,
          ) * 1.12,
        );
        model.anchor.set(0.5, 1);
        model.position.set(width / 2, height - 2);
        app.renderer.render(app.stage);
      }
    }
    if (position) setPosition(position.x, position.y);
  };
  const updateRunning = () => {
    if (!app) return;
    if (open && !paused && !document.hidden && !disposed) app.start();
    else app.stop();
  };
  const interact = (group?: string) => {
    if (!model || paused || !open || performance.now() - lastInteraction < 600)
      return;
    lastInteraction = performance.now();
    const motion = group ?? motions[interactionIndex++ % motions.length];
    model
      .motion(motion, 0, 3)
      .catch((error: unknown) => console.warn("Ling motion failed", error));
  };
  const create = async () => {
    root.dataset.state = "loading";
    poster.hidden = false;
    notice.hidden = false;
    notice.textContent = "泠正在过来…";
    retry.hidden = true;
    try {
      await loadCore(base);
      const PIXI = await import("pixi.js");
      const { Live2DModel } = await import("pixi-live2d-display/cubism4");
      if (disposed) return;
      Live2DModel.registerTicker(PIXI.Ticker);
      app = new PIXI.Application({
        view: canvas,
        width: 200,
        height: 330,
        backgroundAlpha: 0,
        antialias: true,
        autoDensity: true,
        resolution: Math.min(devicePixelRatio || 1, 1.5),
        autoStart: false,
        sharedTicker: false,
      });
      app.ticker.maxFPS = 30;
      const loaded = await Live2DModel.from(
        `${base}live2d/ling/ling.model3.json`,
        { autoInteract: false, autoUpdate: false },
      );
      if (disposed) {
        loaded.destroy();
        return;
      }
      model = loaded;
      app.stage.addChild(model);
      // EX's MouseTracking controls are app-specific; reproduce their gentle range on the web.
      model.internalModel.on("beforeModelUpdate", () => {
        const core = model.internalModel.coreModel;
        for (const [id, limit] of [
          ["ParamAngleX", 12],
          ["ParamEyeBallX", 0.65],
          ["ParamEyeBallY", 0.45],
        ] as const) {
          core.setParameterValueById(
            id,
            Math.max(-limit, Math.min(limit, core.getParameterValueById(id))),
          );
        }
      });
      app.ticker.add(
        () => {
          model.internalModel.focusController.focus(
            pointerTarget.x,
            pointerTarget.y,
          );
          model.update(Math.min(app.ticker.deltaMS, 50));
        },
        undefined,
        PIXI.UPDATE_PRIORITY.HIGH,
      );
      root.dataset.state = "ready";
      poster.hidden = true;
      notice.hidden = true;
      actionButtons.forEach((button) => (button.disabled = false));
      fit();
      model.update(0);
      app.renderer.render(app.stage);
      updateRunning();
    } catch (error) {
      console.warn("Ling Live2D could not start", error);
      model = undefined;
      if (app) {
        app.destroy(false, {
          children: true,
          texture: true,
          baseTexture: true,
        });
        app = undefined;
      }
      if (disposed) return;
      root.dataset.state = "error";
      notice.textContent = "泠还没能出来，再试一次吧。";
      poster.hidden = false;
      notice.hidden = false;
      retry.hidden = false;
      actionButtons.forEach((button) => (button.disabled = true));
    }
  };
  const show = async (remember = true) => {
    if (remember) automaticCanceled = true;
    open = true;
    stage.hidden = false;
    launcher.hidden = true;
    launcher.setAttribute("aria-expanded", "true");
    if (position) setPosition(position.x, position.y);
    if (remember) persist();
    if (!model && !pending)
      pending = create().finally(() => {
        pending = undefined;
      });
    if (pending) await pending;
    fit();
    updateRunning();
  };
  const hide = () => {
    automaticCanceled = true;
    open = false;
    stage.hidden = true;
    launcher.hidden = false;
    launcher.setAttribute("aria-expanded", "false");
    updateRunning();
    persist();
    launcher.focus({ preventScroll: true });
  };
  launcher.addEventListener(
    "click",
    () => {
      void show();
    },
    { signal },
  );
  retry.addEventListener(
    "click",
    () => {
      void show();
    },
    { signal },
  );
  root
    .querySelector('[data-ling-action="close"]')!
    .addEventListener("click", hide, { signal });
  root
    .querySelector('[data-ling-action="motion"]')!
    .addEventListener("click", () => interact(), { signal });
  root.querySelector('[data-ling-action="expression"]')!.addEventListener(
    "click",
    () => {
      if (!model) return;
      expressionIndex = (expressionIndex + 1) % (expressions.length + 1);
      const button = root.querySelector<HTMLButtonElement>(
        '[data-ling-action="expression"]',
      )!;
      if (expressionIndex === expressions.length) {
        model.internalModel.motionManager.expressionManager.resetExpression();
        button.textContent = "表情";
      } else {
        model
          .expression(expressions[expressionIndex])
          .catch((error: unknown) =>
            console.warn("Ling expression failed", error),
          );
        button.textContent = expressions[expressionIndex];
      }
      if (paused) {
        model.update(16);
        app.renderer.render(app.stage);
      }
    },
    { signal },
  );
  pause.addEventListener(
    "click",
    () => {
      paused = !paused;
      pause.textContent = paused ? "继续" : "暂停";
      pause.title = paused ? "继续动作" : "暂停动作";
      pause.setAttribute("aria-pressed", String(paused));
      updateRunning();
    },
    { signal },
  );
  document.addEventListener(
    "pointermove",
    (event) => {
      if (!model || !open || paused || event.pointerType === "touch") return;
      const box = canvas.getBoundingClientRect();
      pointerTarget = {
        x: Math.max(
          -0.4,
          Math.min(
            0.4,
            ((event.clientX - (box.left + box.width / 2)) / innerWidth) * 0.8,
          ),
        ),
        y: Math.max(
          -0.25,
          Math.min(
            0.25,
            ((box.top + box.height * 0.28 - event.clientY) / innerHeight) * 0.6,
          ),
        ),
      };
    },
    { signal, passive: true },
  );
  document.addEventListener(
    "pointerleave",
    () => {
      pointerTarget = { x: 0, y: 0 };
    },
    { signal },
  );
  document.addEventListener(
    "pointerdown",
    (event) => {
      if (
        !model ||
        !open ||
        paused ||
        (event.target as Element)?.closest(
          "a,button,input,textarea,select,summary,[contenteditable]",
        )
      )
        return;
      const rect = canvas.getBoundingClientRect();
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      )
        return;
      const hits = model.hitTest(
        event.clientX - rect.left,
        event.clientY - rect.top,
      );
      const hitMotions: Record<string, string> = {
        Head: "TapHead",
        EarLeft: "TapEarLeft",
        EarRight: "TapEarRight",
        EyeLeft: "TapEyeLeft",
        EyeRight: "TapEyeRight",
      };
      const hit = ["EyeLeft", "EyeRight", "EarLeft", "EarRight", "Head"].find(
        (name) => hits.includes(name),
      );
      if (hit) interact(hitMotions[hit]);
    },
    { signal, passive: true },
  );
  drag.addEventListener(
    "pointerdown",
    (event) => {
      if (event.button !== 0) return;
      const box = root.getBoundingClientRect();
      dragging = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        left: box.left,
        top: box.top,
      };
      drag.setPointerCapture(event.pointerId);
      event.preventDefault();
    },
    { signal },
  );
  drag.addEventListener(
    "pointermove",
    (event) => {
      if (dragging?.id === event.pointerId)
        setPosition(
          dragging.left + event.clientX - dragging.x,
          dragging.top + event.clientY - dragging.y,
        );
    },
    { signal },
  );
  const endDrag = () => {
    dragging = undefined;
    persist();
  };
  drag.addEventListener("pointerup", endDrag, { signal });
  drag.addEventListener("pointercancel", endDrag, { signal });
  drag.addEventListener(
    "keydown",
    (event) => {
      const offsets: Record<string, [number, number]> = {
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
      };
      if (!offsets[event.key]) return;
      event.preventDefault();
      const box = root.getBoundingClientRect();
      const [x, y] = offsets[event.key];
      setPosition(
        box.left + x * (event.shiftKey ? 40 : 10),
        box.top + y * (event.shiftKey ? 40 : 10),
      );
      persist();
    },
    { signal },
  );
  const resize = new ResizeObserver(fit);
  resize.observe(view);
  window.addEventListener("resize", fit, { signal, passive: true });
  document.addEventListener("visibilitychange", updateRunning, { signal });
  window.addEventListener(
    "pagehide",
    (event) => {
      app?.stop();
      if (event.persisted) return;
      disposed = true;
      abort.abort();
      resize.disconnect();
      app?.destroy(false, { children: true, texture: true, baseTexture: true });
      app = undefined;
      model = undefined;
    },
    { signal },
  );
  window.addEventListener("pageshow", updateRunning, { signal });
  let saved:
    { open?: boolean; position?: { x: number; y: number } } | undefined;
  try {
    saved =
      JSON.parse(localStorage.getItem(preferenceKey) ?? "null") ?? undefined;
  } catch {
    /* Defaults work without storage. */
  }
  if (
    Number.isFinite(saved?.position?.x) &&
    Number.isFinite(saved?.position?.y)
  )
    position = saved!.position;
  const automatic =
    matchMedia("(min-width: 1280px) and (hover: hover) and (pointer: fine)")
      .matches &&
    !matchMedia("(prefers-reduced-motion: reduce)").matches &&
    !(navigator as any).connection?.saveData;
  if (saved?.open === true || (saved?.open !== false && automatic)) {
    const start = () => {
      if (!disposed && !open && !automaticCanceled) void show(false);
    };
    if ("requestIdleCallback" in window)
      window.requestIdleCallback(start, { timeout: 1800 });
    else setTimeout(start, 600);
  }
}
