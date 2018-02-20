// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

define(["app/router","app/viewport","app/user","app/data/controller","app/diagnostics/pages/TagsPage","i18n!app/nls/diagnostics"],function(a,p,s,t,e){"use strict";var i=s.auth("DIAGNOSTICS:VIEW");a.map("/diagnostics/tags",i,function(){p.showPage(new e({model:t}))})});