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
  'app/maxos/templates/orderSelector'
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

    template: template,

    events: {

      submit: function()
      {
        this.order.cables = parseInt(this.$('input[name="cables"]:checked').val(), 10) || 0;
        this.order.connectors = parseInt(this.$('input[name="connectors"]:checked').val(), 10) || 0;
        this.order.cores = parseInt(this.$('input[name="cores"]:checked').val(), 10) || 0;

        if (this.order.cables === -1 || (this.order.cables && this.order.connectors && this.order.cores))
        {
          this.trigger('orderSelected', this.order);
        }

        return false;
      },

      'focus #-orderNo': function(e)
      {
        this.vkb.show(e.currentTarget, this.onVkbValueChange);
      },

      'input #-orderNo': function()
      {
        this.onVkbValueChange();
      },

      'click #-recentOrders > .btn': function(e)
      {
        this.$id('orderNo').val(e.currentTarget.textContent.trim());
        this.onVkbValueChange();
      },

      'change input[name="cables"]': function()
      {
        var unwired = this.$('input[name="cables"]:checked').val() === '-1';

        this.$('input[name="connectors"]').prop('disabled', unwired).filter(':checked').prop('checked', false);
        this.$('input[name="cores"]').prop('disabled', unwired).filter(':checked').prop('checked', false);
      }

    },

    initialize: function()
    {
      this.onVkbValueChange = this.onVkbValueChange.bind(this);

      this.specialOrderSet = false;

      this.vkb = new VkbView();
    },

    destroy: function()
    {
      this.vkb.hide();
      this.vkb.remove();
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix
      };
    },

    afterRender: function()
    {
      this.vkb.render().$el.appendTo('body');

      this.$('input[type="radio"]').prop('disabled', true);
      this.$('.btn-primary').prop('disabled', true);
      this.$id('orderNo').focus();

      this.findRecentOrders();
    },

    onVkbValueChange: function()
    {
      var orderNo = this.$id('orderNo').val().replace(/[^0-9]+/g, '');

      if (!this.specialOrderSet && orderNo === '00')
      {
        this.specialOrderSet = true;

        orderNo = '000000000';

        this.$id('orderNo').val(orderNo)[0].selectionStart = 10;
      }

      if (orderNo.length !== 9)
      {
        this.order = null;
      }
      else
      {
        this.order = null;

        this.findOrder(orderNo);
      }

      this.toggleInputs();
    },

    toggleInputs: function()
    {
      var $radios = this.$('input[type="radio"]').prop('disabled', true);
      var $submit = this.$('.btn-primary').prop('disabled', true);

      if (!this.order)
      {
        return;
      }

      $submit.prop('disabled', false);

      if (this.$id('orderNo').val() === '000000000' || this.model.auth.changeConfig())
      {
        ['cables', 'connectors', 'cores'].forEach(function(name)
        {
          $radios.filter('[name="' + name + '"]').prop('disabled', false);
        });
      }
    },

    findOrder: function(orderNo)
    {
      var view = this;
      var $orderNo = view.$id('orderNo').prop('disabled', true);

      viewport.msg.hide(null, true);
      viewport.msg.loading();

      view.vkb.hide();

      var req = view.ajax({url: '/maxos/order/' + orderNo});

      req.fail(function()
      {
        if (req.status === 404)
        {
          viewport.msg.loaded();
          viewport.msg.show({
            type: 'error',
            time: 2500,
            text: t('maxos', 'orderSelector:notFound')
          });
        }
        else
        {
          viewport.msg.loadingFailed();
        }
      });

      req.done(function(order)
      {
        viewport.msg.loaded();

        view.order = order;

        view.$('input:checked').prop('checked', false);

        view.$('input[name="cables"][value="' + order.cables + '"]').prop('checked', true);
        view.$('input[name="connectors"][value="' + order.connectors + '"]').prop('checked', true);
        view.$('input[name="cores"][value="' + order.cores + '"]').prop('checked', true);

        view.toggleInputs();
      });

      req.always(function()
      {
        var orderNoEl = $orderNo.prop('disabled', false).focus()[0];

        orderNoEl.selectionStart = orderNoEl.selectionEnd = orderNoEl.value.length;
      });
    },

    findRecentOrders: function()
    {
      var req = this.ajax({url: '/maxos/recentOrders'});
      var $recentOrders = this.$id('recentOrders');

      req.done(function(recentOrders)
      {
        $recentOrders.append(
          recentOrders
            .map(function(orderNo) { return '<div class="btn btn-default">' + orderNo + '</div>'; })
            .join('')
        );

        if (recentOrders.length)
        {
          $recentOrders.removeClass('hidden');
        }
      });
    }

  });
});
