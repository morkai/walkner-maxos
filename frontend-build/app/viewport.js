// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

define(["app/broker","app/core/Viewport"],function(e,o){"use strict";var r=new o({el:document.body,selector:"#app-viewport"});return e.subscribe("router.executing",function(){window.scrollTo(0,0)}),window.viewport=r,r});