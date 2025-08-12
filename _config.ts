import lume from "lume/mod.ts";
import date from "lume/plugins/date.ts";

const site = lume({
  server: {
    debugBar: false, // disable the debug bar
  },
});
site.add("/styles.css");
site.add("/me.jpg");
site.use(date(/* Options */));

export default site;
