const { chromium } = require("playwright-core");
const assert = require("node:assert/strict");
const path = require("node:path");
const os = require("node:os");
(async () => {
  const { lingPresets, lingActions, lingLimits } =
    await import("../src/data/ling-live2d.ts");
  const b = await chromium.launch({
    executablePath:
      process.env.CHROMIUM_PATH || "/usr/bin/google-chrome-stable",
    headless: true,
    args: [
      "--no-sandbox",
      "--enable-unsafe-swiftshader",
      "--use-angle=swiftshader",
    ],
  });
  try {
    const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [],
      bad = [];
    p.on("pageerror", (e) => errors.push(e.message));
    p.on("response", (r) => {
      if (r.status() >= 400) bad.push(`${r.status()} ${r.url()}`);
    });
    await p.route("**/live2dcubismcore.min.js", async (route) => {
      const response = await route.fetch();
      await route.fulfill({
        response,
        body:
          (await response.text()) +
          `
 ;(()=>{const C=window.Live2DCubismCore,original=C.Model.fromMoc;
 C.Model.fromMoc=function(...args){const model=original.apply(this,args);const audit=window.__lingAudit={frames:0,badVertices:false,min:{},max:{},delta:{},last:{}};
 const update=model.update.bind(model);model.update=function(){
 const p=model.parameters;audit.frames++;
 p.ids.forEach((id,i)=>{const value=p.values[i];audit.min[id]=Math.min(audit.min[id]??value,value);audit.max[id]=Math.max(audit.max[id]??value,value);if(audit.last[id]!==undefined)audit.delta[id]=Math.max(audit.delta[id]??0,Math.abs(value-audit.last[id]));audit.last[id]=value;});
 update();if(audit.frames%30===0)for(const vertices of model.drawables.vertexPositions)for(const value of vertices)if(!Number.isFinite(value))audit.badVertices=true;
 };return model;};})();`,
      });
    });
    await p.goto(process.env.URL || "http://localhost:4322/");
    await p.waitForSelector('.ling-live2d[data-state="ready"]', {
      timeout: 60000,
    });
    assert.equal(
      await p.locator(".ling-live2d").getAttribute("data-model-version"),
      "16",
    );
    const settings = p.locator(".ling-live2d-settings");
    await settings.locator("summary").click();
    for (const preset of lingPresets) {
      await p.locator(".ling-live2d-preset").selectOption(preset.id);
      await p.waitForTimeout(1400);
      assert.ok(
        (await p.locator(".ling-live2d-action-status").innerText()).includes(
          preset.label,
        ),
      );
    }
    const canvasBox = await p.locator("canvas").boundingBox();
    await p.mouse.move(
      canvasBox.x + canvasBox.width / 2,
      canvasBox.y + canvasBox.height * 0.4,
    );
    await p.mouse.wheel(0, -120);
    await p.waitForTimeout(150);
    assert.ok(
      Number(await p.locator(".ling-live2d").getAttribute("data-zoom")) > 1,
    );
    await p.locator('[data-ling-action="zoom-reset"]').click();
    const dragBox = await p.locator(".ling-live2d-drag").boundingBox();
    await p.mouse.move(
      dragBox.x + dragBox.width / 2,
      dragBox.y + dragBox.height / 2,
    );
    await p.mouse.down();
    await p.mouse.move(1410, 650, { steps: 8 });
    await p.mouse.up();
    const movedPanel = await p
      .locator(".ling-live2d-settings-panel")
      .boundingBox();
    assert.ok(movedPanel.x >= 0 && movedPanel.x + movedPanel.width <= 1440);
    console.log("6 presets switched and persisted");
    for (const action of lingActions) {
      await p.locator(".ling-live2d-action").selectOption(action.group);
      await p.locator('[data-ling-action="play"]').click();
      await p.waitForTimeout(1600);
      assert.ok(
        (await p.locator(".ling-live2d-action-status").innerText()).includes(
          action.label,
        ),
      );
    }
    console.log("8 gentle actions exercised");
    await p.locator(".ling-live2d-preset").selectOption("reading");
    await p.waitForTimeout(1000);
    await p.locator(".ling-live2d-action").selectOption("TapHead");
    await p.locator('[data-ling-action="play"]').click();
    await p.waitForTimeout(4300);
    let audit = await p.evaluate(() => window.__lingAudit);
    assert.ok(
      audit.last.ParamAngleY < -0.7,
      "action should return to reading idle",
    );
    await settings.locator("summary").click();
    await p.locator('[data-ling-action="pause"]').click();
    const frame = await p.locator("canvas").screenshot();
    await p.waitForTimeout(400);
    assert.ok(
      frame.equals(await p.locator("canvas").screenshot()),
      "pause should freeze actual rendered image",
    );
    await p.locator('[data-ling-action="pause"]').click();
    await p.locator('[data-ling-action="showcase"]').click();
    assert.equal(
      await p.locator("#ling-showcase").evaluate((e) => e.open),
      true,
    );
    for (let i = 0; i < 5; i++)
      await p.locator('[data-ling-action="zoom-in"]').click();
    await p.waitForTimeout(400);
    await p.screenshot({
      path: path.join(os.tmpdir(), "ling-v16-showcase.png"),
    });
    await p.keyboard.press("Escape");
    await p.waitForTimeout(100);
    // Finish one complete 36s idle cycle and verify automatic restart after its end.
    const firstFrames = (await p.evaluate(() => window.__lingAudit)).frames;
    await p.waitForTimeout(38000);
    audit = await p.evaluate(() => window.__lingAudit);
    assert.ok(audit.frames > firstFrames + 100);
    assert.equal(audit.badVertices, false);
    for (const [id, [min, max, rate]] of Object.entries(lingLimits)) {
      assert.ok(
        audit.min[id] >= min - 1e-6 && audit.max[id] <= max + 1e-6,
        `${id}: rendered range ${audit.min[id]}..${audit.max[id]}`,
      );
      assert.ok(
        (audit.delta[id] ?? 0) <= rate * 0.05 + 1e-5,
        `${id}: transition changed too fast ${audit.delta[id]}`,
      );
    }
    console.log(
      "full idle cycle, returning from action, finite vertices, frame limits and transition rates passed",
      audit.frames,
      "frames",
    );
    await p.reload();
    await p.waitForSelector('.ling-live2d[data-state="ready"]', {
      timeout: 60000,
    });
    assert.equal(
      await p.locator(".ling-live2d").getAttribute("data-preset"),
      "reading",
    );
    await p.locator('[data-ling-action="close"]').click();
    await p.reload();
    await p.waitForTimeout(800);
    assert.equal(await p.locator(".ling-live2d-stage").isVisible(), false);
    const mobile = await b.newPage({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    mobile.on("pageerror", (e) => errors.push(e.message));
    await mobile.goto(process.env.URL || "http://localhost:4322/");
    await mobile.locator(".ling-live2d-launcher").click();
    await mobile.waitForSelector('.ling-live2d[data-state="ready"]', {
      timeout: 60000,
    });
    await mobile.locator(".ling-live2d-settings summary").click();
    const panel = await mobile
      .locator(".ling-live2d-settings-panel")
      .boundingBox();
    assert.ok(panel.x >= 0 && panel.x + panel.width <= 390);
    await mobile.locator(".ling-live2d-preset").selectOption("rest");
    await mobile.locator('[data-ling-action="showcase"]').click();
    await mobile.locator(".ling-live2d-preset").selectOption("greet");
    await mobile.waitForTimeout(1000);
    await mobile.screenshot({
      path: path.join(os.tmpdir(), "ling-v16-mobile.png"),
    });
    await mobile.locator(".ling-showcase-close").click();
    await mobile.waitForTimeout(100);
    assert.equal(await mobile.locator(".ling-live2d canvas").count(), 1);
    assert.equal(
      await mobile.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    assert.deepEqual(errors, []);
    assert.deepEqual(bad, []);
    console.log(
      "PASS: v16, presets, actions, gentle rendered parameters, pause, face showcase, persistence and mobile; no page errors or missing assets",
    );
  } finally {
    await b.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
