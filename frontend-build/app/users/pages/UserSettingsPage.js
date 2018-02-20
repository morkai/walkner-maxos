// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

define(["app/i18n","app/core/util/bindLoadingMessage","app/core/View","../UserSettingCollection","../views/UserSettingsView"],function(e,i,n,t,s){"use strict";return n.extend({layoutName:"page",breadcrumbs:function(){return[{label:e.bound("users","BREADCRUMBS:browse"),href:"#users"},e.bound("users","BREADCRUMBS:settings")]},initialize:function(){this.defineModels(),this.defineViews()},defineModels:function(){this.model=i(new t,this)},defineViews:function(){this.view=new s({initialTab:this.options.initialTab,settings:this.model})},load:function(e){return e(this.model.fetch({reset:!0}))}})});