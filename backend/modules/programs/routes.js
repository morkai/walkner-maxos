// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setUpProgramsRoutes(app, programsModule)
{
  const express = app[programsModule.config.expressId];
  const userModule = app[programsModule.config.userId];
  const mongoose = app[programsModule.config.mongooseId];
  const Program = mongoose.model('Program');

  const canView = userModule.auth('LOCAL', 'PROGRAMS:VIEW');
  const canManage = userModule.auth('PROGRAMS:MANAGE');

  express.get('/programs', canView, express.crud.browseRoute.bind(null, app, Program));
  express.post('/programs', canManage, express.crud.addRoute.bind(null, app, Program));
  express.get('/programs/:id', canView, express.crud.readRoute.bind(null, app, Program));
  express.put('/programs/:id', canManage, express.crud.editRoute.bind(null, app, Program));
  express.delete('/programs/:id', canManage, express.crud.deleteRoute.bind(null, app, Program));
};
