// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

define(["app/core/views/FilterView","app/alarms/templates/filter"],function(e,a){"use strict";return e.extend({template:a,defaultFormData:{name:"",state:""},termToForm:{name:function(e,a,t){"regex"===a.name&&(t[e]=a.args[1].replace(/\\(.)/g,"$1"))},state:function(e,a,t){t[e]=+a.args[1]}},serializeFormToQuery:function(e){var a=parseInt(this.$id("state").val(),10);isNaN(a)||e.push({name:"eq",args:["state",a]}),this.serializeRegexTerm(e,"name",null,null,!0)}})});