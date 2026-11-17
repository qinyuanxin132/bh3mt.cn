const { chromium } = require("playwright-core");
const assert = require("node:assert/strict");
(async () => {
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
    const context = await b.newContext({
      viewport: { width: 1440, height: 1100 },
    });
    await context.addInitScript(() =>
      localStorage.setItem("bh3mt:ling-live2d:v1", '{"open":false}'),
    );
    const p = await context.newPage();
    const errors = [],
      bad = [],
      requests = [];
    p.on("pageerror", (e) => errors.push(e.message));
    p.on("response", (r) => {
      if (r.status() >= 400) bad.push(`${r.status()} ${r.url()}`);
    });
    p.on("request", (r) => requests.push(r.url()));
    const url = process.env.URL || "http://localhost:4322/lab/";
    await p.goto(url);
    await p.waitForSelector(".cm-editor");
    assert.equal(
      requests.filter((u) => u.includes("/vendor/code-lab/")).length,
      0,
      "runtime should load only on run",
    );
    const select = async (lang) => {
      await p.locator("#lab-language").selectOption(lang);
    };
    const source = async (text) => {
      await p.locator(".cm-content").focus();
      await p.keyboard.press("Control+a");
      await p.keyboard.insertText(text);
    };
    const run = async (expected, keyboard = false) => {
      if (keyboard) {
        await p.locator(".cm-content").focus();
        await p.keyboard.press("Control+Enter");
      } else await p.locator("#lab-run").click();
      await p.waitForFunction(
        () =>
          document.querySelector("[data-code-lab]").dataset.busy === "false",
        {},
        { timeout: 150000 },
      );
      const result = await p.locator("#lab-output").innerText();
      if (expected) assert.ok(result.includes(expected), result);
      return result;
    };
    for (const lang of [
      "python",
      "c",
      "cpp",
      "javascript",
      "typescript",
      "java",
      "go",
      "php",
      "ruby",
      "lua",
      "sql",
    ]) {
      await select(lang);
      for (const example of ["hello", "sum", "algorithm"]) {
        await p.locator("#lab-example").selectOption(example);
        await p.locator("#lab-load-example").click();
        await run(
          example === "hello"
            ? "你好，世界"
            : example === "sum"
              ? "12 + 30 = 42"
              : "0 1 1 2 3 5 8 13 21 34",
        );
        assert.equal(
          await p.locator("#lab-status").getAttribute("data-state"),
          "success",
        );
      }
      console.log(lang, "all 3 examples passed");
    }
    await select("javascript");
    await source(
      'console.log("start"); setTimeout(() => console.log("timer completed"), 30);',
    );
    await run("timer completed");
    await source(
      'let n=0;const id=setInterval(()=>{if(++n===2){clearInterval(id);console.log("interval cleared")}},10)',
    );
    await run("interval cleared");
    await select("java");
    await source(
      'package demo; import java.util.*; public class ReaderDemo { public static void main(String[] args) { Scanner s = new Scanner(System.in); System.out.println(s.nextLine()); System.out.println("java.util.Scanner / System.in"); } }',
    );
    await p.locator("#lab-stdin").fill("你好，泠 🌙\n");
    await run("你好，泠 🌙");
    assert.ok(
      (await p.locator("#lab-output").innerText()).includes(
        "java.util.Scanner / System.in",
      ),
    );
    await select("php");
    await source("<?php declare(strict_types=1); echo fgets(STDIN); exit(7);");
    await p.locator("#lab-stdin").fill("你好，PHP\n");
    await run("你好，PHP");
    assert.ok((await p.locator("#lab-status").innerText()).includes("7"));
    for (const [lang, code, error] of [
      ["javascript", 'throw new Error("JS failure")', "JS failure"],
      ["typescript", "const x: = 1;", "Unexpected"],
      ["ruby", 'raise "Ruby failure"', "Ruby failure"],
      ["lua", 'error("Lua failure")', "Lua failure"],
      ["sql", "SELECT * FROM missing_table;", "missing_table"],
    ]) {
      await select(lang);
      await source(code);
      await run(error);
      assert.equal(
        await p.locator("#lab-status").getAttribute("data-state"),
        "error",
      );
    }
    console.log(
      "JS timers, Java input/Unicode/package/literal preservation, PHP strict mode/exit code and language errors passed",
    );
    await select("python");
    await source(
      'import sys\nprint(sys.stdin.read())\nprint("<img src=x onerror=alert(1)>")\nsys.exit(7)',
    );
    await p.locator("#lab-stdin").fill("一行\n第二行\n");
    await run("第二行", true);
    assert.ok((await p.locator("#lab-status").innerText()).includes("7"));
    assert.equal(await p.locator("#lab-output img").count(), 0);
    await source("print(1 / 0)");
    await run("ZeroDivisionError");
    assert.equal(
      await p.locator("#lab-status").getAttribute("data-state"),
      "error",
    );
    await source("input()");
    await p.locator("#lab-stdin").fill("");
    await run("EOFError");
    await source("while True:\n    pass");
    await p.locator("#lab-timeout").selectOption("5");
    await run("达到执行时间上限");
    assert.ok((await p.locator("#lab-status").innerText()).includes("超时"));
    console.log(
      "Python input/EOF, traceback, exit code, output escaping, shortcut, timeout passed",
    );
    await select("c");
    await source(
      '#include <stdio.h>\n_Static_assert(sizeof(int) == 4, "int");\nint main(void) { printf("C17 ok\\n"); return 9; }',
    );
    await run("C17 ok");
    assert.ok((await p.locator("#lab-status").innerText()).includes("9"));
    await source("int main(void) { syntax error here }");
    await run("error:");
    assert.ok(
      (await p.locator("#lab-status").innerText()).includes("编译失败"),
    );
    await source("int main(void) { while (1) {} }");
    await p.locator("#lab-run").click();
    await p.waitForFunction(
      () =>
        document.querySelector("#lab-status").textContent.includes("C 运行中"),
      {},
      { timeout: 120000 },
    );
    await p.locator("#lab-stop").click();
    assert.ok((await p.locator("#lab-status").innerText()).includes("已停止"));
    console.log(
      "C17 compilation, compiler diagnostics, exit code and stopping a busy worker passed",
    );
    await select("python");
    await source('print("草稿保留")');
    await p.locator("#lab-stdin").fill("saved stdin");
    await p.waitForTimeout(400);
    await select("cpp");
    await source(
      '#include <iostream>\nint main() { std::cout << "恢复运行"; }',
    );
    await run("恢复运行");
    await p.reload();
    await p.waitForSelector(".cm-editor");
    assert.equal(await p.locator("#lab-language").inputValue(), "cpp");
    assert.ok(
      (await p.locator(".cm-content").innerText()).includes("恢复运行"),
    );
    await select("python");
    assert.ok(
      (await p.locator(".cm-content").innerText()).includes("草稿保留"),
    );
    assert.equal(await p.locator("#lab-stdin").inputValue(), "saved stdin");
    const dl = p.waitForEvent("download");
    await p.locator("#lab-download").click();
    assert.equal((await dl).suggestedFilename(), "main.py");
    console.log("recovery, per-language drafts, reload and download passed");
    await p.screenshot({
      path: require("node:path").join(
        require("node:os").tmpdir(),
        "code-lab-desktop.png",
      ),
    });
    await p.setViewportSize({ width: 390, height: 844 });
    await p.screenshot({
      path: require("node:path").join(
        require("node:os").tmpdir(),
        "code-lab-mobile.png",
      ),
      fullPage: true,
    });
    assert.equal(
      await p.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    );
    await run("草稿保留");
    console.log("mobile layout and run passed");
    assert.deepEqual(errors, []);
    assert.deepEqual(bad, []);
    assert.equal(
      requests.filter((u) => !u.startsWith(new URL(url).origin)).length,
      0,
      "all runtime requests should be same-origin",
    );
    const fail = await context.newPage();
    await fail.route("**/pyodide.asm.wasm", (r) => r.abort());
    await fail.goto(url);
    await fail.waitForSelector(".cm-editor");
    await fail.locator("#lab-language").selectOption("python");
    await fail.locator("#lab-run").click();
    await fail.waitForFunction(
      () => document.querySelector("[data-code-lab]").dataset.busy === "false",
      {},
      { timeout: 30000 },
    );
    assert.equal(
      await fail.locator("#lab-status").getAttribute("data-state"),
      "error",
    );
    assert.equal(await fail.locator("#lab-run").isEnabled(), true);
    console.log("failed runtime download exposes retryable state");
    console.log("PASS: all scenarios, no page errors / missing assets");
  } finally {
    await b.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
