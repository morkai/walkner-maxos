// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/i18n","app/users/UserCollection","app/core/View","app/users/util/setUpUserSelect2","app/alarms/templates/callActionForm"],function(e,t,i,s,r,n,a){"use strict";return r.extend({template:a,events:{"change #-users":"updateUsers"},initialize:function(){this.userIndex=0,this.fieldNamePrefix=(this.options.kind||"start")+"Actions["+this.options.index+"]"},serialize:function(){return{idPrefix:this.idPrefix,actionType:this.options.actionType,fieldNamePrefix:this.fieldNamePrefix}},afterRender:function(){this.setUpUserSelect2()},setUpUserSelect2:function(){var t=this.$id("users");t.val(e.pluck(this.model&&this.model.parameters&&this.model.parameters.users||[],"id").join(",")),n(t,{view:this,multiple:!0,onDataLoaded:this.updateUsers.bind(this)})},updateUsers:function(){this.$('input[name*="users"]').remove(),this.userIndex=0,e.forEach(this.$id("users").select2("data"),function(e){t('<input type="hidden">').attr({name:this.fieldNamePrefix+".parameters.users["+this.userIndex+"].id",value:e.id}).appendTo(this.el),t('<input type="hidden">').attr({name:this.fieldNamePrefix+".parameters.users["+this.userIndex+"].label",value:e.text}).appendTo(this.el),++this.userIndex},this),this.trigger("resize")}})});