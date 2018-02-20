// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/i18n","app/user","../View","./ActionFormView","./PaginationView","app/core/templates/list"],function(t,e,i,s,n,o,l,r){"use strict";function a(t,e,s){return e||(e=t.getNlsDomain()),i.has(e,s)?i(e,s):i("core",s)}var c=n.extend({template:r,tableClassName:"table-bordered table-hover table-condensed",paginationOptions:{},refreshDelay:3e3,remoteTopics:function(){var t={},e=this.collection.getTopicPrefix();return e&&(t[e+".added"]="refreshCollection",t[e+".edited"]="refreshCollection",t[e+".deleted"]="onModelDeleted"),t},events:{"click .list-item[data-id]":function(t){if(t.target.classList.contains("actions-group"))return!1;if(!this.isNotClickable(t)){var e=this.collection.get(t.currentTarget.dataset.id).genClientUrl();t.ctrlKey?window.open(e):t.altKey||this.broker.publish("router.navigate",{url:e,trigger:!0,replace:!1})}},"mousedown .list-item[data-id]":function(t){this.isNotClickable(t)||1!==t.button||t.preventDefault()},"mouseup .list-item[data-id]":function(t){if(!this.isNotClickable(t)&&1===t.button)return window.open(this.collection.get(t.currentTarget.dataset.id).genClientUrl()),!1},"click .action-delete":function(t){t.preventDefault(),o.showDeleteDialog({model:this.getModelFromEvent(t)})}},initialize:function(){this.refreshReq=null,this.lastRefreshAt=0,this.listenTo(this.collection,"sync",function(){this.lastRefreshAt=Date.now()}),this.collection.paginationData&&(this.paginationView=new l(t.assign({replaceUrl:!!this.options.replaceUrl},this.paginationOptions,this.options.pagination,{model:this.collection.paginationData})),this.setView(".pagination-container",this.paginationView),this.listenTo(this.collection.paginationData,"change:page",this.scrollTop))},destroy:function(){this.paginationView=null},serialize:function(){return{columns:this.decorateColumns(this.serializeColumns()),actions:this.serializeActions(),rows:this.serializeRows(),className:t.result(this,"className"),tableClassName:t.result(this,"tableClassName"),noData:this.options.noData||i("core","LIST:NO_DATA")}},serializeColumns:function(){return Array.isArray(this.options.columns)?this.options.columns:Array.isArray(this.columns)?this.columns:[]},decorateColumns:function(t){var e=this.collection.getNlsDomain();return t.map(function(t){return t?("string"==typeof t&&(t={id:t,label:i.bound(e,"PROPERTY:"+t)}),t.label||(t.label=i.bound(e,"PROPERTY:"+t.id)),t.thAttrs||(t.thAttrs=""),t.tdAttrs||(t.tdAttrs=""),(t.className||t.thClassName||t.tdClassName)&&(t.thAttrs+=' class="'+(t.className||"")+" "+(t.thClassName||"")+'"',t.tdAttrs+=' class="'+(t.className||"")+" "+(t.tdClassName||"")+'"'),t):null}).filter(function(t){return null!==t})},serializeActions:function(){return c.actions.viewEditDelete(this.collection)},serializeRows:function(){return this.collection.map(this.options.serializeRow||this.serializeRow,this)},serializeRow:function(t){return"function"==typeof t.serializeRow?t.serializeRow():"function"==typeof t.serialize?t.serialize():t.toJSON()},beforeRender:function(){this.stopListening(this.collection,"reset",this.render)},afterRender:function(){this.listenToOnce(this.collection,"reset",this.render)},onModelDeleted:function(t){if(t){var e=t.model||t;e._id&&(this.$('.list-item[data-id="'+e._id+'"]').addClass("is-deleted"),this.refreshCollection(e))}},$row:function(t){return this.$('tr[data-id="'+t+'"]')},$cell:function(t,e){return this.$('tr[data-id="'+t+'"] > td[data-id="'+e+'"]')},refreshCollection:function(t){if(!t||!this.timers.refreshCollection){var e=Date.now();e-this.lastRefreshAt>this.refreshDelay?(this.lastRefreshAt=e,this.refreshCollectionNow()):this.timers.refreshCollection=setTimeout(this.refreshCollectionNow.bind(this),this.refreshDelay)}},refreshCollectionNow:function(e){if(this.timers){this.timers.refreshCollection&&clearTimeout(this.timers.refreshCollection),delete this.timers.refreshCollection,this.refreshReq&&this.refreshReq.abort();var i=this,s=this.promised(this.collection.fetch(t.isObject(e)?e:{reset:!0}));s.always(function(){i.refreshReq===s&&(i.refreshReq.abort(),i.refreshReq=null)}),this.refreshReq=s}},scrollTop:function(){var t=this.$el.offset().top-14,i=e(".navbar-fixed-top");i.length&&(t-=i.outerHeight()),window.scrollY>t&&e("html, body").stop(!0,!1).animate({scrollTop:t})},getModelFromEvent:function(t){return this.collection.get(this.$(t.target).closest(".list-item").attr("data-id"))},isNotClickable:function(t){return!this.el.classList.contains("is-clickable")||"A"===t.target.tagName||"INPUT"===t.target.tagName||"BUTTON"===t.target.tagName||t.target.classList.contains("actions")||""!==window.getSelection().toString()||"TD"!==t.target.tagName&&this.$(t.target).closest("a, input, button").length}});return c.actions={viewDetails:function(t,e){return{id:"viewDetails",icon:"file-text-o",label:a(t,e,"LIST:ACTION:viewDetails"),href:t.genClientUrl()}},edit:function(t,e){return{id:"edit",icon:"edit",label:a(t,e,"LIST:ACTION:edit"),href:t.genClientUrl("edit")}},delete:function(t,e){return{id:"delete",icon:"times",label:a(t,e,"LIST:ACTION:delete"),href:t.genClientUrl("delete")}},viewEditDelete:function(t,e,i){return function(n){var o=t.get(n._id),l=[c.actions.viewDetails(o,i)];return s.isAllowedTo((e||o.getPrivilegePrefix())+":MANAGE")&&l.push(c.actions.edit(o,i),c.actions.delete(o,i)),l}}},c});