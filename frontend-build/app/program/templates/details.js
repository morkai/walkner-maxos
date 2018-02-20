define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(p){return _ENCODE_HTML_RULES[p]||p}escapeFn=escapeFn||function(p){return void 0==p?"":String(p).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="program-details">\n  <div class="panel panel-primary">\n    <div class="panel-heading">'),__append(t("program","PANEL:TITLE:details")),__append('</div>\n    <div class="panel-details row">\n      <div class="col-md-6">\n        <div class="props first">\n          <div class="prop">\n            <div class="prop-name">'),__append(t("program","PROPERTY:description")),__append('</div>\n            <div class="prop-value">'),__append(escapeFn(model.description)),__append('</div>\n          </div>\n          <div class="prop">\n            <div class="prop-name">'),__append(t("program","PROPERTY:chamberCount")),__append('</div>\n            <div class="prop-value">'),__append(model.chamberCount),__append('</div>\n          </div>\n          <div class="prop">\n            <div class="prop-name">'),__append(t("program","PROPERTY:tempController1")),__append('</div>\n            <div class="prop-value">'),__append(model.tempController1),__append('</div>\n          </div>\n          <div class="prop">\n            <div class="prop-name">'),__append(t("program","PROPERTY:tempController2")),__append('</div>\n            <div class="prop-value">'),__append(model.tempController2),__append('</div>\n          </div>\n          <div class="prop">\n            <div class="prop-name">'),__append(t("program","PROPERTY:stopOnCoverOpen")),__append('</div>\n            <div class="prop-value">'),__append(t("core","BOOL:"+model.stopOnCoverOpen)),__append('</div>\n          </div>\n          <div class="prop">\n            <div class="prop-name">'),__append(t("program","PROPERTY:repeatCount")),__append('</div>\n            <div class="prop-value">'),__append(model.repeatCount||1),__append('</div>\n          </div>\n        </div>\n      </div>\n      <div class="col-md-6">\n        <div class="props">\n          <div class="prop">\n            <div class="prop-name">'),__append(t("program","PROPERTY:startedAt")),__append('</div>\n            <div class="prop-value">'),__append(model.startedAt),__append('</div>\n          </div>\n          <div class="prop">\n            <div class="prop-name">'),__append(t("program","PROPERTY:finishedAt")),__append('</div>\n            <div class="prop-value">'),__append(model.finishedAt),__append('</div>\n          </div>\n          <div class="prop">\n            <div class="prop-name">'),__append(t("program","PROPERTY:elapsedTime")),__append('</div>\n            <div class="prop-value">'),__append(model.elapsedTime),__append('</div>\n          </div>\n          <div class="prop">\n            <div class="prop-name">'),__append(t("program","PROPERTY:status")),__append('</div>\n            <div class="prop-value">'),__append(model.status),__append('</div>\n          </div>\n          <div class="prop">\n            <div class="prop-name">'),__append(t("program","PROPERTY:reason")),__append('</div>\n            <div class="prop-value">'),__append(model.reason||"-"),__append('</div>\n          </div>\n          <div class="prop">\n            <div class="prop-name">'),__append(t("program","PROPERTY:error")),__append('</div>\n            <div class="prop-value">'),__append(model.error||"-"),__append("</div>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n  "),model.steps.forEach(function(p,n){__append('\n  <div class="panel panel-'),__append("heating"===p.mode?"danger":"info"),__append('">\n    <div class="panel-heading">'),__append(n+1),__append('</div>\n    <div class="panel-details">\n      <div class="props first">\n        <div class="prop">\n          <div class="prop-name">'),__append(t("program","PROPERTY:steps:duration")),__append('</div>\n          <div class="prop-value">'),__append(p.duration),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(t("program","PROPERTY:steps:startTemperature")),__append('</div>\n          <div class="prop-value">'),__append(p.startTemperature),__append("</div>\n        </div>\n        "),"heating"===p.mode?(__append('\n        <div class="prop">\n          <div class="prop-name">'),__append(t("program","PROPERTY:steps:temperature")),__append('</div>\n          <div class="prop-value">'),__append(p.temperature),__append("</div>\n        </div>\n        ")):(__append('\n        <div class="prop">\n          <div class="prop-name">'),__append(t("program","PROPERTY:steps:coverHeight")),__append('</div>\n          <div class="prop-value">'),__append(p.coverHeight),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(t("program","PROPERTY:steps:fan")),__append('</div>\n          <div class="prop-value">'),__append(t("core","BOOL:"+!!p.fan)),__append("</div>\n        </div>\n        ")),__append('\n        <div class="prop">\n          <div class="prop-name">'),__append(t("program","PROPERTY:steps:externalPowerLoad")),__append('</div>\n          <div class="prop-value">'),__append(t("core","BOOL:"+!!p.externalPowerLoad)),__append("</div>\n        </div>\n      </div>\n    </div>\n  </div>\n  ")}),__append("\n</div>\n");return __output.join("")}});