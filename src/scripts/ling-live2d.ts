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
  const dialog = document.querySelector<HTMLDialogElement>("#ling-showcase")!;
  const dialogMount = dialog.querySelector<HTMLElement>(
    ".ling-showcase-mount",
  )!;
  const showcaseButton = root.querySelector<HTMLButtonElement>(
    '[data-ling-action="showcase"]',
  )!;
  const expressionButton = root.querySelector<HTMLButtonElement>(
    '[data-ling-action="expression"]',
  )!;
  const zoomOutput =
    root.querySelector<HTMLOutputElement>(".ling-live2d-zoom")!;
  const abort = new AbortController();
  const signal = abort.signal;
  let app: any;
  let model: any;
  let pending: Promise<void> | undefined;
  let open = false;
  let paused = false;
  let disposed = false;
  let automaticCanceled = false;
  let zoom = 1;
  let showcaseZoom = 1;
  let showcasing = false;
  let restoreFocus: HTMLElement | null = null;
  let previousOverflow = "";
  let modelPoint: any;
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
      localStorage.setItem(
        preferenceKey,
        JSON.stringify({ open, position, zoom }),
      );
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
  const applyFloatingSize = () => {
    const mobile = innerWidth <= 760;
    const width = mobile ? 190 : 250;
    const height = mobile ? Math.min(300, innerHeight * 0.55) : 400;
    const effective = Math.min(
      zoom,
      (innerWidth - 16) / width,
      (innerHeight - 100) / height,
    );
    root.style.width = `${width * effective}px`;
    view.style.height = `${height * effective}px`;
    root.dataset.zoom = String(effective);
    zoomOutput.value = `${Math.round(effective * 100)}%`;
  };
  const fit = () => {
    if (!showcasing) applyFloatingSize();
    else zoomOutput.value = `${Math.round(showcaseZoom * 100)}%`;
    if (app && model && open) {
      const { width, height } = view.getBoundingClientRect();
      if (width && height) {
        app.renderer.resize(width, height);
        model.scale.set(
          Math.min(
            width / model.internalModel.width,
            height / model.internalModel.height,
          ) *
            1.12 *
            (showcasing ? showcaseZoom : 1),
        );
        model.anchor.set(0.5, showcasing ? 0.5 : 1);
        model.position.set(width / 2, showcasing ? height / 2 : height - 2);
        app.renderer.render(app.stage);
      }
    }
    if (position && !showcasing) setPosition(position.x, position.y);
  };
  const changeZoom = (next: number) => {
    const current = showcasing ? showcaseZoom : zoom;
    const target = Math.max(0.65, Math.min(showcasing ? 2 : 2.4, next));
    if (Math.abs(target - current) < 0.001) return;
    const box = root.getBoundingClientRect();
    if (showcasing) showcaseZoom = target;
    else zoom = target;
    fit();
    if (position && !showcasing)
      setPosition(box.left, box.bottom - root.getBoundingClientRect().height);
    persist();
  };
  const enterShowcase = () => {
    if (!model || !open || showcasing || disposed) return;
    restoreFocus = document.activeElement as HTMLElement;
    previousOverflow = document.body.style.overflow;
    showcasing = true;
    showcaseZoom = 1;
    root.dataset.showcase = "true";
    showcaseButton.textContent = "返回伴读";
    showcaseButton.title = "退出橱窗";
    view.style.height = "";
    drag.hidden = true;
    dialogMount.append(stage);
    dialog.showModal();
    document.body.style.overflow = "hidden";
    fit();
  };

  // Test the actual drawable meshes, not the transparent canvas rectangle.
  const overModel = (clientX: number, clientY: number) => {
    if (!model || !open || !modelPoint) return false;
    const box = canvas.getBoundingClientRect();
    if (
      clientX < box.left ||
      clientX > box.right ||
      clientY < box.top ||
      clientY > box.bottom
    )
      return false;
    modelPoint.set(clientX - box.left, clientY - box.top);
    model.toModelPosition(modelPoint, modelPoint);
    const x = modelPoint.x,
      y = modelPoint.y;
    const internal = model.internalModel,
      core = internal.coreModel;
    for (let i = core.getDrawableCount() - 1; i >= 0; i--) {
      if (core.getDrawableOpacity(i) < 0.05) continue;
      const bounds = internal.getDrawableBounds(i, {});
      if (
        x < bounds.x ||
        x > bounds.x + bounds.width ||
        y < bounds.y ||
        y > bounds.y + bounds.height
      )
        continue;
      const vertices = internal.getDrawableVertices(i);
      const indices = core.getDrawableVertexIndices(i);
      for (let k = 0; k < indices.length; k += 3) {
        const a = indices[k] * 2,
          b = indices[k + 1] * 2,
          c = indices[k + 2] * 2;
        const side = (u: number, v: number) =>
          (x - vertices[v]) * (vertices[u + 1] - vertices[v + 1]) -
          (vertices[u] - vertices[v]) * (y - vertices[v + 1]);
        const ab = side(a, b),
          bc = side(b, c),
          ca = side(c, a);
        if (
          Math.abs(
            (vertices[b] - vertices[a]) * (vertices[c + 1] - vertices[a + 1]) -
              (vertices[c] - vertices[a]) * (vertices[b + 1] - vertices[a + 1]),
          ) < 0.00001
        )
          continue;
        if (!((ab < 0 || bc < 0 || ca < 0) && (ab > 0 || bc > 0 || ca > 0)))
          return true;
      }
    }
    return false;
  };
  document.addEventListener(
    "wheel",
    (event) => {
      if (
        event.ctrlKey ||
        event.metaKey ||
        event.deltaY === 0 ||
        !event.cancelable ||
        !overModel(event.clientX, event.clientY)
      )
        return;
      if (
        (event.target as Element)?.closest(
          "button,input,textarea,select,summary",
        )
      )
        return;
      event.preventDefault();
      const delta =
        event.deltaY *
        (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
      changeZoom(
        (showcasing ? showcaseZoom : zoom) *
          Math.exp(-Math.max(-160, Math.min(160, delta)) * 0.0015),
      );
    },
    { signal, passive: false, capture: true },
  );
  document.addEventListener(
    "dblclick",
    (event) => {
      if (
        showcasing ||
        (event.target as Element)?.closest(
          "a,button,input,textarea,select,summary,[contenteditable]",
        ) ||
        !overModel(event.clientX, event.clientY)
      )
        return;
      event.preventDefault();
      getSelection()?.removeAllRanges();
      enterShowcase();
    },
    { signal },
  );

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
      modelPoint = new PIXI.Point();
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
    if (showcasing) dialog.close();
    automaticCanceled = true;
    open = false;
    stage.hidden = true;
    launcher.hidden = false;
    launcher.setAttribute("aria-expanded", "false");
    updateRunning();
    persist();
    launcher.focus({ preventScroll: true });
  };
  root
    .querySelector('[data-ling-action="zoom-in"]')!
    .addEventListener(
      "click",
      () => changeZoom((showcasing ? showcaseZoom : zoom) * 1.15),
      { signal },
    );
  root
    .querySelector('[data-ling-action="zoom-out"]')!
    .addEventListener(
      "click",
      () => changeZoom((showcasing ? showcaseZoom : zoom) / 1.15),
      { signal },
    );
  root
    .querySelector('[data-ling-action="zoom-reset"]')!
    .addEventListener("click", () => changeZoom(1), { signal });
  showcaseButton.addEventListener(
    "click",
    () => {
      if (showcasing) dialog.close();
      else enterShowcase();
    },
    { signal },
  );
  dialog
    .querySelector(".ling-showcase-close")!
    .addEventListener("click", () => dialog.close(), { signal });
  dialog.addEventListener(
    "click",
    (event) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      )
        dialog.close();
    },
    { signal },
  );
  dialog.addEventListener(
    "close",
    () => {
      if (!showcasing) return;
      showcasing = false;
      root.dataset.showcase = "false";
      root.insertBefore(stage, launcher);
      drag.hidden = false;
      showcaseButton.textContent = "橱窗 ↗";
      showcaseButton.title = "双击身体也可进入橱窗";
      document.body.style.overflow = previousOverflow;
      fit();
      if (open)
        (restoreFocus?.isConnected && restoreFocus !== document.body
          ? restoreFocus
          : showcaseButton
        ).focus({ preventScroll: true });
    },
    { signal },
  );
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
      const button = expressionButton;
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
      if (!model || !open) return;
      const onBody =
        event.pointerType !== "touch" &&
        overModel(event.clientX, event.clientY);
      canvas.classList.toggle("is-interactive", onBody);
      root.dataset.modelHover = String(onBody);
      if (paused || event.pointerType === "touch") return;
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
      canvas.classList.remove("is-interactive");
      root.dataset.modelHover = "false";
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
    | { open?: boolean; position?: { x: number; y: number }; zoom?: number }
    | undefined;
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
  if (typeof saved?.zoom === "number" && Number.isFinite(saved.zoom))
    zoom = Math.max(0.65, Math.min(2.4, saved.zoom));
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
