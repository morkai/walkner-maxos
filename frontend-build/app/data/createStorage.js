// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

define(["app/time","app/broker","app/pubsub","./localStorage"],function(e,t,d,a){"use strict";return d.subscribe("dictionaries.updated",function(e){var d=e.topic,a=e.message,n=e.meta;n.remote=!0,n.json&&"string"==typeof a&&(a=JSON.parse(a)),t.publish(d,a,n)}),function(d,n,i){function o(){m.updatedAt=Date.now(),a.setItem(d,JSON.stringify({time:m.updatedAt,data:m.models})),t.publish(n+".synced")}var s={time:e.appData,data:window[d]||null},r=JSON.parse(a.getItem(d)||'{"time":0,"data":null}'),u=r&&r.time>s.time||!s.data?r:s,m=new i(u.data);return m.updatedAt=u.time,u!==s&&r.data||o(),m.on("add",o),m.on("remove",o),m.on("destroy",o),m.on("change",o),m.on("sync",o),m.on("reset",o),t.subscribe(n+".added",function(e){m.add(e.model)}),t.subscribe(n+".edited",function(e){var t=m.get(e.model._id);t?t.set(e.model):m.add(e.model)}),t.subscribe(n+".deleted",function(e){m.remove(e.model._id)}),m}});