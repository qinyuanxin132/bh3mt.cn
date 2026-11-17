import { EditorView, basicSetup } from "codemirror";
import { EditorState, Compartment, Prec } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import { python } from "@codemirror/lang-python";
import { cpp } from "@codemirror/lang-cpp";
import { oneDark } from "@codemirror/theme-one-dark";

import {
  examples,
  languageIds,
  languageInfo,
  type Language,
  type Draft,
} from "../data/code-lab";
import { javascript } from "@codemirror/lang-javascript";
import { languages } from "@codemirror/language-data";
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
const drafts = Object.fromEntries(
  languageIds.map((lang) => [lang, { ...examples[lang].hello }]),
) as Record<Language, Draft>;
let language: Language = "python";
try {
  const saved = JSON.parse(localStorage.getItem(key) || "null");
  for (const lang of languageIds) {
    if (
      typeof saved?.drafts?.[lang]?.source === "string" &&
      typeof saved.drafts[lang].stdin === "string"
    )
      drafts[lang] = saved.drafts[lang];
  }
  if (languageIds.includes(saved?.language)) language = saved.language;
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
function grammar(lang: Language) {
  if (lang === "python") return python();
  if (lang === "c" || lang === "cpp") return cpp();
  if (lang === "javascript" || lang === "typescript")
    return javascript({ typescript: lang === "typescript" });
  return [];
}
async function loadGrammar(lang: Language) {
  if (["python", "c", "cpp", "javascript", "typescript"].includes(lang)) return;
  const support = await languages
    .find((item) => item.name.toLowerCase() === languageInfo[lang].grammar)
    ?.load();
  if (support && language === lang)
    editor.dispatch({ effects: languageExtension.reconfigure(support) });
}
const editor = new EditorView({
  state: EditorState.create({
    doc: drafts[language].source,
    extensions: [
      basicSetup,
      oneDark,
      languageExtension.of(grammar(language)),
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
  get("filename").textContent = languageInfo[language].filename;
  get("runtime-note").textContent = languageInfo[language].note;
  void loadGrammar(language).catch(() => {});
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
    effects: languageExtension.reconfigure(grammar(language)),
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
