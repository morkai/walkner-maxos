// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

'use strict';

const url = require('url');
const _ = require('lodash');
const uuid = require('uuid/v4');
const Twilio = require('twilio');
const setUpRoutes = require('./routes');

exports.DEFAULT_CONFIG = {
  expressId: 'express',
  mongooseId: 'mongoose',
  accountSid: null,
  authToken: null,
  defaultCaller: null,
  secretKey: null,
  remoteUrl: null,
  baseUrl: 'http://127.0.0.1/'
};

exports.start = function startTwilioModule(app, twilioModule)
{
  const config = twilioModule.config;
  const request = _.isEmpty(config.remoteUrl) || _.isEmpty(config.secretKey) ? null : require('request');
  const client = config.accountSid && config.authToken ? new Twilio(config.accountSid, config.authToken) : null;

  app.onModuleReady(
    [
      config.mongooseId,
      config.expressId
    ],
    setUpRoutes.bind(null, app, twilioModule)
  );

  twilioModule.say = function(options, done)
  {
    if (!options.from)
    {
      options.from = config.defaultCaller;
    }

    if (request)
    {
      return sendRemoteRequest('say', options, done);
    }

    if (client)
    {
      return say(options, done);
    }

    return setImmediate(done, new Error('No valid transport.'));
  };

  function sendRemoteRequest(operation, options, done)
  {
    const reqOptions = {
      url: config.remoteUrl,
      method: 'POST',
      json: true,
      body: {
        secretKey: config.secretKey,
        operation: operation,
        options: options
      }
    };

    request(reqOptions, function(err, res)
    {
      if (err)
      {
        return done(err);
      }

      if (res.statusCode !== 204)
      {
        return done(new Error('INVALID_REMOTE_RESPONSE'));
      }

      return done();
    });
  }

  function say(sayOptions, done)
  {
    const mongoose = app[config.mongooseId];

    if (!mongoose)
    {
      return setImmediate(done, new Error('The `mongoose` module is not available!'));
    }

    const TwilioRequest = mongoose.model('TwilioRequest');
    const twilioRequest = new TwilioRequest({
      _id: uuid().toUpperCase(),
      operation: 'say',
      options: sayOptions,
      status: 'created',
      createdAt: new Date(),
      updatedAt: null
    });

    twilioRequest.save(function(err)
    {
      if (err)
      {
        return done(err);
      }

      const makeCallOptions = _.pick(sayOptions, ['to', 'from', 'statusCallbackEvent', 'timeout', 'record']);

      makeCallOptions.method = 'GET';
      makeCallOptions.url = url.format(_.assign(url.parse(config.baseUrl), {pathname: '/twilio/' + twilioRequest._id}));

      if (makeCallOptions.statusCallbackEvent)
      {
        makeCallOptions.statusCallbackMethod = 'POST';
        makeCallOptions.statusCallback = makeCallOptions.url;
      }

      client.calls.create(makeCallOptions, done);
    });
  }
};
