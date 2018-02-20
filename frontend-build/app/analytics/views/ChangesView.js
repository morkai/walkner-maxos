// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-hydro project <http://lukasz.walukiewicz.eu/p/walkner-hydro>

define(["app/i18n","app/core/views/ListView","app/analytics/templates/changes"],function(e,n,i){"use strict";return n.extend({template:i,remoteTopics:{},serialize:function(){return{idPrefix:this.idPrefix,groups:this.collection.group(function(e){return!!e.archive})}},genClientUrl:function(e){return"#analytics/changes/"+encodeURIComponent(e)}})});