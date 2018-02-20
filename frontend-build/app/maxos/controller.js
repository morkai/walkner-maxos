// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","../broker","../pubsub","../user","../tags/TagCollection","./MaxosTest"],function(e,t,n,a,o,s,i){"use strict";function r(){if(!g.loading){var n=t.ajax({url:e.result(g.tags,"url")}).done(function(e){u(e.collection)}),a=g.test.fetch();return g.loading=t.when(n,a),g.loading.done(function(){g.loaded=!0}),g.loading.always(function(){g.loading=null}),g.loading}}function u(t){var a={},o={silent:!0};0===g.tags.length||Object.keys(t).length!==g.tags.length?(g.tags.reset(t,o),e.forEach(t,function(e){a[e.name]=e.value})):e.forEach(t,function(e){var t,n=g.tags.get(e.name);n?(t=n.get("value"),n.set(e,o)):g.tags.add(e,o),e.value!==t&&(a[e.name]=e.value)}),e.forEach(l,function(t){var n=t.time;e.forEach(l.newValues,function(e,t){var s=g.tags.get(t);s&&n>s.get("lastChangeTime")&&(s.set({lastChangeTime:n,value:e},o),a[t]=e)})}),l=[],g.tags.trigger("reset"),e.isEmpty(a)||n.publish("controller.valuesChanged",a)}var l=[],d=[],g={};return g.auth={isEmbedded:function(){return window!==window.parent&&-1!==window.navigator.userAgent.indexOf("X11; Linux")},changeOrder:function(){return"idle"===g.tags.getValue("program.state")&&(this.isEmbedded()||o.isAllowedTo("MAXOS:MANAGE:CHANGE_ORDER"))},changeConfig:function(){return this.changeOrder()&&o.isAllowedTo("MAXOS:MANAGE:CHANGE_CONFIG")},printLabels:function(){return this.isEmbedded()||o.isAllowedTo("MAXOS:MANAGE:PRINT_LABELS")}},g.tags=new s([],{paginate:!1}),g.test=new i(null,{url:"/maxos/test"}),g.test.on("sync",function(){d.forEach(function(e){Date.parse(e.updatedAt)>Date.parse(g.test.get("updatedAt"))&&g.test.set(e)}),d=[]}),g.test.on("error",function(){d=[]}),g.loaded=!1,g.loading=null,g.load=function(){return g.loaded?t.Deferred().resolve().promise():g.loading?g.loading:r()},n.subscribe("socket.connected",function(){r()}),a.subscribe("controller.tagsChanged",function(e){u(e)}),a.subscribe("controller.tagValuesChanged",function(t){if(g.loading)return void l.push({time:t["@timestamp"],newValues:t});var a={};e.forEach(t,function(t,n){var o=g.tags.get(n);o&&!e.isEqual(t,o.get("value"))&&(o.set("value",t),a[n]=t)}),e.isEmpty(a)||n.publish("controller.valuesChanged",a)}),a.subscribe("maxos.test.updated",function(e){g.loading?d.push(e):g.test.set(e)}),g});