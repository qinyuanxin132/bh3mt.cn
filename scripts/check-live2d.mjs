import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve, sep } from "node:path";
const root = resolve("public/live2d/ling-v16");
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
const source = JSON.parse(await readFile(`${root}/SOURCE.json`, "utf8"));
assert.equal(source.version, 16);
for (const [file, hash] of Object.entries(source.originalSHA256)) {
  assert.equal(
    createHash("sha256")
      .update(await readFile(resolve(root, file)))
      .digest("hex"),
    hash,
    `${file}: original v16 resource changed`,
  );
}
const { lingPresets, lingLimits, lingActions } =
  await import("../src/data/ling-live2d.ts");
assert.equal(lingPresets.length, 6);
assert.equal(lingActions.length, 8);
for (const preset of lingPresets) assert.ok(refs.Motions[preset.group]?.length);
for (const action of lingActions) assert.ok(refs.Motions[action.group]?.length);
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
  if (file.endsWith(".json")) {
    const data = JSON.parse(await readFile(path, "utf8"));
    if (file.endsWith(".motion3.json")) {
      let points = 0,
        segments = 0;
      for (const curve of data.Curves) {
        const values = [curve.Segments[1]];
        points++;
        for (let i = 2; i < curve.Segments.length;) {
          const count = curve.Segments[i] === 1 ? 7 : 3;
          for (let j = i + 2; j < i + count; j += 2)
            values.push(curve.Segments[j]);
          segments++;
          points += count === 7 ? 3 : 1;
          i += count;
        }
        if (lingLimits[curve.Id]) {
          const [min, max] = lingLimits[curve.Id];
          assert.ok(
            values.every(
              (value) => Number.isFinite(value) && value >= min && value <= max,
            ),
            `${file}: ${curve.Id} exceeds web limits`,
          );
        }
      }
      assert.equal(points, data.Meta.TotalPointCount);
      assert.equal(segments, data.Meta.TotalSegmentCount);
      assert.equal(data.Curves.length, data.Meta.CurveCount);
    }
  }
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
