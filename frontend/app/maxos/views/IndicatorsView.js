// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/user',
  'app/core/Model',
  'app/core/View',
  '../templates/indicators'
], function(
  _,
  $,
  t,
  time,
  user,
  Model,
  View,
  template
) {
  'use strict';

  var THROUGH_WIRE_CORE_STATUS_TAG_RE = /^program\.throughWireTest\.([0-9])\.([0-9])$/;

  return View.extend({

    template: template,

    events: {

      'click .maxos-core': function(e)
      {
        var coreEl = e.currentTarget;
        var connector = +coreEl.dataset.connector;

        if (connector === this.model.tags.getValue('powerConnector.1')
          || connector === this.model.tags.getValue('powerConnector.2'))
        {
          return;
        }

        var tag = this.model.tags.get(coreEl.dataset.tag);

        if (tag && tag.get('writable'))
        {
          this.model.tags.setValue(tag.id, !tag.get('value'));
        }
      },
      'click .maxos-link': function(e)
      {
        var linkEl = e.currentTarget;
        var cable = linkEl.dataset.cable;
        var core = linkEl.dataset.core;

        this.$('.maxos-core[data-cable="' + cable + '"][data-core="' + core + '"]').click();
      },
      'click .maxos-connector-label': function(e)
      {
        var labelEl = e.currentTarget;

        var tag = this.model.tags.get(labelEl.dataset.tag);

        if (tag && tag.get('writable'))
        {
          this.model.tags.setValue(tag.id, !tag.get('value'));
        }
      }

    },

    initialize: function()
    {
      this.scheduleRender = _.debounce(this.render.bind(this), 1);

      this.listenTo(this.model.tags, 'reset', this.render);
      this.listenTo(this.model.tags, 'change:value', this.onTagValueChange);

      $(window).on('resize.' + this.idPrefix, this.onResize.bind(this));
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        enlarged: window.innerHeight >= 1080,
        cables: this.serializeCables()
      };
    },

    afterRender: function()
    {
      var view = this;
      var tags = {};

      view.$('[data-tag]').each(function()
      {
        tags[this.dataset.tag] = true;
      });

      _.forEach(tags, function(unused, tagName)
      {
        var tag = view.model.tags.get(tagName);

        if (tag)
        {
          view.onTagValueChange(tag);
        }
      });
    },

    serializeCables: function()
    {
      var cableCount = this.model.tags.getValue('program.cables') || 2;
      var cables = [];

      for (var cableNo = 1; cableNo <= cableCount; ++cableNo)
      {
        cables.push({
          no: cableNo,
          connectors: this.serializeConnectors(cableNo)
        });
      }

      return cables;
    },

    serializeConnectors: function(cableNo)
    {
      var connectorCount = this.model.tags.getValue('program.connectors') || 3;
      var startNo = (cableNo - 1) * 5;
      var cores = this.serializeCores();
      var connectors = [{
        no: startNo + 1,
        cores: cores,
        tagSuffix: 'status'
      }];

      for (var connectorNo = 1; connectorNo <= connectorCount; ++connectorNo)
      {
        connectors.push({
          no: startNo + 1 + connectorNo,
          cores: cores,
          tagSuffix: 'status'
        });
      }

      connectors.push({
        no: startNo + 5,
        cores: cores,
        tagSuffix: 'control'
      });

      return connectors;
    },

    serializeCores: function()
    {
      var coreCount = this.model.tags.getValue('program.cores') || 7;
      var cores = [];

      for (var coreNo = 1; coreNo <= coreCount; ++coreNo)
      {
        cores.push({
          no: coreNo
        });
      }

      return cores;
    },

    onResize: function()
    {
      this.el.classList.toggle('is-enlarged', window.innerHeight >= 1080);
    },

    onTagValueChange: function(tag)
    {
      switch (tag.id)
      {
        case 'program.message':
          break;

        case 'program.cables':
        case 'program.connectors':
        case 'program.cores':
          return this.scheduleRender();

        case 'safetyTest.pe2':
          return this.togglePe2();

        case 'safetyTest.disabled':
          return this.toggleSafetyTest();

        default:
        {
          var match = tag.id.match(THROUGH_WIRE_CORE_STATUS_TAG_RE);

          if (match)
          {
            this.toggleThroughWireTest(tag, match[1], match[2]);
          }

          return this.updateTag(tag);
        }
      }
    },

    togglePe2: function()
    {
      this.$('.maxos-safetyTest-pe2').toggleClass(
        'hidden',
        !this.model.tags.getValue('safetyTest.pe2')
      );
    },

    toggleSafetyTest: function()
    {
      this.$('.maxos-safetyTest').toggleClass(
        'hidden',
        this.model.tags.getValue('safetyTest.disabled') === true
      );
    },

    toggleThroughWireTest: function(tag, cable, core)
    {
      var selector = '[data-cable="' + cable + '"][data-core="' + core + '"]';
      var status = tag.get('value');

      this.$('.maxos-link' + selector).attr('data-status', status);
      this.$('.maxos-core[data-tag$="status"]' + selector).attr('data-status', status);
    },

    updateTag: function(tag)
    {
      if (!tag)
      {
        return;
      }

      var $tag = this.$('div[data-tag="' + tag.id + '"]');

      if (!$tag.length)
      {
        return;
      }

      var value = tag.get('value');
      var trueClass = $tag.attr('data-true') || 'maxos-on';
      var falseClass = $tag.attr('data-false') || 'maxos-off';
      var className = typeof value === 'string' ? ('maxos-' + value) : value ? trueClass : falseClass;

      $tag
        .removeClass('maxos-on maxos-off maxos-progress maxos-failure maxos-success ' + trueClass + ' ' + falseClass)
        .addClass(className);
    }

  });
});
