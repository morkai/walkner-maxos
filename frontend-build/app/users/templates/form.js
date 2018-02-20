define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(e){return _ENCODE_HTML_RULES[e]||e}escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="users-form" method="post" action="'),__append(formAction),__append('" autocomplete="off">\n  <input type="hidden" name="_method" value="'),__append(formMethod),__append('">\n  <div class="panel panel-primary">\n    <div class="panel-heading">'),__append(panelTitleText),__append('</div>\n    <div class="panel-body">\n      <div class="row">\n        <div class="col-lg-3">\n          <div class="form-group">\n            <label for="'),__append(idPrefix),__append('-login" class="control-label is-required">'),__append(t("users","PROPERTY:login")),__append('</label>\n            <input id="'),__append(idPrefix),__append('-login" class="form-control" type="text" name="login" required maxlength="50">\n          </div>\n          <div class="form-group">\n            <label for="'),__append(idPrefix),__append('-password" class="control-label '),__append(editMode?"":"is-required"),__append('">'),__append(t("users","PROPERTY:"+(editMode?"newPassword":"password"))),__append('</label>\n            <input id="'),__append(idPrefix),__append('-password" class="form-control" type="password" name="password" '),__append(editMode?"":"required"),__append('>\n          </div>\n          <div class="form-group">\n            <label for="'),__append(idPrefix),__append('-password2" class="control-label '),__append(editMode?"":"is-required"),__append('">'),__append(t("users","PROPERTY:password2")),__append('</label>\n            <input id="'),__append(idPrefix),__append('-password2" class="form-control" type="password" '),__append(editMode?"":"required"),__append(">\n            "),editMode&&(__append('\n            <p class="help-block">'),__append(t("users","FORM:HELP:password")),__append("</p>\n            ")),__append('\n          </div>\n        </div>\n        <div class="col-lg-3">\n          <div class="form-group">\n            <label for="'),__append(idPrefix),__append('-firstName" class="control-label">'),__append(t("users","PROPERTY:firstName")),__append('</label>\n            <input id="'),__append(idPrefix),__append('-firstName" class="form-control" type="text" name="firstName" autofocus maxlength="50">\n          </div>\n          <div class="form-group">\n            <label for="'),__append(idPrefix),__append('-lastName" class="control-label">'),__append(t("users","PROPERTY:lastName")),__append('</label>\n            <input id="'),__append(idPrefix),__append('-lastName" class="form-control" type="text" name="lastName" maxlength="50">\n          </div>\n          <div class="form-group">\n            <label for="'),__append(idPrefix),__append('-gender" class="control-label is-required">'),__append(t("users","PROPERTY:gender")),__append("</label>\n            <div>\n              "),["female","male"].forEach(function(e){__append('\n              <label class="radio-inline">\n                <input type="radio" name="gender" value="'),__append(e),__append('" required> '),__append(t("users","gender:"+e)),__append("\n              </label>\n              ")}),__append('\n            </div>\n          </div>\n        </div>\n        <div class="col-lg-3">\n          <div class="form-group">\n            <label for="'),__append(idPrefix),__append('-email" class="control-label">'),__append(t("users","PROPERTY:email")),__append('</label>\n            <input id="'),__append(idPrefix),__append('-email" class="form-control" type="email" name="email" maxlength="100">\n          </div>\n          <div class="form-group">\n            <label class="control-label">'),__append(t("users","PROPERTY:mobile")),__append('</label>\n            <div id="'),__append(idPrefix),__append('-mobile-list"></div>\n            <div id="'),__append(idPrefix),__append('-mobile" class="users-form-mobile">\n              <input id="'),__append(idPrefix),__append('-mobile-number" class="form-control users-form-mobile-number" type="text" placeholder="+00 000 000 000">\n              <span>'),__append(t("users","FORM:mobile:from")),__append('</span>\n              <input id="'),__append(idPrefix),__append('-mobile-from" class="form-control users-form-mobile-hours" type="text" placeholder="00:00">\n              <span>'),__append(t("users","FORM:mobile:to")),__append('</span>\n              <input id="'),__append(idPrefix),__append('-mobile-to" class="form-control users-form-mobile-hours" type="text" placeholder="00:00">\n              <button id="'),__append(idPrefix),__append('-mobile-add" class="btn btn-link" type="button"><i class="fa fa-plus"></i></button>\n            </div>\n          </div>\n        </div>\n        '),accountMode||(__append('\n        <div class="col-lg-3">\n          <div class="form-group">\n            <label for="'),__append(idPrefix),__append('-privileges" class="control-label">'),__append(t("users","PROPERTY:privileges")),__append('</label>\n            <div class="input-group">\n              <input id="'),__append(idPrefix),__append('-privileges" type="text" name="privileges">\n              <span class="input-group-btn">\n                <button id="'),__append(idPrefix),__append('-copyPrivileges" class="btn btn-default" type="button"><i class="fa fa-copy"></i></button>\n              </span>\n            </div>\n          </div>\n        </div>\n        ')),__append('\n      </div>\n    </div>\n    <div class="panel-footer">\n      <button type="submit" class="btn btn-primary">'),__append(formActionText),__append("</button>\n    </div>\n  </div>\n</form>\n");return __output.join("")}});