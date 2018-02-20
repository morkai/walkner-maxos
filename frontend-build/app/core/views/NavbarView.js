// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/i18n","app/user","app/time","app/viewport","../View","app/core/templates/navbar"],function(t,e,i,n,a,s,o){"use strict";var r=s.extend({template:o,localTopics:{"router.executing":function(t){this.activateNavItem(this.getModuleNameFromPath(t.req.path))},"socket.connected":function(){this.setConnectionStatus("online")},"socket.connecting":function(){this.setConnectionStatus("connecting")},"socket.connectFailed":function(){this.setConnectionStatus("offline")},"socket.disconnected":function(){this.setConnectionStatus("offline")}},events:{"click .disabled a":function(t){t.preventDefault()},"click .navbar-account-locale":function(t){t.preventDefault(),this.changeLocale(t.currentTarget.getAttribute("data-locale"))},"click .navbar-account-logIn":function(t){t.preventDefault(),this.trigger("logIn")},"click .navbar-account-logOut":function(t){t.preventDefault(),this.trigger("logOut")},"click .navbar-feedback":function(t){t.preventDefault(),t.target.disabled=!0,this.trigger("feedback",function(){t.target.disabled=!1})},"mouseup .btn[data-href]":function(t){if(2!==t.button){var e=t.currentTarget.dataset.href;return t.ctrlKey||1===t.button?window.open(e):window.location.href=e,document.body.click(),!1}}}});return r.DEFAULT_OPTIONS={currentPath:"/",activeItemClassName:"active",offlineStatusClassName:"navbar-status-offline",onlineStatusClassName:"navbar-status-online",connectingStatusClassName:"navbar-status-connecting",loadedModules:{}},r.prototype.initialize=function(){t.defaults(this.options,r.DEFAULT_OPTIONS),this.activeModuleName="",this.navItems=null,this.$activeNavItem=null,this.lastSearchPhrase="",this.activateNavItem(this.getModuleNameFromPath(this.options.currentPath))},r.prototype.beforeRender=function(){this.navItems=null,this.$activeNavItem=null},r.prototype.afterRender=function(){this.selectActiveNavItem(),this.setConnectionStatus(this.socket.isConnected()?"online":"offline"),this.hideNotAllowedEntries(),this.hideEmptyEntries()},r.prototype.serialize=function(){return{idPrefix:this.idPrefix,user:i}},r.prototype.activateNavItem=function(t){t!==this.activeModuleName&&(this.activeModuleName=t,this.selectActiveNavItem())},r.prototype.changeLocale=function(t){e.reload(t)},r.prototype.setConnectionStatus=function(t){if(this.isRendered()){var e=this.$(".navbar-account-status");e.removeClass(this.options.offlineStatusClassName).removeClass(this.options.onlineStatusClassName).removeClass(this.options.connectingStatusClassName),e.addClass(this.options[t+"StatusClassName"]),this.toggleConnectionStatusEntries("online"===t)}},r.prototype.getModuleNameFromLi=function(t,e,i){var n=t.dataset[i?"clientModule":"module"];if(void 0===n&&!e)return null;if(n)return n;var a=t.querySelector("a");if(!a)return null;var s=a.getAttribute("href");return s?this.getModuleNameFromPath(s):null},r.prototype.getModuleNameFromPath=function(t){if("/"!==t[0]&&"#"!==t[0]||(t=t.substr(1)),""===t)return"";var e=t.match(/^([a-z0-9][a-z0-9\-]*[a-z0-9]*)/i);return e?e[1]:null},r.prototype.selectActiveNavItem=function(){if(this.isRendered()){null===this.navItems&&this.cacheNavItems();var e=this.options.activeItemClassName;null!==this.$activeNavItem&&this.$activeNavItem.removeClass(e);var i=this.navItems[this.activeModuleName];t.isUndefined(i)?this.$activeNavItem=null:(i.addClass(e),this.$activeNavItem=i)}},r.prototype.cacheNavItems=function(){this.navItems={},this.$(".nav > li").each(this.cacheNavItem.bind(this))},r.prototype.cacheNavItem=function(t,e){var i=this.$(e);i.hasClass(this.options.activeItemClassName)&&(this.$activeNavItem=i);var n=i.find("a").attr("href");if(n&&"#"===n[0]){var a=this.getModuleNameFromLi(i[0],!0,!0);this.navItems[a]=i}else if(i.hasClass("dropdown")){var s=this;i.find(".dropdown-menu > li").each(function(){var t=s.getModuleNameFromLi(this,!0,!0);s.navItems[t]=i})}},r.prototype.hideNotAllowedEntries=function(){function t(i){if(!i.hasClass("dropdown"))return!0;var a=!0;return i.find("> .dropdown-menu > li").each(function(){var s=i.find(this);if(!e(s)){var o=n(s)&&t(s);s[0].style.display=o?"":"none",a=a||o}}),a}function e(t){return t.hasClass("divider")?(r.push(t),!0):!!t.hasClass("dropdown-header")&&(o.push(t),!0)}function n(t){var e=t.attr("data-loggedin");if("string"==typeof e&&(e="0"!==e)!==s)return!1;var n=a.getModuleNameFromLi(t[0],!1);if(null!==n&&void 0===t.attr("data-no-module")&&!a.options.loadedModules[n])return!1;var o=t.attr("data-privilege");return void 0===o||i.isAllowedTo.apply(i,o.split(" "))}var a=this,s=i.isLoggedIn(),o=[],r=[];this.$(".navbar-nav > li").each(function(){var i=a.$(this);e(i)||(i[0].style.display=n(i)&&t(i)?"":"none")}),o.forEach(function(t){t[0].style.display=a.hasVisibleSiblings(t,"next")?"":"none"}),r.forEach(function(t){t[0].style.display=a.hasVisibleSiblings(t,"prev")&&a.hasVisibleSiblings(t,"next")?"":"none"}),this.$(".btn[data-privilege]").each(function(){this.style.display=i.isAllowedTo.apply(i,this.dataset.privilege.split(" "))?"":"none"})},r.prototype.hasVisibleSiblings=function(t,e){var i=t[e+"All"]().filter(function(){return"none"!==this.style.display});return!!i.length&&!i.first().hasClass("divider")},r.prototype.hideEmptyEntries=function(){var t=this;this.$(".dropdown > .dropdown-menu").each(function(){var e=t.$(this),i=!1;e.children().each(function(){i=i||"none"!==this.style.display}),i||(e.parent()[0].style.display="none")})},r.prototype.toggleConnectionStatusEntries=function(t){var e=this;this.$("li[data-online]").each(function(){var i=e.$(this);if(void 0!==i.attr("data-disabled"))return i.addClass("disabled");switch(i.attr("data-online")){case"show":i[0].style.display=t?"":"none";break;case"hide":i[0].style.display=t?"none":"";break;default:i[t?"removeClass":"addClass"]("disabled")}})},r});