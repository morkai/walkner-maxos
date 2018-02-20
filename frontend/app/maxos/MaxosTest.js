// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../i18n',
  '../time',
  '../core/Model'
], function(
  _,
  t,
  time,
  Model
) {
  'use strict';

  var STATUS_CLASS_NAMES = {
    idle: 'info',
    running: 'warning',
    failure: 'danger',
    success: 'success'
  };

  return Model.extend({

    urlRoot: '/maxos/tests',

    clientUrlRoot: '#maxos/tests',

    topicPrefix: 'maxos',

    privilegePrefix: 'MAXOS',

    nlsDomain: 'maxos',

    getLabel: function()
    {
      var serialNumber = this.get('serialNumber');

      if (!serialNumber)
      {
        var order = this.get('order');

        return order.factoryCode + '.' + order._id + '.????';
      }

      return serialNumber;
    },

    serialize: function()
    {
      var obj = this.toJSON();

      obj.className = STATUS_CLASS_NAMES[obj.status];
      obj.status = t('maxos', 'status:' + obj.status);
      obj.startedAt = time.format(obj.startedAt, 'L, LTS');

      if (obj.finishedAt)
      {
        obj.finishedAt = time.format(obj.finishedAt, 'L, LTS');
        obj.elapsedTime = time.toString(this.getElapsedTime() / 1000);
      }

      if (obj.reason)
      {
        obj.reason = t('maxos', 'message:' + obj.reason, _.last(obj.messages));
      }

      if (obj.order)
      {
        obj.orderNo = obj.order._id;
      }

      if (!obj.itemNumber)
      {
        obj.itemNumber = '';
      }

      return obj;
    },

    serializeDetails: function()
    {
      var obj = this.serialize();
      var serializeMessage = this.constructor.serializeMessage;

      obj.messages = obj.messages.map(function(m) { return serializeMessage(m, 'default'); });

      return obj;
    },

    getElapsedTime: function()
    {
      return Date.parse(this.get('finishedAt')) - Date.parse(this.get('startedAt'));
    },

    getStatusClassName: function()
    {
      return STATUS_CLASS_NAMES[this.attributes.status];
    }

  }, {

    serializeMessage: function(message, defaultSeverity)
    {
      var data = _.clone(message);

      switch (message.key)
      {
        case 'FAILURE':
          data.reason = t.has('maxos', 'message:' + data.reason)
            ? t('maxos', 'message:' + data.reason, data)
            : (data.reason || '?');
          data.error = data.error || '';
          break;
      }

      return {
        date: message.date ? time.format(message.date, 'YYYY-MM-DD, HH:mm:ss.SSS') : '',
        severity: message.severity || defaultSeverity || 'danger',
        text: t('maxos', 'message:' + message.key, data)
      };}

  });
});
