// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

define(["jquery","backbone","bootstrap","select2"],function(t,o){"use strict";var e=o.sync;o.sync=function(t,o,n){return n.syncMethod=t,e.call(this,t,o,n)},t.fn.modal.Constructor.prototype.enforceFocus=function(){},t.fn.modal.Constructor.prototype.escape=function(){this.isShown&&this.options.keyboard?this.$element.on("keydown.dismiss.bs.modal",t.proxy(function(t){27===t.which&&this.hide()},this)):this.isShown||this.$element.off("keydown.dismiss.bs.modal")},t.fn.modal.Constructor.prototype.checkScrollbar=function(){this.bodyIsOverflowing=document.body.scrollHeight>document.documentElement.clientHeight||"scroll"===t(document.body).css("overflow-y"),this.scrollbarWidth=this.measureScrollbar()},t.fn.popover.Constructor.prototype.hasContent=function(){return!0===this.options.hasContent||!!this.getTitle()||!!this.getContent()};var n=t(document.body);return t.fn.select2.defaults.dropdownContainer=function(t){var o=t.container.closest(".modal-body");if(0===o.length)return n;var e=o.closest(".modal-dialog");return 0===e.length?n:e},n.on("click","label[for]",function(o){var e=t("#"+o.target.htmlFor);e.data("select2")&&!e.parent().hasClass("has-required-select2")&&e.select2("focus")}),{}});