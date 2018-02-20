// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

'use strict';

const glp2 = require('glp2');

exports.create = (config, pe2) =>
{
  if (!config)
  {
    config = {};
  }

  if (!config.pe)
  {
    config.pe = {};
  }

  if (!config.iso)
  {
    config.iso = {};
  }

  const pe = {
    type: 'pe',
    enabled: true,
    label: 'MAXOS PE 1',
    duration: config.pe.duration || 1,
    setValue: config.pe.setValue || 0.2,
    ipr: config.pe.ipr || 10,
    u: config.pe.u || 12,
    buzzer: config.pe.buzzer || 0,
    directConnection: 0,
    startOnTouch: 1,
    multi: 0,
    setProbe: 0,
    retries: 0,
    cancelOnFailure: 1,
    minSetValue: 0
  };
  const iso = {
    type: 'iso',
    enabled: true,
    label: 'MAXOS ISO',
    startTime: config.iso.startTime || 0,
    duration: config.iso.duration || 1,
    mode: config.iso.mode || 0,
    setValue: config.iso.setValue || 2,
    u: config.iso.u || 500,
    rMax: config.iso.rMax || 0,
    ramp: config.iso.ramp || 0,
    probe: 0,
    connection: 1,
    retries: 0,
    cancelOnFailure: 1,
    multi: 0,
    minSetValue: 0
  };
  const steps = [
    glp2.PeTest.fromObject(pe),
    glp2.IsoTest.fromObject(iso)
  ];

  if (pe2)
  {
    steps.push(glp2.PeTest.fromObject(Object.assign({}, pe, {label: 'MAXOS PE 2'})));
  }

  return steps;
};
