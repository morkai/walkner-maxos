define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="page">\n  <div class="hd '),__append(hdHidden?"hidden":""),__append('">\n    <nav class="navbar navbar-default"></nav>\n    <div class="page-alerts"></div>\n    <div class="page-header">\n      <ul class="page-actions"></ul>\n      <ul class="page-breadcrumbs"></ul>\n    </div>\n  </div>\n  <div class="bd"></div>\n  <div class="ft">\n    <p>\n      '),__append(t("core","APP_NAME")),__append("\n      "),changelogUrl?(__append('\n      <a href="'),__append(changelogUrl),__append('">v'),__append(version),__append("</a>\n      ")):(__append("\n      v"),__append(version),__append("\n      ")),__append('\n      <br>\n      <a href="https://miracle.systems/">miracle.systems</a>\n    </p>\n  </div>\n</div>\n');return __output.join("")}});