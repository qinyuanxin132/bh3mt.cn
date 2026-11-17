/// <reference lib="webworker" />
import {
  WASI,
  File,
  OpenFile,
  ConsoleStdout,
  PreopenDirectory,
} from "@bjorn3/browser_wasi_shim";

type Job = {
  language: string;
  source: string;
  stdin: string;
  base: string;
};
const send = (data: object) => self.postMessage(data);
const phase = (value: string, text: string) => {
  if (value === "running") executionStart = performance.now();
  send({ type: "phase", phase: value, text });
};
let buffered = "";
let outputSize = 0;
const flush = () => {
  if (buffered) {
    send({ type: "output", text: buffered });
    buffered = "";
  }
};
const output = (text: string) => {
  outputSize += text.length;
  if (outputSize > 100_000) {
    flush();
    throw new Error("输出超过 100,000 字符，本次运行已结束。");
  }
  buffered += text;
  if (buffered.length >= 1024) flush();
};
const decoder = new TextDecoder();
let executionStart = 0;
self.onmessage = async ({ data: job }: MessageEvent<Job>) => {
  try {
    // Pyodide's loader can swallow Wasm fetch failures; report them to the UI directly.
    const runtimePrefix = new URL("vendor/code-lab/", job.base).href;
    const fetchResource = self.fetch.bind(self);
    let reportedDownloadFailure = false;
    self.fetch = async (input, init) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : input.url;
      const runtimeAsset = url.startsWith(runtimePrefix);
      try {
        const response = await fetchResource(input, init);
        if (runtimeAsset && !response.ok)
          throw new Error(`HTTP ${response.status}`);
        return response;
      } catch (error) {
        if (runtimeAsset && !reportedDownloadFailure) {
          reportedDownloadFailure = true;
          send({
            type: "error",
            text: `运行环境资源下载失败，请重试。${error instanceof Error ? error.message : String(error)}`,
          });
        }
        throw error;
      }
    };
    if (job.language === "python") {
      phase("loading", "正在准备 Python 环境…");
      const indexURL = new URL("vendor/code-lab/pyodide-0.27.7/", job.base)
        .href;
      const { loadPyodide } = await import(
        /* @vite-ignore */ `${indexURL}pyodide.mjs`
      );
      const py = await loadPyodide({
        indexURL,
        stdout: output,
        stderr: output,
      });
      let offset = 0;
      const input = new TextEncoder().encode(job.stdin);
      py.setStdin({
        read: (buffer: Uint8Array) => {
          const count = Math.min(buffer.length, input.length - offset);
          buffer.set(input.subarray(offset, offset + count));
          offset += count;
          return count;
        },
      });
      py.setStdout({
        write: (bytes: Uint8Array) => {
          output(decoder.decode(bytes, { stream: true }));
          return bytes.length;
        },
      });
      py.setStderr({
        write: (bytes: Uint8Array) => {
          output(decoder.decode(bytes, { stream: true }));
          return bytes.length;
        },
      });
      // A fresh worker is used for each run, so globals and imports cannot leak into the next one.
      phase("running", "Python 运行中…");
      executionStart = performance.now();
      py.FS.writeFile("/home/pyodide/main.py", job.source);
      // Compile with a filename for readable tracebacks; catch SystemExit like a command-line interpreter.
      const globals = py.toPy({
        __name__: "__main__",
        __file__: "/home/pyodide/main.py",
      });
      py.globals.set("_lab_globals", globals);
      let code = 0;
      try {
        code = await py.runPythonAsync(`
import sys, traceback
try:
    exec(compile(open('/home/pyodide/main.py').read(), 'main.py', 'exec'), _lab_globals)
    _lab_exit_code = 0
except SystemExit as exc:
    if exc.code is None:
        _lab_exit_code = 0
    elif isinstance(exc.code, int):
        _lab_exit_code = exc.code
    else:
        print(exc.code, file=sys.stderr)
        _lab_exit_code = 1
except BaseException:
    traceback.print_exc()
    _lab_exit_code = 1
_lab_exit_code
`);
      } finally {
        globals.destroy();
      }
      output(decoder.decode());
      flush();
      send({
        type: "done",
        code,
        duration: performance.now() - executionStart,
      });
    } else if (job.language === "c" || job.language === "cpp") {
      phase("loading", "正在准备 C/C++ 环境，首次加载较久…");
      const url = new URL("vendor/code-lab/browsercc-0.1.1/index.js", job.base)
        .href;
      const { compile } = await import(/* @vite-ignore */ url);
      phase("compiling", "正在加载工具链并编译…");
      const cpp = job.language === "cpp";
      const { module, compileOutput } = await compile({
        source: job.source,
        fileName: cpp ? "main.cpp" : "main.c",
        flags: [
          cpp ? "--driver-mode=g++" : "--driver-mode=gcc",
          cpp ? "-std=c++20" : "-std=c17",
          "-O0",
          "-fno-exceptions",
          "-fno-color-diagnostics",
          "-Wl,-z,stack-size=1048576",
          "-Wl,--max-memory=268435456",
        ],
      });
      if (compileOutput) output(compileOutput);
      if (!module) {
        flush();
        send({ type: "done", code: 1, compileError: true });
        return;
      }
      phase("running", cpp ? "C++ 运行中…" : "C 运行中…");
      executionStart = performance.now();
      const wasi = new WASI(
        ["main"],
        [],
        [
          new OpenFile(new File(new TextEncoder().encode(job.stdin))),
          new ConsoleStdout((bytes) =>
            output(decoder.decode(bytes, { stream: true })),
          ),
          new ConsoleStdout((bytes) =>
            output(decoder.decode(bytes, { stream: true })),
          ),
          new PreopenDirectory(".", new Map()),
        ],
      );
      const instance = await WebAssembly.instantiate(module, {
        wasi_snapshot_preview1: wasi.wasiImport,
      });
      const code = wasi.start(instance as any);
      output(decoder.decode());
      flush();
      send({
        type: "done",
        code,
        duration: performance.now() - executionStart,
      });
    } else {
      const { runExtra } = await import("./code-lab-extra");
      const code = await runExtra(job, output, phase);
      output(decoder.decode());
      flush();
      send({
        type: "done",
        code,
        duration: executionStart
          ? performance.now() - executionStart
          : undefined,
      });
    }
  } catch (error) {
    flush();
    send({
      type: "error",
      text:
        error instanceof Error
          ? error.stack?.includes(error.message)
            ? error.stack
            : `${error.message}\n${error.stack ?? ""}`
          : String(error),
    });
  }
};
