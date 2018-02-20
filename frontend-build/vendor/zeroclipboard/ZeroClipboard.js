/*!
* ZeroClipboard
* The ZeroClipboard library provides an easy way to copy text to the clipboard using an invisible Adobe Flash movie and a JavaScript interface.
* Copyright (c) 2014 Jon Rohan, James M. Greene
* Licensed MIT
* http://zeroclipboard.org/
* v1.3.2
*/

!function(){"use strict";function e(e){return e.replace(/,/g,".").replace(/[^0-9\.]/g,"")}function t(t){return parseFloat(e(t))>=10}var n,r={bridge:null,version:"0.0.0",disabled:null,outdated:null,ready:null},o={},i=0,a={},s=0,l={},d=null,u=null,c=function(){var e,t,n,r,o="ZeroClipboard.swf";if(document.currentScript&&(r=document.currentScript.src));else{var i=document.getElementsByTagName("script");if("readyState"in i[0])for(e=i.length;e--&&("interactive"!==i[e].readyState||!(r=i[e].src)););else if("loading"===document.readyState)r=i[i.length-1].src;else{for(e=i.length;e--;){if(!(n=i[e].src)){t=null;break}if(n=n.split("#")[0].split("?")[0],n=n.slice(0,n.lastIndexOf("/")+1),null==t)t=n;else if(t!==n){t=null;break}}null!==t&&(r=t)}}return r&&(r=r.split("#")[0].split("?")[0],o=r.slice(0,r.lastIndexOf("/")+1)+o),o}(),f=function(){var e=/\-([a-z])/g,t=function(e,t){return t.toUpperCase()};return function(n){return n.replace(e,t)}}(),p=function(e,t){var n,r;return window.getComputedStyle?n=window.getComputedStyle(e,null).getPropertyValue(t):(r=f(t),n=e.currentStyle?e.currentStyle[r]:e.style[r]),"cursor"!==t||n&&"auto"!==n||"a"!==e.tagName.toLowerCase()?n:"pointer"},h=function(e){e||(e=window.event);var t;this!==window?t=this:e.target?t=e.target:e.srcElement&&(t=e.srcElement),k.activate(t)},g=function(e,t,n){e&&1===e.nodeType&&(e.addEventListener?e.addEventListener(t,n,!1):e.attachEvent&&e.attachEvent("on"+t,n))},v=function(e,t,n){e&&1===e.nodeType&&(e.removeEventListener?e.removeEventListener(t,n,!1):e.detachEvent&&e.detachEvent("on"+t,n))},y=function(e,t){if(!e||1!==e.nodeType)return e;if(e.classList)return e.classList.contains(t)||e.classList.add(t),e;if(t&&"string"==typeof t){var n=(t||"").split(/\s+/);if(1===e.nodeType)if(e.className){for(var r=" "+e.className+" ",o=e.className,i=0,a=n.length;i<a;i++)r.indexOf(" "+n[i]+" ")<0&&(o+=" "+n[i]);e.className=o.replace(/^\s+|\s+$/g,"")}else e.className=t}return e},m=function(e,t){if(!e||1!==e.nodeType)return e;if(e.classList)return e.classList.contains(t)&&e.classList.remove(t),e;if(t&&"string"==typeof t||void 0===t){var n=(t||"").split(/\s+/);if(1===e.nodeType&&e.className)if(t){for(var r=(" "+e.className+" ").replace(/[\n\t]/g," "),o=0,i=n.length;o<i;o++)r=r.replace(" "+n[o]+" "," ");e.className=r.replace(/^\s+|\s+$/g,"")}else e.className=""}return e},b=function(){var e,t,n,r=1;return"function"==typeof document.body.getBoundingClientRect&&(e=document.body.getBoundingClientRect(),t=e.right-e.left,n=document.body.offsetWidth,r=Math.round(t/n*100)/100),r},w=function(e,t){var n={left:0,top:0,width:0,height:0,zIndex:E(t)-1};if(e.getBoundingClientRect){var r,o,i,a=e.getBoundingClientRect();"pageXOffset"in window&&"pageYOffset"in window?(r=window.pageXOffset,o=window.pageYOffset):(i=b(),r=Math.round(document.documentElement.scrollLeft/i),o=Math.round(document.documentElement.scrollTop/i));var s=document.documentElement.clientLeft||0,l=document.documentElement.clientTop||0;n.left=a.left+r-s,n.top=a.top+o-l,n.width="width"in a?a.width:a.right-a.left,n.height="height"in a?a.height:a.bottom-a.top}return n},C=function(e,t){return null==t||t&&!0===t.cacheBust&&!0===t.useNoCache?(-1===e.indexOf("?")?"?":"&")+"noCache="+(new Date).getTime():""},x=function(e){var t,n,r,o=[],i=[],a=[];if(e.trustedOrigins&&("string"==typeof e.trustedOrigins?i.push(e.trustedOrigins):"object"==typeof e.trustedOrigins&&"length"in e.trustedOrigins&&(i=i.concat(e.trustedOrigins))),e.trustedDomains&&("string"==typeof e.trustedDomains?i.push(e.trustedDomains):"object"==typeof e.trustedDomains&&"length"in e.trustedDomains&&(i=i.concat(e.trustedDomains))),i.length)for(t=0,n=i.length;t<n;t++)if(i.hasOwnProperty(t)&&i[t]&&"string"==typeof i[t]){if(!(r=j(i[t])))continue;if("*"===r){a=[r];break}a.push.apply(a,[r,"//"+r,window.location.protocol+"//"+r])}return a.length&&o.push("trustedOrigins="+encodeURIComponent(a.join(","))),"string"==typeof e.jsModuleId&&e.jsModuleId&&o.push("jsModuleId="+encodeURIComponent(e.jsModuleId)),o.join("&")},O=function(e,t,n){if("function"==typeof t.indexOf)return t.indexOf(e,n);var r,o=t.length;for(void 0===n?n=0:n<0&&(n=o+n),r=n;r<o;r++)if(t.hasOwnProperty(r)&&t[r]===e)return r;return-1},I=function(e){if("string"==typeof e)throw new TypeError("ZeroClipboard doesn't accept query strings.");return e.length?e:[e]},z=function(e,t,n,r){r?window.setTimeout(function(){e.apply(t,n)},0):e.apply(t,n)},E=function(e){var t,n;return e&&("number"==typeof e&&e>0?t=e:"string"==typeof e&&(n=parseInt(e,10))&&!isNaN(n)&&n>0&&(t=n)),t||("number"==typeof B.zIndex&&B.zIndex>0?t=B.zIndex:"string"==typeof B.zIndex&&(n=parseInt(B.zIndex,10))&&!isNaN(n)&&n>0&&(t=n)),t||0},L=function(e,t){if(e&&!1!==t&&"undefined"!=typeof console&&console&&(console.warn||console.log)){console.warn}},T=function(){var e,t,n,r,o,i=arguments[0]||{};for(e=1,t=arguments.length;e<t;e++)if(null!=(n=arguments[e]))for(r in n)if(n.hasOwnProperty(r)){if(i[r],o=n[r],i===o)continue;void 0!==o&&(i[r]=o)}return i},j=function(e){if(null==e||""===e)return null;if(""===(e=e.replace(/^\s+|\s+$/g,"")))return null;var t=e.indexOf("//");e=-1===t?e:e.slice(t+2);var n=e.indexOf("/");return e=-1===n?e:-1===t||0===n?null:e.slice(0,n),e&&".swf"===e.slice(-4).toLowerCase()?null:e||null},N=function(){var e=function(e,t){var n,r,o;if(null!=e&&"*"!==t[0]&&("string"==typeof e&&(e=[e]),"object"==typeof e&&"length"in e))for(n=0,r=e.length;n<r;n++)if(e.hasOwnProperty(n)&&(o=j(e[n]))){if("*"===o){t.length=0,t.push("*");break}-1===O(o,t)&&t.push(o)}},t={always:"always",samedomain:"sameDomain",never:"never"};return function(n,r){var o,i=r.allowScriptAccess;if("string"==typeof i&&(o=i.toLowerCase())&&/^always|samedomain|never$/.test(o))return t[o];var a=j(r.moviePath);null===a&&(a=n);var s=[];e(r.trustedOrigins,s),e(r.trustedDomains,s);var l=s.length;if(l>0){if(1===l&&"*"===s[0])return"always";if(-1!==O(n,s))return 1===l&&n===a?"sameDomain":"always"}return"never"}}(),P=function(e){if(null==e)return[];if(Object.keys)return Object.keys(e);var t=[];for(var n in e)e.hasOwnProperty(n)&&t.push(n);return t},S=function(e){if(e)for(var t in e)e.hasOwnProperty(t)&&delete e[t];return e},A=function(){var e=!1;if("boolean"==typeof r.disabled)e=!1===r.disabled;else{if("function"==typeof ActiveXObject)try{new ActiveXObject("ShockwaveFlash.ShockwaveFlash")&&(e=!0)}catch(e){}!e&&navigator.mimeTypes["application/x-shockwave-flash"]&&(e=!0)}return e},k=function(e,t){if(!(this instanceof k))return new k(e,t);this.id=""+i++,a[this.id]={instance:this,elements:[],handlers:{}},e&&this.clip(e),void 0!==t&&(L("new ZeroClipboard(elements, options)",B.debug),k.config(t)),this.options=k.config(),"boolean"!=typeof r.disabled&&(r.disabled=!A()),!1===r.disabled&&!0!==r.outdated&&null===r.bridge&&(r.outdated=!1,r.ready=!1,M())};k.prototype.setText=function(e){return e&&""!==e&&(o["text/plain"]=e,!0===r.ready&&r.bridge&&r.bridge.setText(e)),this},k.prototype.setSize=function(e,t){return!0===r.ready&&r.bridge&&r.bridge.setSize(e,t),this};var Z=function(e){!0===r.ready&&r.bridge&&r.bridge.setHandCursor(e)};k.prototype.destroy=function(){this.unclip(),this.off(),delete a[this.id]};var D=function(){var e,t,n,r=[],o=P(a);for(e=0,t=o.length;e<t;e++)(n=a[o[e]].instance)&&n instanceof k&&r.push(n);return r};k.version="1.3.2";var B={swfPath:c,trustedDomains:window.location.host?[window.location.host]:[],cacheBust:!0,forceHandCursor:!1,zIndex:999999999,debug:!0,title:null,autoActivate:!0};k.config=function(e){"object"==typeof e&&null!==e&&T(B,e);{if("string"!=typeof e||!e){var t={};for(var n in B)B.hasOwnProperty(n)&&("object"==typeof B[n]&&null!==B[n]?"length"in B[n]?t[n]=B[n].slice(0):t[n]=T({},B[n]):t[n]=B[n]);return t}if(B.hasOwnProperty(e))return B[e]}},k.destroy=function(){k.deactivate();for(var e in a)if(a.hasOwnProperty(e)&&a[e]){var t=a[e].instance;t&&"function"==typeof t.destroy&&t.destroy()}var n=F(r.bridge);n&&n.parentNode&&(n.parentNode.removeChild(n),r.ready=null,r.bridge=null)},k.activate=function(e){n&&(m(n,B.hoverClass),m(n,B.activeClass)),n=e,y(e,B.hoverClass),H();var t=B.title||e.getAttribute("title");if(t){var o=F(r.bridge);o&&o.setAttribute("title",t)}var i=!0===B.forceHandCursor||"pointer"===p(e,"cursor");Z(i)},k.deactivate=function(){var e=F(r.bridge);e&&(e.style.left="0px",e.style.top="-9999px",e.removeAttribute("title")),n&&(m(n,B.hoverClass),m(n,B.activeClass),n=null)};var M=function(){var e,t,n=document.getElementById("global-zeroclipboard-html-bridge");if(!n){var o=k.config();o.jsModuleId="string"==typeof d&&d||"string"==typeof u&&u||null;var i=N(window.location.host,B),a=x(o),s=B.moviePath+C(B.moviePath,B),l='      <object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" id="global-zeroclipboard-flash-bridge" width="100%" height="100%">         <param name="movie" value="'+s+'"/>         <param name="allowScriptAccess" value="'+i+'"/>         <param name="scale" value="exactfit"/>         <param name="loop" value="false"/>         <param name="menu" value="false"/>         <param name="quality" value="best" />         <param name="bgcolor" value="#ffffff"/>         <param name="wmode" value="transparent"/>         <param name="flashvars" value="'+a+'"/>         <embed src="'+s+'"           loop="false" menu="false"           quality="best" bgcolor="#ffffff"           width="100%" height="100%"           name="global-zeroclipboard-flash-bridge"           allowScriptAccess="'+i+'"           allowFullScreen="false"           type="application/x-shockwave-flash"           wmode="transparent"           pluginspage="http://www.macromedia.com/go/getflashplayer"           flashvars="'+a+'"           scale="exactfit">         </embed>       </object>';n=document.createElement("div"),n.id="global-zeroclipboard-html-bridge",n.setAttribute("class","global-zeroclipboard-container"),n.style.position="absolute",n.style.left="0px",n.style.top="-9999px",n.style.width="15px",n.style.height="15px",n.style.zIndex=""+E(B.zIndex),document.body.appendChild(n),n.innerHTML=l}e=document["global-zeroclipboard-flash-bridge"],e&&(t=e.length)&&(e=e[t-1]),r.bridge=e||n.children[0].lastElementChild},F=function(e){for(var t=/^OBJECT|EMBED$/,n=e&&e.parentNode;n&&t.test(n.nodeName)&&n.parentNode;)n=n.parentNode;return n||null},H=function(){if(n){var e=w(n,B.zIndex),t=F(r.bridge);t&&(t.style.top=e.top+"px",t.style.left=e.left+"px",t.style.width=e.width+"px",t.style.height=e.height+"px",t.style.zIndex=e.zIndex+1),!0===r.ready&&r.bridge&&r.bridge.setSize(e.width,e.height)}return this};k.prototype.on=function(e,t){var n,o,i,s={},l=a[this.id]&&a[this.id].handlers;if("string"==typeof e&&e)i=e.toLowerCase().split(/\s+/);else if("object"==typeof e&&e&&void 0===t)for(n in e)e.hasOwnProperty(n)&&"string"==typeof n&&n&&"function"==typeof e[n]&&this.on(n,e[n]);if(i&&i.length){for(n=0,o=i.length;n<o;n++)e=i[n].replace(/^on/,""),s[e]=!0,l[e]||(l[e]=[]),l[e].push(t);s.noflash&&r.disabled&&q.call(this,"noflash",{}),s.wrongflash&&r.outdated&&q.call(this,"wrongflash",{flashVersion:r.version}),s.load&&r.ready&&q.call(this,"load",{flashVersion:r.version})}return this},k.prototype.off=function(e,t){var n,r,o,i,s,l=a[this.id]&&a[this.id].handlers;if(0===arguments.length)i=P(l);else if("string"==typeof e&&e)i=e.split(/\s+/);else if("object"==typeof e&&e&&void 0===t)for(n in e)e.hasOwnProperty(n)&&"string"==typeof n&&n&&"function"==typeof e[n]&&this.off(n,e[n]);if(i&&i.length)for(n=0,r=i.length;n<r;n++)if(e=i[n].toLowerCase().replace(/^on/,""),(s=l[e])&&s.length)if(t)for(o=O(t,s);-1!==o;)s.splice(o,1),o=O(t,s,o);else l[e].length=0;return this},k.prototype.handlers=function(e){var t,n=null,r=a[this.id]&&a[this.id].handlers;if(r){if("string"==typeof e&&e)return r[e]?r[e].slice(0):null;n={};for(t in r)r.hasOwnProperty(t)&&r[t]&&(n[t]=r[t].slice(0))}return n};var R=function(e,t,n,r){var o=a[this.id]&&a[this.id].handlers[e];if(o&&o.length){var i,s,l,d=t||this;for(i=0,s=o.length;i<s;i++)l=o[i],t=d,"string"==typeof l&&"function"==typeof window[l]&&(l=window[l]),"object"==typeof l&&l&&"function"==typeof l.handleEvent&&(t=l,l=l.handleEvent),"function"==typeof l&&z(l,t,n,r)}return this};k.prototype.clip=function(e){e=I(e);for(var t=0;t<e.length;t++)if(e.hasOwnProperty(t)&&e[t]&&1===e[t].nodeType){e[t].zcClippingId?-1===O(this.id,l[e[t].zcClippingId])&&l[e[t].zcClippingId].push(this.id):(e[t].zcClippingId="zcClippingId_"+s++,l[e[t].zcClippingId]=[this.id],!0===B.autoActivate&&g(e[t],"mouseover",h));var n=a[this.id].elements;-1===O(e[t],n)&&n.push(e[t])}return this},k.prototype.unclip=function(e){var t=a[this.id];if(t){var n,r=t.elements;e=void 0===e?r.slice(0):I(e);for(var o=e.length;o--;)if(e.hasOwnProperty(o)&&e[o]&&1===e[o].nodeType){for(n=0;-1!==(n=O(e[o],r,n));)r.splice(n,1);var i=l[e[o].zcClippingId];if(i){for(n=0;-1!==(n=O(this.id,i,n));)i.splice(n,1);0===i.length&&(!0===B.autoActivate&&v(e[o],"mouseover",h),delete e[o].zcClippingId)}}}return this},k.prototype.elements=function(){var e=a[this.id];return e&&e.elements?e.elements.slice(0):[]};var V=function(e){var t,n,r,o,i,s=[];if(e&&1===e.nodeType&&(t=e.zcClippingId)&&l.hasOwnProperty(t)&&(n=l[t])&&n.length)for(r=0,o=n.length;r<o;r++)(i=a[n[r]].instance)&&i instanceof k&&s.push(i);return s};B.hoverClass="zeroclipboard-is-hover",B.activeClass="zeroclipboard-is-active",B.trustedOrigins=null,B.allowScriptAccess=null,B.useNoCache=!0,B.moviePath="ZeroClipboard.swf",k.detectFlashSupport=function(){return L("ZeroClipboard.detectFlashSupport",B.debug),A()},k.dispatch=function(e,t){if("string"==typeof e&&e){var r=e.toLowerCase().replace(/^on/,"");if(r)for(var o=n?V(n):D(),i=0,a=o.length;i<a;i++)q.call(o[i],r,t)}},k.prototype.setHandCursor=function(e){return L("ZeroClipboard.prototype.setHandCursor",B.debug),e="boolean"==typeof e?e:!!e,Z(e),B.forceHandCursor=e,this},k.prototype.reposition=function(){return L("ZeroClipboard.prototype.reposition",B.debug),H()},k.prototype.receiveEvent=function(e,t){if(L("ZeroClipboard.prototype.receiveEvent",B.debug),"string"==typeof e&&e){var n=e.toLowerCase().replace(/^on/,"");n&&q.call(this,n,t)}},k.prototype.setCurrent=function(e){return L("ZeroClipboard.prototype.setCurrent",B.debug),k.activate(e),this},k.prototype.resetBridge=function(){return L("ZeroClipboard.prototype.resetBridge",B.debug),k.deactivate(),this},k.prototype.setTitle=function(e){if(L("ZeroClipboard.prototype.setTitle",B.debug),e=e||B.title||n&&n.getAttribute("title")){var t=F(r.bridge);t&&t.setAttribute("title",e)}return this},k.setDefaults=function(e){L("ZeroClipboard.setDefaults",B.debug),k.config(e)},k.prototype.addEventListener=function(e,t){return L("ZeroClipboard.prototype.addEventListener",B.debug),this.on(e,t)},k.prototype.removeEventListener=function(e,t){return L("ZeroClipboard.prototype.removeEventListener",B.debug),this.off(e,t)},k.prototype.ready=function(){return L("ZeroClipboard.prototype.ready",B.debug),!0===r.ready};var q=function(i,a){i=i.toLowerCase().replace(/^on/,"");var s=a&&a.flashVersion&&e(a.flashVersion)||null,l=n,d=!0;switch(i){case"load":if(s){if(!t(s))return void q.call(this,"onWrongFlash",{flashVersion:s});r.outdated=!1,r.ready=!0,r.version=s}break;case"wrongflash":s&&!t(s)&&(r.outdated=!0,r.ready=!1,r.version=s);break;case"mouseover":y(l,B.hoverClass);break;case"mouseout":!0===B.autoActivate&&k.deactivate();break;case"mousedown":y(l,B.activeClass);break;case"mouseup":m(l,B.activeClass);break;case"datarequested":var u=l.getAttribute("data-clipboard-target"),c=u?document.getElementById(u):null;if(c){var f=c.value||c.textContent||c.innerText;f&&this.setText(f)}else{var p=l.getAttribute("data-clipboard-text");p&&this.setText(p)}d=!1;break;case"complete":S(o)}return R.call(this,i,l,[this,a],d)};"function"==typeof define&&define.amd?define(["require","exports","module"],function(e,t,n){return d=n&&n.id||null,k}):"object"==typeof module&&module&&"object"==typeof module.exports&&module.exports?(u=module.id||null,module.exports=k):window.ZeroClipboard=k}();