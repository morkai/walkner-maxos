// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/i18n',
  'app/core/views/ListView',
  'app/events/templates/list'
], function(
  _,
  time,
  t,
  ListView,
  listTemplate
) {
  'use strict';

  return ListView.extend({

    template: listTemplate,

    remoteTopics: {
      'events.saved': 'refreshCollection'
    },

    serialize: function()
    {
      var view = this;

      return {
        events: this.collection.map(function(event)
        {
          var type = event.get('type');
          var data = view.prepareData(type, event.get('data'));

          return {
            severity: event.getSeverityClassName(),
            time: time.format(event.get('time'), 'lll'),
            user: event.get('user'),
            type: t('events', 'TYPE:' + type),
            text: t('events', 'TEXT:' + type, t.flatten(data))
          };
        })
      };
    },

    refreshCollection: function(events, force)
    {
      if (typeof this.options.filter === 'function'
        && Array.isArray(events)
        && !events.some(this.options.filter))
      {
        return;
      }

      return ListView.prototype.refreshCollection.call(this, events, force);
    },

    prepareData: function(type, data)
    {
      if (data.$prepared)
      {
        return data;
      }

      data.$prepared = true;

      if (data.date)
      {
        data.date = time.format(data.date, 'YYYY-MM-DD');
      }

      if (data.timestamp)
      {
        data.timestamp = time.format(data.timestamp, 'YYYY-MM-DD, HH:mm:ss');
      }

      switch (type)
      {
        case 'controller.settingChanged':
        case 'controller.tagValueChanged':
        {
          data.oldValue = this.formatTagValue(data.oldValue);
          data.newValue = this.formatTagValue(data.newValue);
        }
      }

      return data;
    },

    formatTagValue: function(value)
    {
      if (value == null)
      {
        return 'NULL';
      }

      if (typeof value === 'object')
      {
        value = JSON.stringify(value);
      }
      else
      {
        value = String(value);
      }

      return value.substring(0, 30) + (value.length > 30 ? '...' : '');
    }

  });
});
