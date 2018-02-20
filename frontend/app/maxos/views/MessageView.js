// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  '../MaxosTest',
  '../templates/message'
], function(
  View,
  MaxosTest,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {

      click: function()
      {
        var message = this.model.tags.getValue('program.message');

        if (message && message.key === 'NO_ORDER')
        {
          this.trigger('orderSelectRequested');
        }
        else if (this.model.tags.getValue('program.state') !== 'idle')
        {
          this.model.tags.setValue('program.cancelled', true);
        }
      }

    },

    localTopics: {

      'socket.disconnected': 'render'

    },

    initialize: function()
    {
      this.listenTo(this.model.tags, 'reset', this.render);
      this.listenTo(this.model.tags, 'change:value', this.onTagValueChange);
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        message: this.serializeMessage()
      };
    },

    serializeMessage: function()
    {
      if (!this.socket.isConnected())
      {
        return MaxosTest.serializeMessage({key: 'DISCONNECTED'});
      }

      return MaxosTest.serializeMessage(
        this.model.tags.getValue('program.message') || {key: 'UNKNOWN'},
        this.model.test.getStatusClassName()
      );
    },

    onTagValueChange: function(tag)
    {
      switch (tag.id)
      {
        case 'program.message':
          return this.render();
      }
    }

  });
});
