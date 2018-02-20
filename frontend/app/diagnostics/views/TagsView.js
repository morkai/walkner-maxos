// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-hydro project <http://lukasz.walukiewicz.eu/p/walkner-hydro>

define([
  'underscore',
  'jquery',
  'app/time',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/diagnostics/templates/tags',
  'i18n!app/nls/diagnostics'
], function(
  _,
  $,
  time,
  t,
  viewport,
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'click .tag-value': function(e)
      {
        this.setTagValue(this.$(e.currentTarget));
      }
    },

    initialize: function()
    {
      this.listenTo(this.model, 'add remove reset', this.render);
      this.listenTo(this.model, 'change:value', this.updateState);
    },

    serialize: function()
    {
      var formatValue = this.formatValue.bind(this);

      return {
        tags: this.model.map(function(tag)
        {
          tag = tag.toJSON();
          tag.value = formatValue(tag.value, tag.type);

          if (tag.unit === null || tag.unit === -1)
          {
            tag.unit = '-';
          }

          if (tag.address === null || tag.address === -1)
          {
            tag.address = '-';
          }

          return tag;
        })
      };
    },

    updateState: function(tag)
    {
      var $tagValue = this.$('tr[data-tag="' + tag.id + '"] .tag-value');

      if ($tagValue.length === 0 || $tagValue.is('.tag-changing'))
      {
        return;
      }

      $tagValue.removeClass('highlight');
      $tagValue.text(this.formatValue(tag.get('value'), tag.get('type')));

      _.defer(function() { $tagValue.addClass('highlight'); });
    },

    formatValue: function(value, type)
    {
      switch (type)
      {
        case 'time':
          return time.format(value || 0, 'YYYY-MM-DD HH:mm:ss');

        case 'object':
        {
          if (value == null)
          {
            return '?';
          }

          var str = JSON.stringify(value);

          if (str.length > 40)
          {
            return str.substring(0, 35) + '...';
          }

          return str;
        }

        default:
          return value == null ? '?' : String(value);
      }
    },

    setTagValue: function($tagValue)
    {
      if ($tagValue.hasClass('tag-changing') || $tagValue.hasClass('tag-not-writable'))
      {
        return;
      }

      $tagValue.addClass('tag-changing');

      var tagName = $tagValue.closest('tr').attr('data-tag');
      var tag = this.model.get(tagName);

      if (tag.get('type') === 'bool')
      {
        this.setBoolValue($tagValue, tagName, !tag.get('value'));
      }
      else
      {
        this.showEditor(tag, $tagValue);
      }
    },

    setBoolValue: function($tagValue, tagName, newValue)
    {
      var view = this;

      view.model.setValue(tagName, newValue, function(err)
      {
        if (err)
        {
          view.showErrorMessage(err, tagName, newValue);
        }

        $tagValue.removeClass('tag-changing');
      });
    },

    showEditor: function(tag, $tagValue)
    {
      var view = this;
      var object = tag.get('type') === 'object';
      var oldValue = tag.get('value');
      var pos = $tagValue.position();
      var $form = $('<form class="input-group"></form>')
        .css({
          position: 'absolute',
          top: pos.top + 4 + 'px',
          left: pos.left + 4 + 'px',
          width: object ? '600px' : ($tagValue.outerWidth() + 'px')
        });
      var $value = $(object
        ? '<textarea class="form-control" name="value" rows="6" cols="50"></textarea>'
        : '<input class="form-control" name="value" type="text">');

      $form.append($value.val(object ? JSON.stringify(oldValue || null, null, 2) : oldValue));
      $form.append('<span class="input-group-btn"><input class="btn btn-primary" type="submit" value="&gt;"></span>');

      $form.submit(function()
      {
        var rawValue = $value.val().trim();
        var newValue;

        if (/^[0-9]+$/.test(rawValue))
        {
          newValue = parseInt(rawValue, 10);
        }
        else if (/^[0-9]+\.[0-9]+$/.test(rawValue))
        {
          newValue = parseFloat(rawValue);
        }
        else if (tag.get('type') === 'object')
        {
          try
          {
            newValue = JSON.parse(rawValue);
          }
          catch (err)
          {
            newValue = oldValue;
          }
        }
        else
        {
          newValue = rawValue;
        }

        var tagName = tag.get('name');

        view.model.setValue(tagName, newValue, function(err)
        {
          if (err)
          {
            view.showErrorMessage(err, tagName, newValue);
          }

          $tagValue.removeClass('tag-changing');
        });

        $form.fadeOut(function() { $form.remove(); });

        return false;
      });

      $value.on('keyup', function(e)
      {
        if (e.which === 27)
        {
          $tagValue.removeClass('tag-changing');

          $form.fadeOut(function() { $form.remove(); });

          return false;
        }
      });

      $tagValue.append($form);

      $value.select();
    },

    showErrorMessage: function(err, tagName, value)
    {
      viewport.msg.show({
        time: 3000,
        type: 'error',
        text: t('diagnostics', 'TAG_WRITE_FAILED', {
          tag: tagName,
          value: value,
          reason: t('diagnostics', err.code || err.message)
        })
      });
    }

  });
});
