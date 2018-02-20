// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

define(["./broker","./router","./changelog/routes","./events/routes","./users/routes","./alarms/routes","./diagnostics/routes","./maxos/routes"],function(e,r){"use strict";r.map("/",function(){e.publish("router.navigate",{url:"/maxos",trigger:!0,replace:!0})})});