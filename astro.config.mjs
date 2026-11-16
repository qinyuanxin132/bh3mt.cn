import { defineConfig } from "astro/config";
import { satteri } from "@astrojs/markdown-satteri";
import lingReading from "./src/plugins/satteri-ling-reading.mjs";

export default defineConfig({
  site: "https://pass.bh3mt.cn",
  markdown: { processor: satteri({ hastPlugins: [lingReading()] }) },
});
