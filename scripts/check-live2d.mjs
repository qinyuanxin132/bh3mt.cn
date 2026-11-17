import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve, sep } from "node:path";
const root = resolve("public/live2d/ling");
const config = JSON.parse(await readFile(`${root}/ling.model3.json`, "utf8"));
assert.equal(config.Version, 3);
const refs = config.FileReferences;
const paths = [
  refs.Moc,
  refs.Physics,
  refs.DisplayInfo,
  ...refs.Textures,
  ...refs.Expressions.map((x) => x.File),
  ...Object.values(refs.Motions)
    .flat()
    .map((x) => x.File),
];
let bytes = 0;
for (const file of paths) {
  const path = resolve(root, file);
  assert.ok(
    path.startsWith(root + sep),
    "Model path leaves static asset directory",
  );
  const info = await stat(path);
  assert.ok(
    info.size > 0 && info.size < 100 * 1024 * 1024,
    `${file}: invalid GitHub asset size`,
  );
  if (file.endsWith(".json")) JSON.parse(await readFile(path, "utf8"));
  bytes += info.size;
}
const moc = await readFile(`${root}/${refs.Moc}`);
assert.equal(moc.subarray(0, 4).toString(), "MOC3");
assert.equal(moc[4], 5, "Recheck core compatibility for this model format");
const core = await readFile("public/vendor/live2d/live2dcubismcore.min.js");
assert.equal(
  createHash("sha256").update(core).digest("hex"),
  "25ae938cb4fe282ce189b357bcc97e603d1e1f7ec78bf04150d401c23cdc792f",
  "Core changed: repeat browser compatibility tests",
);
console.log(
  `Live2D: ${paths.length} local references resolve; ${(bytes / 1024 / 1024).toFixed(2)} MiB; model/Core compatibility pinned.`,
);
