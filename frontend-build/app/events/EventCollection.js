// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

define(["app/time","../core/Collection","./Event"],function(e,t,r){"use strict";return t.extend({model:r,rqlQuery:function(t){var r=e.getMoment().hours(0).minutes(0).seconds(0).milliseconds(0).subtract(7,"days").valueOf();return t.Query.fromObject({fields:{type:1,severity:1,user:1,time:1,data:1},sort:{time:-1},limit:20,selector:{name:"and",args:[{name:"ge",args:["time",r]}]}})}})});