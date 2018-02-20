// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/user',
  'app/viewport',
  'app/core/Model',
  'app/core/View',
  './LabelPrinterView',
  '../templates/info'
], function(
  _,
  $,
  t,
  time,
  user,
  viewport,
  Model,
  View,
  LabelPrinterView,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {

      'click #-changeOrder': function()
      {
        if (this.model.auth.changeOrder())
        {
          this.trigger('orderSelectRequested');
        }
      },

      'click #-printLabels': function()
      {
        var dialogView = new LabelPrinterView({
          model: this.model
        });

        viewport.showDialog(dialogView, t('maxos', 'labelPrinter:title'));
      }

    },

    initialize: function()
    {
      this.listenTo(this.model.tags, 'reset', this.render);
      this.listenTo(this.model.tags, 'change:value', this.onTagValueChange);
    },

    serialize: function()
    {
      var state = this.model.tags.getValue('program.state');

      return {
        idPrefix: this.idPrefix,
        canChangeOrder: this.model.auth.changeOrder(),
        canPrintLabels: this.model.auth.printLabels(),
        state: state,
        info: this.serializeInfo()
      };
    },

    serializeInfo: function()
    {
      var tags = this.model.tags;
      var order = tags.getValue('program.order');
      var quantityDone = tags.getValue('program.quantityDone') || 0;

      return {
        orderNo: order ? order._id : t('maxos', 'info:selectOrder'),
        materialNumber: order && order.materialNumber || '-',
        productName: order && order.productName || '-',
        quantity: order ? (quantityDone + '/' + (order.quantityInOrder || '-')) : '-/-',
        lastSerialNumber: tags.getValue('program.lastSerialNumber') || '-'
      };
    },

    onTagValueChange: function(tag)
    {
      switch (tag.id)
      {
        case 'program.order':
        case 'program.quantityDone':
        case 'program.lastSerialNumber':
          return this.render();

        case 'program.state':
          return this.updateState();
      }
    },

    updateState: function()
    {
      this.$id('changeOrder').toggleClass('disabled', !this.model.auth.changeOrder());

      this.el.dataset.state = this.model.tags.getValue('program.state');
    }

  });
});
