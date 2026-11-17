import inputSource from "../runtime/java/Input.java?raw";
import scannerSource from "../runtime/java/Scanner.java?raw";
import {
  WASI,
  File,
  OpenFile,
  ConsoleStdout,
  PreopenDirectory,
} from "@bjorn3/browser_wasi_shim";
export async function runExtra(
  job: { language: string; source: string; stdin: string; base: string },
  output: (s: string) => void,
  phase: (s: string, t: string) => void,
) {
  const asset = (path: string) =>
    new URL(`vendor/code-lab/${path}`, job.base).href;
  const decoder = new TextDecoder();
  const start = () => phase("running", `${job.language.toUpperCase()} 运行中…`);
  const makeWasi = (
    args: string[],
    files = new Map<string, any>(),
    preopen = ".",
  ) =>
    new WASI(
      args,
      [],
      [
        new OpenFile(new File(new TextEncoder().encode(job.stdin))),
        new ConsoleStdout((bytes) =>
          output(decoder.decode(bytes, { stream: true })),
        ),
        new ConsoleStdout((bytes) =>
          output(decoder.decode(bytes, { stream: true })),
        ),
        new PreopenDirectory(preopen, files),
      ],
    );
  phase("loading", "正在准备运行环境…");
  if (job.language === "javascript" || job.language === "typescript") {
    let source = job.source;
    if (job.language === "typescript") {
      const { transform } = await import("sucrase");
      source = transform(source, {
        transforms: ["typescript"],
        filePath: "main.ts",
      }).code;
    }
    const format = (value: any) =>
      typeof value === "string"
        ? value
        : value === undefined
          ? "undefined"
          : typeof value === "bigint"
            ? `${value}n`
            : (() => {
                try {
                  return JSON.stringify(value, null, 2) ?? String(value);
                } catch {
                  return String(value);
                }
              })();
    for (const method of [
      "log",
      "info",
      "warn",
      "error",
      "debug",
      "dir",
    ] as const)
      console[method] = (...args: any[]) =>
        output(args.map(format).join(" ") + "\n");
    let offset = 0;
    const lines = job.stdin.match(/[^\n]*\n|[^\n]+$/g) ?? [];
    const readline = () =>
      offset < lines.length ? lines[offset++].replace(/\r?\n$/, "") : null;
    const AsyncFunction = Object.getPrototypeOf(
      async function () {},
    ).constructor;
    // Keep ordinary timer callbacks alive until they complete or the page's time limit stops us.
    const nativeSetTimeout = self.setTimeout.bind(self),
      nativeSetInterval = self.setInterval.bind(self);
    const nativeClear = self.clearTimeout.bind(self);
    const pending = new Set<number>();
    let mainReturned = false;
    let resolveIdle: () => void, rejectIdle: (e: unknown) => void;
    const idle = new Promise<void>((resolve, reject) => {
      resolveIdle = resolve;
      rejectIdle = reject;
    });
    const checkIdle = () =>
      queueMicrotask(() => {
        if (mainReturned && !pending.size) resolveIdle();
      });
    const schedule = (
      repeat: boolean,
      handler: any,
      delay?: number,
      ...args: any[]
    ) => {
      const id = (repeat ? nativeSetInterval : nativeSetTimeout)(() => {
        if (!repeat) pending.delete(id);
        try {
          if (typeof handler === "function") handler(...args);
          else new Function(String(handler))();
        } catch (error) {
          rejectIdle(error);
        } finally {
          checkIdle();
        }
      }, delay);
      pending.add(id);
      return id;
    };
    self.setTimeout = ((handler: any, delay?: number, ...args: any[]) =>
      schedule(false, handler, delay, ...args)) as any;
    self.setInterval = ((handler: any, delay?: number, ...args: any[]) =>
      schedule(true, handler, delay, ...args)) as any;
    self.clearTimeout = self.clearInterval = ((id?: number) => {
      nativeClear(id);
      if (id !== undefined) pending.delete(id);
      checkIdle();
    }) as any;
    start();
    await new AsyncFunction(
      "stdin",
      "readline",
      "print",
      source +
        "\n//# sourceURL=main." +
        (job.language === "typescript" ? "ts" : "js"),
    )(job.stdin, readline, (...args: any[]) => console.log(...args));
    mainReturned = true;
    checkIdle();
    await idle;
    return 0;
  }
  if (job.language === "go") {
    const module = await WebAssembly.compileStreaming(
      fetch(asset("browserrun-go-0.1.0/yaegi.wasm")),
    );
    const wasi = makeWasi(
      ["yaegi", "run", "/w/main.go"],
      new Map([["main.go", new File(new TextEncoder().encode(job.source))]]),
      "/w",
    );
    const instance = await WebAssembly.instantiate(module, {
      wasi_snapshot_preview1: wasi.wasiImport,
    });
    start();
    return wasi.start(instance as any);
  }
  if (job.language === "java") {
    const base = asset("browserrun-java-0.1.0/");
    const { load } = await import(
      /* @vite-ignore */ `${base}compiler.wasm-runtime.js`
    );
    const [lib, sdk, classlib] = await Promise.all([
      load(`${base}compiler.wasm`),
      fetch(`${base}compile-classlib-teavm.bin`).then((r) => r.arrayBuffer()),
      fetch(`${base}runtime-classlib-teavm.bin`).then((r) => r.arrayBuffer()),
    ]);
    const compiler = lib.exports.createCompiler();
    compiler.setSdk(new Int8Array(sdk));
    compiler.setTeaVMClasslib(new Int8Array(classlib));
    compiler.onDiagnostic((d: any) => {
      if (d.severity === "error" || d.severity === "warning")
        output(
          `${d.fileName ?? "Main.java"}:${d.lineNumber}: ${d.severity}: ${d.message}\n`,
        );
    });
    const className =
      /public\s+(?:(?:final|abstract)\s+)*class\s+(\w+)/.exec(
        job.source,
      )?.[1] ?? "Main";
    const inputLiteral = JSON.stringify(job.stdin).replace(/\\u0000/g, "\\0");
    // Route System.in through a UTF-8 in-memory stream; leave strings and comments intact.
    let javaSource = job.source.replace(
      /("""[\s\S]*?"""|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\/\/[^\n]*|\/\*[\s\S]*?\*\/)|\b(?:java\s*\.\s*lang\s*\.\s*)?System\s*\.\s*in\b|\bjava\s*\.\s*util\s*\.\s*Scanner\b/g,
      (match, literal) =>
        literal
          ? match
          : /Scanner$/.test(match)
            ? "lab.runtime.Scanner"
            : "lab.runtime.Input.stream",
    );
    if (/\bScanner\b/.test(job.source)) {
      const packageDecl = /^\s*package\s+[\w.]+\s*;/m.exec(javaSource);
      const at = packageDecl ? packageDecl.index + packageDecl[0].length : 0;
      javaSource =
        javaSource.slice(0, at) +
        "\nimport lab.runtime.Scanner;\n" +
        javaSource.slice(at);
    }
    compiler.addSourceFile(`${className}.java`, javaSource);
    compiler.addSourceFile(
      "Input.java",
      inputSource.replace("__LAB_INPUT__", inputLiteral),
    );
    if (/\bScanner\b/.test(job.source))
      compiler.addSourceFile("Scanner.java", scannerSource);
    phase("compiling", "正在编译 Java…");
    if (!compiler.compile()) return 1;
    const mainClass = compiler.detectMainClasses()[0]?.replaceAll("/", ".");
    if (!mainClass) throw new Error("未找到包含 main 方法的 Java 类。");
    if (
      !compiler.generateWebAssembly({
        outputName: "app",
        mainClass,
      })
    )
      return 1;
    const app = await load(compiler.getWebAssemblyOutputFile("app.wasm"), {
      installImports(imports: any) {
        imports.teavmConsole = {
          putcharStdout: (ch: number) => output(String.fromCharCode(ch)),
          putcharStderr: (ch: number) => output(String.fromCharCode(ch)),
        };
      },
    });
    start();
    app.exports.main([]);
    return 0;
  }
  if (job.language === "ruby") {
    const base = asset("takahashim-mruby-wasm-js-0.2.0/");
    const { createVM } = await import(/* @vite-ignore */ `${base}index.js`);
    const wasi = makeWasi(["mruby"]);
    const vm = await createVM({
      wasm: `${base}mruby-js.wasm`,
      wasi: wasi.wasiImport,
      onStart: (instance: any) => wasi.initialize(instance),
    });
    start();
    vm.eval(job.source, { filename: "main.rb" });
    return 0;
  }
  if (job.language === "lua") {
    const base = asset("wasmoon-1.16.0/");
    await import(/* @vite-ignore */ `${base}index.js`);
    const factory = new (globalThis as any).wasmoon.LuaFactory(
      `${base}glue.wasm`,
    );
    await factory.mountFile("/lab-stdin", new TextEncoder().encode(job.stdin));
    const lua = await factory.createEngine();
    lua.global.set("__lab_write", output);
    await lua.doString(`
      io.input('/lab-stdin')
      local old_write = getmetatable(io.stdout).__index.write
      getmetatable(io.stdout).__index.write = function(file, ...)
        if file == io.stdout or file == io.stderr then
          for i=1,select('#', ...) do __lab_write(tostring(select(i, ...))) end
          return file
        end
        return old_write(file, ...)
      end
      io.write = function(...) return io.stdout:write(...) end
      print = function(...)
        local values = {}
        for i=1,select('#', ...) do values[i] = tostring(select(i, ...)) end
        __lab_write(table.concat(values, '\\t') .. '\\n')
      end
    `);
    start();
    try {
      await lua.doString(job.source);
    } finally {
      lua.global.close();
    }
    return 0;
  }
  if (job.language === "sql") {
    const base = asset("sql.js-1.16.0/");
    const { default: initSqlJs } = await import(
      /* @vite-ignore */ `${base}sql-wasm.mjs`
    );
    const SQL = await initSqlJs({
      locateFile: (path: string) => base + path,
      useOldExtensionFunctions: false,
    });
    const db = new SQL.Database();
    db.run("CREATE TABLE stdin(line TEXT)");
    const insert = db.prepare("INSERT INTO stdin VALUES (?)");
    for (const line of job.stdin.split(/\r?\n/)) insert.run([line]);
    insert.free();
    start();
    try {
      const results = db.exec(job.source);
      if (!results.length) output("执行完成。\n");
      for (const result of results) {
        output(result.columns.join(" | ") + "\n");
        for (const row of result.values)
          output(
            row
              .map((cell: any) =>
                cell === null
                  ? "NULL"
                  : cell instanceof Uint8Array
                    ? `[BLOB ${cell.length} bytes]`
                    : String(cell),
              )
              .join(" | ") + "\n",
          );
      }
    } finally {
      db.close();
    }
    return 0;
  }
  if (job.language === "php") {
    const base = asset("php-wasm-web-8-4-3.1.63/");
    const [{ PHP, loadPHPRuntime }, loader] = await Promise.all([
      import("@php-wasm/universal"),
      import(/* @vite-ignore */ `${base}php_8_4.js`),
    ]);
    let cursor = 0;
    const bytes = new TextEncoder().encode(job.stdin);
    const runtime = await loadPHPRuntime(loader, {
      stdin: () => (cursor < bytes.length ? bytes[cursor++] : null),
    });
    const php = new PHP(runtime);
    php.writeFile("/lab-stdin", job.stdin);
    php.writeFile("/main.php", job.source);
    php.writeFile(
      "/lab-entry.php",
      `<?php define('STDIN',fopen('/lab-stdin','rb')); define('STDOUT',fopen('php://output','wb')); define('STDERR',fopen('php://stderr','wb')); require '/main.php';`,
    );
    start();
    let result;
    try {
      result = await php.run({ scriptPath: "/lab-entry.php", body: job.stdin });
    } catch (error: any) {
      if (typeof error?.response?.exitCode === "number")
        result = error.response;
      else throw error;
    }
    output(result.text);
    if (result.errors) output(result.errors);
    return result.exitCode;
  }
  throw new Error("此语言尚未接入运行环境。");
}
