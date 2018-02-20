// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/user',
  'app/viewport',
  'app/core/View',
  'app/data/controller',
  '../views/InfoView',
  '../views/IndicatorsView',
  '../views/MessageView',
  '../views/OrderSelectorView',
  '../templates/dashboard'
], function(
  t,
  user,
  viewport,
  View,
  controller,
  InfoView,
  IndicatorsView,
  MessageView,
  OrderSelectorView,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    layoutName: 'blank',

    events: {
      'mousedown .btn[data-parent-action]': function(e) { this.startActionTimer(e); },
      'touchstart .btn[data-parent-action]': function(e) { this.startActionTimer(e); },
      'mouseup .btn[data-parent-action]': function(e) { this.stopActionTimer(e); },
      'touchend .btn[data-parent-action]': function(e) { this.stopActionTimer(e); }
    },

    initialize: function()
    {
      this.actionTimer = {
        action: null,
        time: null
      };

      this.infoView = new InfoView({model: controller});
      this.indicatorsView = new IndicatorsView({model: controller});
      this.messageView = new MessageView({model: controller});

      this.listenTo(this.infoView, 'orderSelectRequested', this.onOrderSelectRequested);
      this.listenTo(this.messageView, 'orderSelectRequested', this.onOrderSelectRequested);

      this.once('afterRender', function()
      {
        if (window.parent !== window)
        {
          window.parent.postMessage({type: 'ready', app: 'maxos'}, '*');
        }
      });

      this.setView('#-info', this.infoView);
      this.setView('#-indicators', this.indicatorsView);
      this.setView('#-message', this.messageView);

      this.timers.checkSync = setInterval(this.checkSync.bind(this), 10000);
    },

    destroy: function()
    {
      document.body.style.overflow = '';
      document.querySelector('.modal').classList.add('fade');
    },

    load: function(when)
    {
      return when(controller.load());
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        embedded: window.parent !== window
      };
    },

    afterRender: function()
    {
      document.body.style.overflow = 'hidden';
      document.querySelector('.modal').classList.remove('fade');
    },

    onOrderSelectRequested: function()
    {
      var dialogView = new OrderSelectorView({
        model: controller
      });

      this.listenTo(dialogView, 'orderSelected', function(order)
      {
        viewport.closeDialog();
        controller.tags.setValue('program.order', order);
      });

      viewport.showDialog(dialogView, t('maxos', 'orderSelector:title'));
    },

    startActionTimer: function(e)
    {
      this.actionTimer.action = e.currentTarget.dataset.parentAction;
      this.actionTimer.time = Date.now();

      e.preventDefault();
    },

    stopActionTimer: function(e)
    {
      var action = e.currentTarget.dataset.parentAction;

      if (this.actionTimer.action !== action)
      {
        return;
      }

      var long = (Date.now() - this.actionTimer.time) > 3000;

      if (action === 'goToResults')
      {
        window.location.href = '#maxos/tests';
      }
      else if (action === 'switchApps')
      {
        if (long)
        {
          window.parent.postMessage({type: 'config'}, '*');
        }
        else
        {
          window.parent.postMessage({type: 'switch', app: 'maxos'}, '*');
        }
      }
      else if (action === 'reboot')
      {
        if (long)
        {
          window.parent.postMessage({type: 'reboot'}, '*');
        }
        else
        {
          window.parent.postMessage({type: 'refresh'}, '*');
        }
      }
      else if (long && action === 'shutdown')
      {
        window.parent.postMessage({type: 'shutdown'}, '*');
      }

      this.actionTimer.action = null;
      this.actionTimer.time = null;
    },

    isReloadNeeded: function()
    {
      return this.socket.isConnected() && !controller.tags.getValue('program.message');
    },

    checkSync: function()
    {
      clearTimeout(this.timers.reload);

      if (this.isReloadNeeded())
      {
        this.timers.reload = setTimeout(this.reloadIfNeeded.bind(this), 3333);
      }
    },

    reloadIfNeeded: function()
    {
      if (this.isReloadNeeded())
      {
        window.location.reload();
      }
    }

  });
});
