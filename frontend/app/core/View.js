// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'backbone.layout',
  'app/broker',
  'app/socket',
  'app/pubsub',
  './util'
],
function(
  _,
  $,
  Layout,
  broker,
  socket,
  pubsub,
  util
) {
  'use strict';

  function View(options)
  {
    var view = this;

    view.idPrefix = _.uniqueId('v');

    view.options = options || {};

    view.timers = {};

    view.promises = [];

    _.forEach(view.sections, function(selector, section)
    {
      if (typeof selector !== 'string' || selector === '#')
      {
        view.sections[section] = '#' + view.idPrefix + '-' + section;
      }
      else
      {
        view.sections[section] = selector.replace('#-', '#' + view.idPrefix + '-');
      }
    });

    util.defineSandboxedProperty(view, 'broker', broker);
    util.defineSandboxedProperty(view, 'pubsub', pubsub);
    util.defineSandboxedProperty(view, 'socket', socket);

    Layout.call(view, options);

    util.subscribeTopics(view, 'broker', view.localTopics, true);
    util.subscribeTopics(view, 'pubsub', view.remoteTopics, true);
  }

  util.inherits(View, Layout);

  View.prototype.delegateEvents = function(events)
  {
    if (!events)
    {
      events = _.result(this, 'events');
    }

    if (!events)
    {
      return this;
    }

    this.undelegateEvents();

    Object.keys(events).forEach(function(key)
    {
      var method = events[key];

      if (!_.isFunction(method))
      {
        method = this[method];
      }

      if (!_.isFunction(method))
      {
        return;
      }

      var match = key.match(/^(\S+)\s*(.*)$/);
      var eventName = match[1] + '.delegateEvents' + this.cid;
      var selector = match[2];

      if (selector === '')
      {
        this.$el.on(eventName, method.bind(this));
      }
      else
      {
        if (_.isString(this.idPrefix))
        {
          selector = selector.replace(/#-/g, '#' + this.idPrefix + '-');
        }

        this.$el.on(eventName, selector, method.bind(this));
      }
    }, this);
  };

  View.prototype.getViews = function(fn)
  {
    if (typeof fn === 'string' && /^#-/.test(fn))
    {
      fn = fn.replace('#-', '#' + this.idPrefix + '-');
    }

    return Layout.prototype.getViews.call(this, fn);
  };

  View.prototype.setView = function(name, view, insert, insertOptions)
  {
    if (typeof name === 'string' && /^#-/.test(name))
    {
      name = name.replace('#-', '#' + this.idPrefix + '-');
    }

    return Layout.prototype.setView.call(this, name, view, insert, insertOptions);
  };

  View.prototype.cleanup = function()
  {
    this.trigger('cleanup', this);

    this.destroy();
    this.cleanupSelect2();

    util.cleanupSandboxedProperties(this);

    if (_.isObject(this.timers))
    {
      _.each(this.timers, clearTimeout);

      this.timers = null;
    }

    this.cancelRequests();
  };

  View.prototype.destroy = function() {};

  View.prototype.cleanupSelect2 = function()
  {
    var view = this;

    this.$('.select2-container').each(function()
    {
      view.$('#' + this.id.replace('s2id_', '')).select2('destroy');
    });
  };

  View.prototype.beforeRender = function() {};

  View.prototype.serialize = function()
  {
    return {idPrefix: this.idPrefix};
  };

  View.prototype.afterRender = function() {};

  View.prototype.isRendered = function()
  {
    return this.hasRendered === true;
  };

  View.prototype.isDetached = function()
  {
    return !$.contains(document.documentElement, this.el);
  };

  View.prototype.ajax = function(options)
  {
    return this.promised($.ajax(options));
  };

  View.prototype.promised = function(promise)
  {
    if (!promise || !_.isFunction(promise.abort))
    {
      return promise;
    }

    this.promises.push(promise);

    var view = this;

    promise.always(function()
    {
      if (Array.isArray(view.promises))
      {
        view.promises.splice(view.promises.indexOf(promise), 1);
      }
    });

    return promise;
  };

  View.prototype.cancelRequests = function()
  {
    this.promises.forEach(function(promise) { promise.abort(); });

    this.promises = [];
  };

  View.prototype.cancelAnimations = function(clearQueue, jumpToEnd)
  {
    this.$el.stop(clearQueue !== false, jumpToEnd !== false);
    this.$(':animated').stop(clearQueue !== false, jumpToEnd !== false);
  };

  View.prototype.$id = function(idSuffix)
  {
    var id = '#';

    if (_.isString(this.idPrefix))
    {
      id += this.idPrefix + '-';
    }

    return $(id + idSuffix);
  };

  return View;
});
