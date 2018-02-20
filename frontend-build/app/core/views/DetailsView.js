// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

define(["../View","../util/onModelDeleted"],function(e,i){"use strict";return e.extend({remoteTopics:function(){var e={},i=this.model.getTopicPrefix();return e[i+".edited"]="onModelEdited",e[i+".deleted"]="onModelDeleted",e},serialize:function(){return{idPrefix:this.idPrefix,model:this.serializeDetails(this.model)}},serializeDetails:function(e){return"function"==typeof e.serializeDetails?e.serializeDetails():"function"==typeof e.serialize?e.serialize():e.toJSON()},beforeRender:function(){this.stopListening(this.model,"change",this.render)},afterRender:function(){this.listenToOnce(this.model,"change",this.render)},onModelEdited:function(e){var i=e.model;i&&i._id===this.model.id&&this.model.set(i)},onModelDeleted:function(e){i(this.broker,this.model,e)}})});