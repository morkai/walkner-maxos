// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/util/fixTimeRange',
  'app/core/views/FilterView',
  'app/maxos/templates/filter'
], function(
  _,
  fixTimeRange,
  FilterView,
  template
) {
  'use strict';

  return FilterView.extend({

    template: template,

    events: _.assign({

      'input #-itemNumber': 'toggleItemNumber',

      'mouseup #-status > .btn': function(e)
      {
        var labelEl = e.currentTarget;
        var radioEl = labelEl.firstElementChild;

        if (radioEl.checked)
        {
          setTimeout(function()
          {
            labelEl.classList.remove('active');
            radioEl.checked = false;
          }, 1);
        }
      }

    }, FilterView.prototype.events),

    defaultFormData: {
      status: '',
      startedAt: '',
      orderNo: '',
      itemNumber: ''
    },

    termToForm: {
      'startedAt': function(propertyName, term, formData)
      {
        fixTimeRange.toFormData(formData, term, 'date+time');
      },
      'order._id': function(propertyName, term, formData)
      {
        formData.orderNo = term.args[1];
      },
      'itemNumber': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      },
      'status': 'itemNumber'
    },

    serializeFormToQuery: function(selector)
    {
      var status = this.getButtonGroupValue('status');
      var timeRange = fixTimeRange.fromView(this);
      var orderNo = this.$id('orderNo').val().trim();
      var itemNumber = this.$id('itemNumber').val().trim();

      if (status)
      {
        selector.push({name: 'eq', args: ['status', status]});
      }

      if (timeRange.from)
      {
        selector.push({name: 'ge', args: ['startedAt', timeRange.from]});
      }

      if (timeRange.to)
      {
        selector.push({name: 'le', args: ['startedAt', timeRange.to]});
      }

      if (orderNo.length)
      {
        selector.push({name: 'eq', args: ['order._id', orderNo]});
      }

      if (itemNumber.length)
      {
        selector.push({name: 'eq', args: ['itemNumber', +itemNumber]});
      }
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.apply(this, arguments);

      this.toggleButtonGroup('status');
      this.toggleItemNumber();
    },

    toggleItemNumber: function()
    {
      this.$id('orderNo').prop('required', this.$id('itemNumber').val().length > 0);
    }

  });
});
