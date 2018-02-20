// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/user',
  'app/viewport',
  'app/core/View',
  'app/core/views/VkbView',
  '../templates/labelPrinter'
], function(
  _,
  $,
  t,
  time,
  user,
  viewport,
  View,
  VkbView,
  template
) {
  'use strict';

  return View.extend({

    dialogClassName: 'maxos-labelPrinter-dialog',

    template: template,

    events: {

      submit: function()
      {
        var view = this;

        view.vkb.hide();

        view.el.classList.add('in-progress');

        view.$('input, .btn').prop('disabled', true);

        var req = view.ajax({
          method: 'POST',
          url: '/maxos/printLabels',
          data: JSON.stringify({
            orderNo: this.$id('orderNo').val(),
            items: this.$id('items').val(),
            kinds: this.$('input[name="kinds"]:checked').map(function() { return this.value; }).get()
          })
        });

        req.fail(function()
        {
          var json = req.responseJSON;
          var error = json && json.error && json.error;

          if (!error || !t.has('maxos', 'labelPrinter:error:' + error.message))
          {
            error = {message: 'FAILURE'};
          }

          viewport.msg.hide();
          viewport.msg.show({
            type: req.status >= 400 && req.status < 500 ? 'warning' : 'error',
            time: 3000,
            text: t('maxos', 'labelPrinter:error:' + error.message, error)
          });

          view.el.classList.remove('in-progress');

          view.$('input, .btn').prop('disabled', false);
          view.$id('todo').text(0);
          view.$id('done').text(0);
        });

        req.done(function(res)
        {
          view.commId = res.commId;

          view.$id('todo').text(res.labelCount.toLocaleString());
        });

        return false;
      },

      'focus [data-vkb]': function(e)
      {
        this.vkb.show(e.currentTarget, this.onVkbValueChange);
      },

      'input [data-vkb]': function(e)
      {
        this.onVkbValueChange(e.currentTarget);

        this.$id('submit').prop('disabled', false).removeClass('btn-success').addClass('btn-primary');
        this.$id('todo').text(0);
        this.$id('done').text(0);
      },

      'change [name="kinds"]': function()
      {
        this.toggleKinds();
      },

      'blur #-items': function()
      {
        var $items = this.$id('items');
        var items = $items.val().split(/[, ]/).map(function(part)
        {
          part = part.replace(/[^0-9\-]+/g, '');

          if (/^[0-9]{1,4}$/.test(part))
          {
            return part;
          }
          else if (/^[0-9]{1,4}-[0-9]{1,4}$/.test(part))
          {
            var fromTo = part.split('-').map(function(n) { return +n; });
            var from = fromTo[0];
            var to = fromTo[1];

            if (from === to)
            {
              return from;
            }
            else if (from < to)
            {
              return from + '-' + to;
            }
          }

          return '';
        }).filter(function(part) { return part.length > 0; });

        $items.val(items.join(','));
      }

    },

    remoteTopics: {

      'maxos.labels.printed': function(message)
      {
        if (this.commId !== message.commId)
        {
          return;
        }

        this.$id('todo').text(message.todo.toLocaleString());
        this.$id('done').text(message.done.toLocaleString());

        if (message.done !== message.todo)
        {
          return;
        }

        this.commId = null;

        this.el.classList.remove('in-progress');

        this.$('input, .btn-link').prop('disabled', false);
        this.$id('submit').removeClass('btn-primary').addClass('btn-success');
      }

    },

    initialize: function()
    {
      this.onVkbValueChange = this.onVkbValueChange.bind(this);

      this.commId = null;

      this.vkb = new VkbView();
    },

    destroy: function()
    {
      this.vkb.hide();
      this.vkb.remove();
    },

    serialize: function()
    {
      var sn = (this.model.tags.getValue('program.lastSerialNumber') || '').split('.');

      return {
        idPrefix: this.idPrefix,
        orderNo: sn.length === 3 ? sn[1] : '',
        items: sn.length === 3 ? sn[2].replace(/^0+/, '') : ''
      };
    },

    afterRender: function()
    {
      this.vkb.render().$el.appendTo('body');

      var submitEl = this.$id('submit')[0];

      this.$id('progressBar').css({
        top: submitEl.offsetTop + 'px',
        left: submitEl.offsetLeft + 'px',
        width: submitEl.offsetWidth + 'px',
        height: submitEl.offsetHeight + 'px'
      });

      this.$id('orderNo').focus()[0].selectionStart = 9;
    },

    onVkbValueChange: function()
    {

    },

    toggleKinds: function()
    {
      this.$('[name="kinds"]').prop('required', this.$('[name="kinds"]:checked').length === 0);
    }

  });
});
