// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/i18n","../View","app/core/templates/messages","app/core/templates/message"],function(i,e,t,s,n,a){"use strict";var o=s.extend({template:n,events:{"click .message":function(i){i.currentTarget.parentNode===this.el&&i.currentTarget.getAttribute("data-view")===this.idPrefix&&this.hide(e(i.currentTarget))}},localTopics:{"router.executing":function(){this.hide()}}});return o.prototype.initialize=function(){this.$loadingMessage=null,this.$savingMessage=null,this.loadingTimer=null,this.loadingCounter=0,this.savingTimer=null,this.savingCounter=0,this.hideTimers=[],this.loading=this.loading.bind(this),this.loaded=this.loaded.bind(this),this.saving=this.saving.bind(this),this.saved=this.saved.bind(this)},o.prototype.destroy=function(){this.$loadingMessage=null,null!==this.loadingTimer&&(clearTimeout(this.loadingTimer),this.loadingTimer=null),this.$savingMessage=null,null!==this.savingTimer&&(clearTimeout(this.savingTimer),this.savingTimer=null),this.hideTimers.length>0&&(this.hideTimers.forEach(clearTimeout),this.hideTimers=null),this.$('.message[data-view="'+this.idPrefix+'"]').remove()},o.prototype.show=function(i){var t=e(a({type:i.type||"info",text:i.text}));return this.$el.append(t.attr("data-view",this.idPrefix)),this.moveDown(t),t.attr("data-top",t.position().top).css("margin-left",-t.width()/2+"px"),i.immediate?t.css("opacity",1):t.animate({opacity:1}),this.scheduleHiding(t,i.time),t},o.prototype.hide=function(i,e){if(i){if(i.hasClass("message-hiding"))return;i.addClass("message-hiding")}else i=this.$('.message[data-view="'+this.idPrefix+'"]'),this.$loadingMessage=null;1===i.length&&(this.moveUp(i),this.removeHideTimer(i)),e?i.remove():i.animate({opacity:0},function(){i.remove()})},o.prototype.loading=function(){this.loadingCounter+=1,null===this.loadingTimer&&(this.loadingTimer=setTimeout(this.showLoadingMessage.bind(this),0))},o.prototype.loaded=function(){this.hideLoadingMessage()},o.prototype.loadingFailed=function(e){this.hideLoadingMessage(),this.show({type:"error",time:1e4,text:i.isString(e)?e:t("core","MSG:LOADING_FAILURE")})},o.prototype.showLoadingMessage=function(){this.loadingTimer=null,null===this.$loadingMessage&&(this.$loadingMessage=this.show({type:"warning",text:'<i class="fa fa-spinner fa-spin"></i><span>'+t("core","MSG:LOADING")+"</span>",immediate:!0}))},o.prototype.hideLoadingMessage=function(){this.loadingCounter>0&&--this.loadingCounter,0===this.loadingCounter&&(null!==this.loadingTimer&&(clearTimeout(this.loadingTimer),this.loadingTimer=null),null!==this.$loadingMessage&&(this.hide(this.$loadingMessage),this.$loadingMessage=null))},o.prototype.saving=function(){this.savingCounter+=1,null===this.savingTimer&&(this.savingTimer=setTimeout(this.showSavingMessage.bind(this),0))},o.prototype.saved=function(){this.hideSavingMessage()},o.prototype.savingFailed=function(e){this.hideSavingMessage(),this.show({type:"error",time:1e4,text:i.isString(e)?e:t("core","MSG:SAVING_FAILURE")})},o.prototype.showSavingMessage=function(){this.savingTimer=null,null===this.$savingMessage&&(this.$savingMessage=this.show({type:"warning",text:'<i class="fa fa-spinner fa-spin"></i><span>'+t("core","MSG:SAVING")+"</span>",immediate:!0}))},o.prototype.hideSavingMessage=function(){this.savingCounter>0&&--this.savingCounter,0===this.savingCounter&&(null!==this.savingTimer&&(clearTimeout(this.savingTimer),this.savingTimer=null),null!==this.$savingMessage&&(this.hide(this.$savingMessage),this.$savingMessage=null))},o.prototype.moveDown=function(i){this.moveTopBy(this.$('.message[data-view="'+this.idPrefix+'"]'),i,this.getMoveOffset(i))},o.prototype.moveUp=function(i){this.moveTopBy(i.prevAll(".message"),i,-this.getMoveOffset(i))},o.prototype.moveTopBy=function(i,t,s){i.each(function(){if(this!==t[0]){var i=e(this),n=parseInt(i.attr("data-top"),10)+s;i.attr("data-top",n),i.animate({top:n+"px"})}})},o.prototype.getMoveOffset=function(i){return i.outerHeight()+8},o.prototype.scheduleHiding=function(e,t){if(i.isNumber(t)){t<1e3&&(t=1e3);var s=setTimeout(this.hide.bind(this,e),t);e.data("hideTimer",s),this.hideTimers.push(s)}},o.prototype.removeHideTimer=function(e){var t=e.data("hideTimer");i.isUndefined(t)||(clearTimeout(t),e.data("hideTimer",void 0),this.hideTimers.splice(this.hideTimers.indexOf(t),1))},o});