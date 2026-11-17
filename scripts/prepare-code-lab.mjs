import { mkdir, copyFile, readFile, writeFile, rm } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
const root = new URL("../", import.meta.url);
const target = new URL("public/vendor/code-lab/", root);
await rm(target, { recursive: true, force: true });
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
groups["@browserrun/go"] = ["yaegi.wasm", "LICENSE"];
groups["@browserrun/java"] = [
  "compiler.wasm",
  "compiler.wasm-runtime.js",
  "compile-classlib-teavm.bin",
  "runtime-classlib-teavm.bin",
  "LICENSE",
  "NOTICE.md",
];
groups["sql.js"] = ["dist/sql-wasm.js", "dist/sql-wasm.wasm", "LICENSE"];
groups["wasmoon"] = ["dist/index.js", "dist/glue.wasm", "LICENSE"];
groups["@php-wasm/web-8-4"] = [
  "asyncify/php_8_4.js",
  "asyncify/8_4_27/php_8_4.wasm",
  "LICENSE",
];
groups["@takahashim/mruby-wasm-js"] = [
  "index.js",
  "_memory.js",
  "debug.js",
  "wasi-preview1.js",
  "mruby-js.wasm",
  "LICENSE",
];
groups["@php-wasm/universal"] = ["LICENSE"];
groups["sucrase"] = ["LICENSE"];
const manifest = {};
for (const [name, files] of Object.entries(groups)) {
  const pkg = new URL(`node_modules/${name}/`, root);
  const { version, license } = JSON.parse(
    await readFile(new URL("package.json", pkg), "utf8"),
  );
  const dir = new URL(
    `${name.replace("@", "").replaceAll("/", "-")}-${version}/`,
    target,
  );
  await mkdir(dir, { recursive: true });
  manifest[name] = { version, license, files: {} };
  for (const file of files) {
    const content = await readFile(new URL(file, pkg));
    const basename =
      name === "@php-wasm/web-8-4"
        ? file.replace(/^asyncify\//, "")
        : file.split("/").at(-1);
    await mkdir(new URL("./", new URL(basename, dir)), { recursive: true });
    await copyFile(new URL(file, pkg), new URL(basename, dir));
    manifest[name].files[basename] = {
      bytes: content.length,
      sha256: createHash("sha256").update(content).digest("hex"),
    };
  }
}
const sqlDir = new URL(`sql.js-${manifest["sql.js"].version}/`, target);
const sqlModule =
  "let module;\n" +
  (await readFile(new URL("sql-wasm.js", sqlDir), "utf8")) +
  "\nexport default initSqlJs;\n";
await writeFile(new URL("sql-wasm.mjs", sqlDir), sqlModule);
manifest["sql.js"].files["sql-wasm.mjs"] = {
  bytes: Buffer.byteLength(sqlModule),
  sha256: createHash("sha256").update(sqlModule).digest("hex"),
};
await writeFile(
  new URL("manifest.json", target),
  JSON.stringify(manifest, null, 2),
);
console.log(
  `Code lab: pinned browser language runtimes prepared at ${fileURLToPath(target)}`,
);
