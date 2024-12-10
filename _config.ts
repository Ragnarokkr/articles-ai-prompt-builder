import lume from "lume/mod.ts";
import base_path from "lume/plugins/base_path.ts";
import brotli from "lume/plugins/brotli.ts";
import check_urls from "lume/plugins/check_urls.ts";
import esbuild from "lume/plugins/esbuild.ts";
// import favicon from "lume/plugins/favicon.ts";
import google_fonts from "lume/plugins/google_fonts.ts";
import gzip from "lume/plugins/gzip.ts";
import icons from "lume/plugins/icons.ts";
import inline from "lume/plugins/inline.ts";
import lightningcss, { version } from "lume/plugins/lightningcss.ts";
import minify_html from "lume/plugins/minify_html.ts";
import relative_urls from "lume/plugins/relative_urls.ts";
import resolve_urls from "lume/plugins/resolve_urls.ts";
import robots from "lume/plugins/robots.ts";
import sitemap from "lume/plugins/sitemap.ts";
import slugify_urls from "lume/plugins/slugify_urls.ts";
import svgo from "lume/plugins/svgo.ts";
import terser from "lume/plugins/terser.ts";
import esbuildCssPlugin from "npm:esbuild-plugin-inline-import";

const site = lume({
  src: "./src",
  components: {
    cssFile: "/static/css/components.css",
    jsFile: "/static/scripts/components.js",
  },
  ...(Deno.env.has("BASE_URL") ? { location: new URL(Deno.env.get("BASE_URL") as string) } : {}),
});

site.use(base_path());
site.use(brotli());
site.use(check_urls());
site.use(esbuild({
  options: {
    plugins: [esbuildCssPlugin()],
    tsconfigRaw: {
      compilerOptions: {
        "experimentalDecorators": true,
        "useDefineForClassFields": false,
      },
    },
  },
}));
// site.use(favicon());
site.use(google_fonts({
  cssFile: "/static/css/styles.css",
  placeholder: "/* import:fonts */",
  folder: "/static/fonts",
  fonts: {
    "BodyText":
      "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
    "MonoText": "https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap",
  },
}));
site.use(icons({
  folder: "/static/img/icons",
}));
site.use(gzip());
site.use(inline());
site.use(lightningcss({
  options: {
    targets: {
      chrome: version(111),
      firefox: version(113),
      opera: version(97),
      edge: version(111),
    },
  },
}));
site.use(minify_html());
site.use(relative_urls());
site.use(resolve_urls());
site.use(robots());
site.use(sitemap());
site.use(slugify_urls());
site.use(svgo());
site.use(terser());

[
  "add_box",
  "chevron_left",
  "chevron_right",
  "close",
  "delete_forever",
  "edit",
  "variable_remove",
].forEach((file) => {
  site.remoteFile(
    `static/img/icons/material-200/${file}-outlined.svg`,
    `https://cdn.jsdelivr.net/npm/@material-symbols/svg-200@0.26.0/outlined/${file}.svg`,
  );
  site.copy(`static/img/icons/material-200/${file}-outlined.svg`);
});

// Due to an issue with `icons()` unable to import custom catalog
// i need to import icons by myself 🤷‍♂️
[
  "css",
  "html5",
  "deno",
  "esbuild",
  "git",
  "github-dark",
  "javascript",
  "typescript",
  "vscode",
].forEach((file) => {
  site.remoteFile(
    `static/img/icons/developer-icons/${file}.svg`,
    `https://raw.githubusercontent.com/xandemon/developer-icons/refs/heads/main/icons/${file}.svg`,
  );
  site.copy(`static/img/icons/developer-icons/${file}-outlined.svg`);
});

export default site;
