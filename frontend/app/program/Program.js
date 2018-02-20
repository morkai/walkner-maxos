// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../i18n',
  '../time',
  '../core/Model'
], function(
  _,
  t,
  time,
  Model
) {
  'use strict';

  var STATUS_CLASS_NAMES = {
    idle: '',
    running: 'warning',
    failure: 'danger',
    success: 'success'
  };

  return Model.extend({

    urlRoot: '/program',

    clientUrlRoot: '#program',

    topicPrefix: 'program',

    privilegePrefix: 'PROGRAM',

    nlsDomain: 'program',

    labelAttribute: 'description',

    defaults: function()
    {
      return {
        description: '',
        chamberCount: 2,
        tempController1: 3,
        tempController2: 7,
        stopOnCoverOpen: false,
        steps: [],
        repeatCount: 1
      };
    },

    serialize: function()
    {
      var obj = this.toJSON();

      obj.className = STATUS_CLASS_NAMES[obj.status];
      obj.status = t('program', 'status:' + obj.status);
      obj.startedAt = time.format(obj.startedAt, 'L, LTS');

      if (obj.finishedAt)
      {
        obj.finishedAt = time.format(obj.finishedAt, 'L, LTS');
        obj.elapsedTime = time.toString(this.getElapsedTime() / 1000);
      }

      if (obj.reason)
      {
        obj.reason = t('program', 'reason:' + obj.reason);
      }

      return obj;
    },

    isRunning: function()
    {
      return this.get('status') === 'running';
    },

    getDuration: function()
    {
      var duration = 0;

      _.forEach(this.get('steps'), function(step)
      {
        duration += step.duration;
      });

      return duration * (this.get('repeatCount') || 1) + (this.get('additionalTime') || 0) / 60000;
    },

    getElapsedTime: function()
    {
      return Date.parse(this.get('finishedAt')) - Date.parse(this.get('startedAt'));
    },

    getFinishTime: function()
    {
      return Date.parse(this.get('startedAt')) + this.getDuration() * 60 * 1000 + (this.get('additionalTime') || 0);
    },

    getCurrentStep: function()
    {
      var steps = this.get('steps');
      var currentStep = this.get('currentStep');

      return Array.isArray(steps) && steps[currentStep % steps.length] || null;
    },

    getCurrentStepStartTime: function()
    {
      return Date.parse(this.get('currentStepStartedAt'));
    },

    getCurrentStepFinishTime: function()
    {
      var step = this.getCurrentStep();

      if (!step)
      {
        return 0;
      }

      var startedAt;

      if (step.startTemperature)
      {
        var startTemperatureReachedAt = Date.parse(this.get('currentStartTemperatureAt'));

        if (startTemperatureReachedAt)
        {
          startedAt = startTemperatureReachedAt;
        }
        else
        {
          startedAt = Date.now();
        }
      }
      else
      {
        startedAt = this.getCurrentStepStartTime();
      }

      return startedAt + step.duration * 60 * 1000;
    }

  });
});
