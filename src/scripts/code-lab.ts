import { EditorView, basicSetup } from "codemirror";
import { EditorState, Compartment, Prec } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import { python } from "@codemirror/lang-python";
import { cpp } from "@codemirror/lang-cpp";
import { oneDark } from "@codemirror/theme-one-dark";

type Language = "python" | "c" | "cpp";
type Draft = { source: string; stdin: string };
const examples: Record<Language, Record<string, Draft>> = {
  python: {
    hello: {
      source:
        'print("你好，世界！这里是泠的代码实验室。")\n\nfor i in range(1, 4):\n    print(f"第 {i} 次尝试，离答案更近一点。")\n',
      stdin: "",
    },
    sum: {
      source:
        '# 输入两个整数，以空格分隔\na, b = map(int, input().split())\nprint(f"{a} + {b} = {a + b}")\n',
      stdin: "12 30\n",
    },
    algorithm: {
      source:
        '# 输出前 n 个斐波那契数\nn = int(input())\na, b = 0, 1\nfor _ in range(n):\n    print(a, end=" ")\n    a, b = b, a + b\nprint()\n',
      stdin: "10\n",
    },
  },
  c: {
    hello: {
      source:
        '#include <stdio.h>\n\nint main(void) {\n    printf("你好，世界！这里是泠的代码实验室。\\n");\n    for (int i = 1; i <= 3; ++i) {\n        printf("第 %d 次尝试，离答案更近一点。\\n", i);\n    }\n    return 0;\n}\n',
      stdin: "",
    },
    sum: {
      source:
        '#include <stdio.h>\n\nint main(void) {\n    long long a, b;\n    if (scanf("%lld %lld", &a, &b) != 2) {\n        fprintf(stderr, "请输入两个整数\\n");\n        return 1;\n    }\n    printf("%lld + %lld = %lld\\n", a, b, a + b);\n    return 0;\n}\n',
      stdin: "12 30\n",
    },
    algorithm: {
      source:
        '#include <stdio.h>\n\nint main(void) {\n    int n;\n    if (scanf("%d", &n) != 1 || n < 0 || n > 90) return 1;\n    unsigned long long a = 0, b = 1;\n    for (int i = 0; i < n; ++i) {\n        printf("%llu ", a);\n        unsigned long long next = a + b;\n        a = b; b = next;\n    }\n    printf("\\n");\n    return 0;\n}\n',
      stdin: "10\n",
    },
  },
  cpp: {
    hello: {
      source:
        '#include <iostream>\n#include <string>\n#include <vector>\n\nint main() {\n    std::vector<std::string> notes = {"你好，世界！", "这里是泠的代码实验室。"};\n    for (const auto& note : notes) {\n        std::cout << note << "\\n";\n    }\n}\n',
      stdin: "",
    },
    sum: {
      source:
        '#include <iostream>\n\nint main() {\n    long long a, b;\n    if (!(std::cin >> a >> b)) {\n        std::cerr << "请输入两个整数\\n";\n        return 1;\n    }\n    std::cout << a << " + " << b << " = " << a + b << "\\n";\n}\n',
      stdin: "12 30\n",
    },
    algorithm: {
      source:
        '#include <iostream>\n#include <vector>\n\nint main() {\n    int n;\n    if (!(std::cin >> n) || n < 0 || n > 90) return 1;\n    std::vector<unsigned long long> fib = {0, 1};\n    for (int i = 2; i < n; ++i) fib.push_back(fib[i - 1] + fib[i - 2]);\n    for (int i = 0; i < n; ++i) std::cout << fib[i] << " ";\n    std::cout << "\\n";\n}\n',
      stdin: "10\n",
    },
  },
};
const root = document.querySelector<HTMLElement>("[data-code-lab]")!;
const get = <T extends HTMLElement>(id: string) =>
  document.getElementById(`lab-${id}`) as T;
const languageSelect = get<HTMLSelectElement>("language");
const input = get<HTMLTextAreaElement>("stdin");
const run = get<HTMLButtonElement>("run");
const stop = get<HTMLButtonElement>("stop");
const output = get<HTMLElement>("output");
const status = get<HTMLElement>("status");
const duration = get<HTMLElement>("duration");
const example = get<HTMLSelectElement>("example");
const loadExample = get<HTMLButtonElement>("load-example");
const saveState = root.querySelector<HTMLElement>(
  ".lab-editor-panel .lab-panel-heading > span",
);
const languageExtension = new Compartment();
const key = "bh3mt:code-lab:v1";
const drafts: Record<Language, Draft> = {
  python: { ...examples.python.hello },
  c: { ...examples.c.hello },
  cpp: { ...examples.cpp.hello },
};
let language: Language = "python";
try {
  const saved = JSON.parse(localStorage.getItem(key) || "null");
  for (const lang of ["python", "c", "cpp"] as const) {
    if (
      typeof saved?.drafts?.[lang]?.source === "string" &&
      typeof saved.drafts[lang].stdin === "string"
    )
      drafts[lang] = saved.drafts[lang];
  }
  if (["python", "c", "cpp"].includes(saved?.language))
    language = saved.language;
} catch {
  /* Work without localStorage. */
}
languageSelect.value = language;
input.value = drafts[language].stdin;
let saveTimer: ReturnType<typeof setTimeout>;
let worker: Worker | undefined;
let deadline: ReturnType<typeof setTimeout>;
let busy = false;
const setStatus = (text: string, state = "idle") => {
  status.textContent = `● ${text}`;
  status.dataset.state = state;
};
const persist = () => {
  drafts[language] = {
    source: editor.state.doc.toString(),
    stdin: input.value,
  };
  try {
    localStorage.setItem(key, JSON.stringify({ language, drafts }));
    if (saveState) saveState.textContent = "草稿已保存";
  } catch {
    if (saveState) saveState.textContent = "草稿暂存于本页";
  }
};
const scheduleSave = () => {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(persist, 300);
};
const updateCursor = (view: EditorView) => {
  const pos = view.state.selection.main.head,
    line = view.state.doc.lineAt(pos);
  get("cursor").textContent = `Ln ${line.number}, Col ${pos - line.from + 1}`;
};
const editor = new EditorView({
  state: EditorState.create({
    doc: drafts[language].source,
    extensions: [
      basicSetup,
      oneDark,
      languageExtension.of(language === "python" ? python() : cpp()),
      Prec.highest(
        keymap.of([
          {
            key: "Mod-Enter",
            run: () => {
              if (!busy) execute();
              return true;
            },
          },
          indentWithTab,
        ]),
      ),
      EditorView.contentAttributes.of({
        "aria-label": "源代码",
        spellcheck: "false",
      }),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) scheduleSave();
        if (update.docChanged || update.selectionSet) updateCursor(update.view);
      }),
    ],
  }),
  parent: get("editor"),
});
get("fallback").remove();
// The initial HTML textarea is only a no-JS/editor-loading fallback.
const setFileName = () => {
  get("filename").textContent =
    language === "python"
      ? "main.py"
      : language === "c"
        ? "main.c"
        : "main.cpp";
};
setFileName();
updateCursor(editor);
const setBusy = (value: boolean) => {
  busy = value;
  get<HTMLSelectElement>("timeout").disabled = value;
  run.disabled = value;
  stop.disabled = !value;
  languageSelect.disabled = value;
  loadExample.disabled = value;
  get<HTMLButtonElement>("reset").disabled = value;
  root.dataset.busy = String(value);
};
const append = (text: string) => {
  if (output.dataset.empty === "true") {
    output.textContent = "";
    output.dataset.empty = "false";
  }
  // Keep all user output as text, including compiler diagnostics and HTML-like strings.
  output.append(document.createTextNode(text));
  const scroll = output.parentElement!;
  scroll.scrollTop = scroll.scrollHeight;
};
const finish = () => {
  clearTimeout(deadline);
  worker?.terminate();
  worker = undefined;
  setBusy(false);
};
const armDeadline = (ms: number, text: string) => {
  clearTimeout(deadline);
  deadline = setTimeout(() => {
    finish();
    append(`\n${text}\n`);
    setStatus("已超时", "error");
  }, ms);
};
function execute() {
  if (busy) return;
  persist();
  output.textContent = "";
  output.dataset.empty = "false";
  duration.textContent = "";
  setBusy(true);
  setStatus("正在准备环境…", "busy");
  try {
    const active = new Worker(
      new URL("./code-lab.worker.ts", import.meta.url),
      { type: "module" },
    );
    worker = active;
    armDeadline(120000, "环境准备超时，请检查连接后重试。");
    active.onmessage = ({ data }) => {
      if (worker !== active) return;
      if (data.type === "phase") {
        setStatus(data.text, "busy");
        armDeadline(
          data.phase === "running"
            ? Number(get<HTMLSelectElement>("timeout").value) * 1000
            : 120000,
          data.phase === "running"
            ? "达到执行时间上限，本次运行已结束。"
            : "工具链加载或编译超时，可重试。",
        );
      } else if (data.type === "output") append(data.text);
      else if (data.type === "done") {
        finish();
        if (!output.textContent) output.textContent = "（程序没有输出）";
        setStatus(
          data.compileError
            ? "编译失败"
            : data.code === 0
              ? "运行完成 · 退出码 0"
              : `程序退出 · 退出码 ${data.code}`,
          data.code === 0 ? "success" : "error",
        );
        if (typeof data.duration === "number")
          duration.textContent = `${data.duration < 1000 ? `${data.duration.toFixed(1)} ms` : `${(data.duration / 1000).toFixed(2)} s`}`;
      } else if (data.type === "error") {
        finish();
        append(`\n${data.text}\n`);
        setStatus("运行失败", "error");
      }
    };
    active.onerror = (event) => {
      event.preventDefault();
      if (worker !== active) return;
      finish();
      append(`运行环境未能启动：${event.message || "请刷新后重试"}\n`);
      setStatus("加载失败", "error");
    };
    active.onmessageerror = () => {
      if (worker !== active) return;
      finish();
      append("运行环境通信失败，请重试。\n");
      setStatus("运行失败", "error");
    };
    active.postMessage({
      language,
      source: editor.state.doc.toString(),
      stdin: input.value,
      base: new URL(root.dataset.base || "/", location.origin).href,
    });
  } catch (error) {
    finish();
    append(String(error));
    setStatus("加载失败", "error");
  }
}
run.addEventListener("click", execute);
stop.addEventListener("click", () => {
  finish();
  append("\n已手动停止。\n");
  setStatus("已停止");
});
input.addEventListener("input", scheduleSave);
languageSelect.addEventListener("change", () => {
  clearTimeout(saveTimer);
  persist();
  language = languageSelect.value as Language;
  editor.dispatch({
    changes: {
      from: 0,
      to: editor.state.doc.length,
      insert: drafts[language].source,
    },
    effects: languageExtension.reconfigure(
      language === "python" ? python() : cpp(),
    ),
    selection: { anchor: 0 },
  });
  input.value = drafts[language].stdin;
  setFileName();
  persist();
  setStatus("就绪");
});
const load = (name: string) => {
  const draft = examples[language][name];
  editor.dispatch({
    changes: { from: 0, to: editor.state.doc.length, insert: draft.source },
    selection: { anchor: 0 },
  });
  input.value = draft.stdin;
  persist();
  editor.focus();
  setStatus("示例已载入");
};
loadExample.addEventListener("click", () => load(example.value));
get("reset").addEventListener("click", () => load("hello"));
get("clear").addEventListener("click", () => {
  output.textContent = busy
    ? "等待程序输出…"
    : "点击「运行代码」，在这里查看结果。";
  output.dataset.empty = "true";
  duration.textContent = "";
});
get("download").addEventListener("click", () => {
  const url = URL.createObjectURL(
    new Blob([editor.state.doc.toString()], {
      type: "text/plain;charset=utf-8",
    }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = get("filename").textContent!;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
window.addEventListener("pagehide", () => {
  clearTimeout(saveTimer);
  persist();
  finish();
});
window.addEventListener("pageshow", (event) => {
  if (event.persisted) setStatus("就绪");
});
persist();
