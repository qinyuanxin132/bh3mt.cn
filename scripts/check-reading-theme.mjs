import { readFile, readdir } from "node:fs/promises";
import assert from "node:assert/strict";
import { markdownToHtml } from "satteri";
import lingReading from "../src/plugins/satteri-ling-reading.mjs";

let checked = 0;
let decorated = 0;
for (const name of await readdir(
  new URL("../src/content/posts/", import.meta.url),
)) {
  if (!name.endsWith(".md")) continue;
  const source = await readFile(
    new URL(`../src/content/posts/${name}`, import.meta.url),
    "utf8",
  );
  const baseline = (await markdownToHtml(source)).html;
  const result = (
    await markdownToHtml(source, { hastPlugins: [lingReading()] })
  ).html;
  const marks =
    result.match(/<aside class="ling-interlude"[\s\S]*?<\/aside>/g) ?? [];
  // Removing visual bookends must recover the exact original rendered article.
  assert.equal(
    result.replace(/<aside class="ling-interlude"[\s\S]*?<\/aside>/g, ""),
    baseline,
    `${name}: article content changed`,
  );
  assert.ok(marks.length <= 5, `${name}: too many bookends`);
  assert.equal(
    (
      await markdownToHtml(source, {
        hastPlugins: [lingReading(), lingReading()],
      })
    ).html,
    result,
    `${name}: duplicate bookends`,
  );
  if (marks.length) decorated++;
  checked++;
}
assert.ok(decorated > 0, "The decoration plugin did not run.");
console.log(
  `${checked} articles preserve their original HTML; ${decorated} receive OC bookends; repeated application is stable.`,
);
