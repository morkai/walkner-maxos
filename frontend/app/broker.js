// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

define([
  'h5.pubsub/MessageBroker'
],
/**
 * @param {function(new:h5.pubsub.MessageBroker)} MessageBroker
 * @returns {h5.pubsub.MessageBroker}
 */
function(
  MessageBroker
) {
  'use strict';

  var broker = new MessageBroker();

  broker.on('message', function(topic, message)
  {
    if (typeof message === 'undefined')
    {
      console.log('[%s]', topic);
    }
    else
    {
      console.log('[%s]', topic, message);
    }
  });

  window.broker = broker;

  return broker;
});
