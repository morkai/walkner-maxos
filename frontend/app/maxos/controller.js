// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  '../broker',
  '../pubsub',
  '../user',
  '../tags/TagCollection',
  './MaxosTest'
], function(
  _,
  $,
  broker,
  pubsub,
  user,
  TagCollection,
  MaxosTest
) {
  'use strict';

  var pendingTagChanges = [];
  var pendingTestChanges = [];
  var controller = {};

  controller.auth = {

    isEmbedded: function()
    {
      return window !== window.parent && window.navigator.userAgent.indexOf('X11; Linux') !== -1;
    },

    changeOrder: function()
    {
      return controller.tags.getValue('program.state') === 'idle'
        && (this.isEmbedded() || user.isAllowedTo('MAXOS:MANAGE:CHANGE_ORDER'));
    },

    changeConfig: function()
    {
      return this.changeOrder() && user.isAllowedTo('MAXOS:MANAGE:CHANGE_CONFIG');
    },

    printLabels: function()
    {
      return this.isEmbedded() || user.isAllowedTo('MAXOS:MANAGE:PRINT_LABELS');
    }

  };

  controller.tags = new TagCollection([], {paginate: false});

  controller.test = new MaxosTest(null, {url: '/maxos/test'});

  controller.test.on('sync', function()
  {
    pendingTestChanges.forEach(function(changes)
    {
      if (Date.parse(changes.updatedAt) > Date.parse(controller.test.get('updatedAt')))
      {
        controller.test.set(changes);
      }
    });
    pendingTestChanges = [];
  });
  controller.test.on('error', function()
  {
    pendingTestChanges = [];
  });

  controller.loaded = false;
  controller.loading = null;
  controller.load = function()
  {
    if (controller.loaded)
    {
      return $.Deferred().resolve().promise(); // eslint-disable-line new-cap
    }

    if (controller.loading)
    {
      return controller.loading;
    }

    return load();
  };

  function load()
  {
    if (controller.loading)
    {
      return;
    }

    var tagsReq = $.ajax({url: _.result(controller.tags, 'url')}).done(function(res) { resetTags(res.collection);});
    var testReq = controller.test.fetch();

    controller.loading = $.when(tagsReq, testReq);

    controller.loading.done(function()
    {
      controller.loaded = true;
    });

    controller.loading.always(function()
    {
      controller.loading = null;
    });

    return controller.loading;
  }

  function resetTags(newTags)
  {
    var changes = {};
    var silent = {silent: true};

    if (controller.tags.length === 0 || Object.keys(newTags).length !== controller.tags.length)
    {
      controller.tags.reset(newTags, silent);

      _.forEach(newTags, function(newTag)
      {
        changes[newTag.name] = newTag.value;
      });
    }
    else
    {
      _.forEach(newTags, function(newTag)
      {
        var oldTag = controller.tags.get(newTag.name);
        var oldValue;

        if (oldTag)
        {
          oldValue = oldTag.get('value');
          oldTag.set(newTag, silent);
        }
        else
        {
          controller.tags.add(newTag, silent);
        }

        if (newTag.value !== oldValue)
        {
          changes[newTag.name] = newTag.value;
        }
      });
    }

    _.forEach(pendingTagChanges, function(pendingChange)
    {
      var changeTime = pendingChange.time;

      _.forEach(pendingTagChanges.newValues, function(newValue, tagName)
      {
        var tag = controller.tags.get(tagName);

        if (tag && changeTime > tag.get('lastChangeTime'))
        {
          tag.set({
            lastChangeTime: changeTime,
            value: newValue
          }, silent);

          changes[tagName] = newValue;
        }
      });
    });

    pendingTagChanges = [];

    controller.tags.trigger('reset');

    if (!_.isEmpty(changes))
    {
      broker.publish('controller.valuesChanged', changes);
    }
  }

  broker.subscribe('socket.connected', function() { load(); });

  pubsub.subscribe('controller.tagsChanged', function(tags) { resetTags(tags); });

  pubsub.subscribe('controller.tagValuesChanged', function(newValues)
  {
    if (controller.loading)
    {
      pendingTagChanges.push({
        time: newValues['@timestamp'],
        newValues: newValues
      });

      return;
    }

    var changes = {};

    _.forEach(newValues, function(newValue, tagName)
    {
      var tag = controller.tags.get(tagName);

      if (tag && !_.isEqual(newValue, tag.get('value')))
      {
        tag.set('value', newValue);
        changes[tagName] = newValue;
      }
    });

    if (!_.isEmpty(changes))
    {
      broker.publish('controller.valuesChanged', changes);
    }
  });

  pubsub.subscribe('maxos.test.updated', function(changes)
  {
    if (controller.loading)
    {
      pendingTestChanges.push(changes);
    }
    else
    {
      controller.test.set(changes);
    }
  });

  return controller;
});
