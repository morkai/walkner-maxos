// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

define(["underscore"],function(e){"use strict";return function(r,s,t){if(e.isEmpty(t[s]))return e.escape(t[r]);var i='<div class="select2-result-with-description">';return i+="<h3>"+e.escape(t[r])+"</h3>",i+="<p>"+e.escape(t[s])+"</p>",i+="</div>"}});