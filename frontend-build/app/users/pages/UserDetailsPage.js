// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

define(["app/i18n","app/user","app/core/util/pageActions","app/core/pages/DetailsPage","../views/UserDetailsView"],function(e,t,i,s,n){"use strict";return s.extend({DetailsView:n,breadcrumbs:function(){return t.isAllowedTo("USERS:VIEW")?s.prototype.breadcrumbs.call(this):[e.bound("users","BREADCRUMBS:myAccount")]},actions:function(){var s=this.model,n=[];return t.isAllowedTo("USERS:MANAGE")?n.push(i.edit(s,!1),i.delete(s,!1)):t.data._id===s.id&&n.push({label:e.bound("users","PAGE_ACTION:editAccount"),icon:"edit",href:s.genClientUrl("edit")}),n}})});