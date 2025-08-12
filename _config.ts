import lume from "lume/mod.ts";
import date from "lume/plugins/date.ts";
import codeHighlight from "lume/plugins/code_highlight.ts";
import lang_javascript from "npm:highlight.js/lib/languages/javascript";
import highlight from "lume/plugins/code_highlight.ts";


const site = lume({
  server: {
    debugBar: false, // disable the debug bar
  },
});
site.add("/styles.css");
site.add("/me.jpg");
site.use(date());
site.use(codeHighlight({
  theme: {
    name: "atom-one-dark",
    cssFile: "/code-theme.css"
  },
  languages: {
    javascript: lang_javascript
  }
}));

export default site;
