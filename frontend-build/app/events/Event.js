// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

define(["../core/Model"],function(e){"use strict";var t={debug:"debug",info:"info",success:"success",warning:"warning",error:"danger"};return e.extend({urlRoot:"/events",clientUrlRoot:"#events",topicPrefix:"events",privilegePrefix:"EVENTS",nlsDomain:"events",labelAttribute:"type",defaults:{time:0,user:null,type:"unknown",severity:"info",data:null},getSeverityClassName:function(){return t[this.get("severity")]}})});