// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FilterView',
  'app/users/templates/filter'
], function(
  FilterView,
  filterTemplate
) {
  'use strict';

  return FilterView.extend({

    template: filterTemplate,

    defaultFormData: {
      login: '',
      lastName: ''
    },

    termToForm: {
      'login': function(propertyName, term, formData)
      {
        if (term.name === 'regex')
        {
          formData[propertyName] = term.args[1].replace('^', '');
        }
      },
      'lastName': 'login'
    },

    serializeFormToQuery: function(selector)
    {
      var login = this.$id('login').val().trim();
      var lastName = this.$id('lastName').val().trim();

      if (login.length)
      {
        selector.push({name: 'regex', args: ['login', '^' + login, 'i']});
      }

      if (lastName.length)
      {
        selector.push({name: 'regex', args: ['lastName', '^' + lastName, 'i']});
      }
    }

  });
});
