import { mkdir, copyFile, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
const root = new URL("../", import.meta.url);
const target = new URL("public/vendor/code-lab/", root);
const groups = {
  browsercc: [
    "dist/index.js",
    "dist/clang.js",
    "dist/clang.wasm",
    "dist/lld.js",
    "dist/lld.wasm",
    "dist/sysroot.tar",
    "LICENSE",
  ],
  pyodide: [
    "pyodide.mjs",
    "pyodide.asm.js",
    "pyodide.asm.wasm",
    "python_stdlib.zip",
    "pyodide-lock.json",
  ],
};
const manifest = {};
for (const [name, files] of Object.entries(groups)) {
  const pkg = new URL(`node_modules/${name}/`, root);
  const { version, license } = JSON.parse(
    await readFile(new URL("package.json", pkg), "utf8"),
  );
  const dir = new URL(`${name}-${version}/`, target);
  await mkdir(dir, { recursive: true });
  manifest[name] = { version, license, files: {} };
  for (const file of files) {
    const content = await readFile(new URL(file, pkg));
    const basename = file.split("/").at(-1);
    await copyFile(new URL(file, pkg), new URL(basename, dir));
    manifest[name].files[basename] = {
      bytes: content.length,
      sha256: createHash("sha256").update(content).digest("hex"),
    };
  }
}
await writeFile(
  new URL("manifest.json", target),
  JSON.stringify(manifest, null, 2),
);
console.log(
  `Code lab: pinned Python and C/C++ assets prepared at ${fileURLToPath(target)}`,
);
