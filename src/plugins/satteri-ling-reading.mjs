/** Add OC interludes at complete, top-level section boundaries during the build. */
const element = (tagName, properties, children = []) => ({
  type: "element",
  tagName,
  properties,
  children,
});
const text = (value) => ({ type: "text", value });

function weight(node) {
  if (node.type === "text") return node.value.trim().length;
  if (node.tagName === "img") return 80;
  const size = (node.children ?? []).reduce(
    (sum, child) => sum + weight(child),
    0,
  );
  return node.tagName === "pre" ? Math.max(80, size * 0.45) : size;
}

function interlude(index, base) {
  const labels = [
    "翻过这一页，继续探索。",
    "有些答案，值得多看一遍。",
    "月光还在，下一节见。",
  ];
  return element(
    "aside",
    { className: ["ling-interlude"], ariaLabel: "泠的伴读书签" },
    [
      element("span", { className: ["interlude-orbit"], ariaHidden: "true" }, [
        text("✦"),
      ]),
      element("div", { className: ["interlude-copy"] }, [
        element("span", { className: ["interlude-kicker"] }, [
          text("LING / 月下伴读"),
        ]),
        element("p", {}, [text(labels[index % labels.length])]),
        element("a", { href: `${base}ling/`, className: ["interlude-link"] }, [
          text("认识泠 ↗"),
        ]),
      ]),
      element("img", {
        src: `${base}images/ling/ling-page-peek.webp`,
        alt: "泠趴在书页边，陪你继续阅读",
        width: 480,
        height: 360,
        loading: "lazy",
        decoding: "async",
        className: ["interlude-ling"],
      }),
    ],
  );
}

export default function lingReading({ base = "/" } = {}) {
  const assetBase = base.endsWith("/") ? base : `${base}/`;
  return {
    name: "ling-reading",
    before(tree, ctx) {
      const nodes = tree.children;
      if (
        !Array.isArray(nodes) ||
        nodes.some((node) =>
          node.properties?.className?.includes("ling-interlude"),
        )
      )
        return;
      const positions = [];
      let total = 0;
      nodes.forEach((node, index) => {
        if (
          node.type === "element" &&
          index > 2 &&
          index < nodes.length - 3 &&
          /^h[23]$/.test(node.tagName)
        ) {
          positions.push({ index, weight: total });
        }
        total += weight(node);
      });
      // No section headings: use paragraph boundaries, never split a list, table, or code block.
      if (!positions.length) {
        total = 0;
        nodes.forEach((node, index) => {
          if (
            node.type === "element" &&
            node.tagName === "p" &&
            index > 4 &&
            index < nodes.length - 4
          )
            positions.push({ index, weight: total });
          total += weight(node);
        });
      }
      if (total < 900 || !positions.length) return;
      const count = Math.min(5, Math.max(1, Math.floor(total / 1600)));
      const chosen = [];
      for (let slot = 1; slot <= count; slot++) {
        const target = (total * slot) / (count + 1);
        const available = positions.filter(
          (candidate) =>
            candidate.weight >= 450 &&
            total - candidate.weight >= 300 &&
            chosen.every(
              (other) => Math.abs(other.weight - candidate.weight) >= 800,
            ),
        );
        available.sort(
          (a, b) => Math.abs(a.weight - target) - Math.abs(b.weight - target),
        );
        if (available[0]) chosen.push(available[0]);
      }
      chosen.sort((a, b) => a.index - b.index);
      for (let index = chosen.length - 1; index >= 0; index--)
        ctx.insertChildAt(
          tree,
          chosen[index].index,
          interlude(index, assetBase),
        );
    },
  };
}
