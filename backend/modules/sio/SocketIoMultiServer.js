// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

'use strict';

const util = require('util');
const EventEmitter = require('events').EventEmitter;

module.exports = SocketIoMultiServer;

function SocketIoMultiServer()
{
  EventEmitter.call(this);

  this.servers = [];
}

util.inherits(SocketIoMultiServer, EventEmitter);

SocketIoMultiServer.prototype.listen = function() {};

SocketIoMultiServer.prototype.addServer = function(eventEmitter)
{
  this.servers.push(eventEmitter);
};

SocketIoMultiServer.prototype.addListener = function(event, listener)
{
  for (let i = 0, l = this.servers.length; i < l; ++i)
  {
    this.servers[i].addListener(event, listener);
  }
};

SocketIoMultiServer.prototype.on = SocketIoMultiServer.prototype.addListener;

SocketIoMultiServer.prototype.once = function(event, listener)
{
  for (let i = 0, l = this.servers.length; i < l; ++i)
  {
    this.servers[i].once(event, listener);
  }
};

SocketIoMultiServer.prototype.removeListener = function(event, listener)
{
  for (let i = 0, l = this.servers.length; i < l; ++i)
  {
    this.servers[i].removeListener(event, listener);
  }
};

SocketIoMultiServer.prototype.removeAllListeners = function(event)
{
  for (let i = 0, l = this.servers.length; i < l; ++i)
  {
    this.servers[i].removeAllListeners(event);
  }
};

SocketIoMultiServer.prototype.setMaxListeners = function(n)
{
  for (let i = 0, l = this.servers.length; i < l; ++i)
  {
    this.servers[i].setMaxListeners(n);
  }
};

SocketIoMultiServer.prototype.listeners = function(event)
{
  return this.servers.length > 0
    ? this.servers[0].listeners(event)
    : [];
};
