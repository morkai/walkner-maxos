// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const step = require('h5.step');

module.exports = function setUpUsersRoutes(app, usersModule)
{
  const express = app[usersModule.config.expressId];
  const userModule = app[usersModule.config.userId];
  const settingsModule = app[usersModule.config.settingsId];
  const mongoose = app[usersModule.config.mongooseId];
  const User = mongoose.model('User');
  const PasswordResetRequest = mongoose.model('PasswordResetRequest');

  const canView = userModule.auth('USERS:VIEW');
  const canBrowse = userModule.auth.apply(userModule, usersModule.config.browsePrivileges);
  const canManage = userModule.auth('USERS:MANAGE');

  express.get(
    '/users/settings',
    canBrowse,
    function limitToUsersSettings(req, res, next)
    {
      req.rql.selector = {
        name: 'regex',
        args: ['_id', '^users\\.']
      };

      return next();
    },
    express.crud.browseRoute.bind(null, app, settingsModule.Setting)
  );
  express.put('/users/settings/:id', canManage, settingsModule.updateRoute);

  express.get('/users', canBrowse, express.crud.browseRoute.bind(null, app, User));
  express.post('/users', canManage, checkLogin, hashPassword, express.crud.addRoute.bind(null, app, User));
  express.get('/users/:id', canViewDetails, express.crud.readRoute.bind(null, app, User));
  express.put(
    '/users/:id',
    canEdit,
    restrictSpecial,
    checkLogin,
    hashPassword,
    express.crud.editRoute.bind(null, app, User)
  );
  express.delete('/users/:id', canManage, restrictSpecial, express.crud.deleteRoute.bind(null, app, User));

  express.post('/login', loginRoute);
  express.get('/logout', logoutRoute);

  express.post('/resetPassword/request', hashPassword, requestPasswordResetRoute);
  express.get('/resetPassword/:id', confirmPasswordResetRoute);

  function canViewDetails(req, res, next)
  {
    if (req.session.user && req.params.id === req.session.user._id)
    {
      next();
    }
    else
    {
      canView(req, res, next);
    }
  }

  function canEdit(req, res, next)
  {
    const user = req.session.user;

    if (user && req.params.id === user._id)
    {
      if (!user.privileges || user.privileges.indexOf('USERS:MANAGE') === -1)
      {
        req.body = _.pick(req.body, [
          '_id',
          'login', 'email', 'password', 'password2',
          'firstName', 'lastName', 'sex', 'mobile', 'personellId',
          'mrps'
        ]);
      }

      next();
    }
    else
    {
      canManage(req, res, next);
    }
  }

  function restrictSpecial(req, res, next)
  {
    if (req.params.id === userModule.root._id || req.params.id === userModule.guest._id)
    {
      return res.sendStatus(400);
    }

    return next();
  }

  function checkLogin(req, res, next)
  {
    const rawLogin = req.body.login;

    if (!_.isString(rawLogin) || !req.body.active)
    {
      return next();
    }

    const login = req.body.login = rawLogin.trim();
    const conditions = {
      login,
      active: true
    };

    if (req.body._id)
    {
      conditions._id = {$ne: req.body._id};
    }

    User.findOne(conditions, {_id: 1}).lean().exec(function(err, user)
    {
      if (err)
      {
        return next(err);
      }

      if (user)
      {
        return next(app.createError('LOGIN_USED', 400));
      }

      return next();
    });
  }

  function loginRoute(req, res, next)
  {
    userModule.authenticate(req.body, function(err, user)
    {
      if (err)
      {
        if (err.status < 500)
        {
          app.broker.publish('users.loginFailure', {
            severity: 'warning',
            user: req.session.user,
            login: String(req.body.login)
          });
        }

        return next(err);
      }

      const oldSessionId = req.sessionID;

      req.session.regenerate(function(err)
      {
        if (err)
        {
          return next(err);
        }

        delete user.password;

        user._id = user._id.toString();
        user.loggedIn = true;
        user.ipAddress = userModule.getRealIp({}, req);
        user.local = userModule.isLocalIpAddress(user.ipAddress);

        req.session.user = user;

        res.format({
          json: function()
          {
            res.send(req.session.user);
          },
          default: function()
          {
            res.redirect('/');
          }
        });

        app.broker.publish('users.login', {
          user: user,
          oldSessionId: oldSessionId,
          newSessionId: req.sessionID,
          socketId: req.body.socketId
        });
      });
    });
  }

  function logoutRoute(req, res, next)
  {
    const user = _.isObject(req.session.user)
      ? req.session.user
      : null;

    const oldSessionId = req.sessionID;

    req.session.regenerate(function(err)
    {
      if (err)
      {
        return next(err);
      }

      const guestUser = _.assign({}, userModule.guest);
      guestUser.loggedIn = false;
      guestUser.ipAddress = userModule.getRealIp({}, req);
      guestUser.local = userModule.isLocalIpAddress(guestUser.ipAddress);

      req.session.user = guestUser;

      res.format({
        json: function()
        {
          res.sendStatus(204);
        },
        default: function()
        {
          res.redirect('/');
        }
      });

      if (user !== null)
      {
        user.ipAddress = guestUser.ipAddress;

        app.broker.publish('users.logout', {
          user: user,
          oldSessionId: oldSessionId,
          newSessionId: req.sessionID
        });
      }
    });
  }

  function requestPasswordResetRoute(req, res, next)
  {
    const mailSender = app[usersModule.config.mailSenderId];

    if (!mailSender)
    {
      return res.sendStatus(500);
    }

    const body = req.body;

    if (!_.isString(body.subject)
      || !_.isString(body.text)
      || !_.isString(body.login)
      || !_.isString(body.passwordText))
    {
      return res.sendStatus(400);
    }

    step(
      function findUserStep()
      {
        User.findOne({login: body.login}, {login: 1, email: 1}).lean().exec(this.next());
      },
      function validateUserStep(err, user)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!user)
        {
          err = new Error('NOT_FOUND');
          err.status = 404;

          return this.skip(err);
        }

        if (!/^.+@.+\.[a-z]+$/.test(user.email))
        {
          err = new Error('INVALID_EMAIL');
          err.status = 400;

          return this.skip(err);
        }

        this.user = user;
      },
      function generateIdStep()
      {
        crypto.pseudoRandomBytes(32, this.next());
      },
      function createPasswordResetRequestStep(err, idBytes)
      {
        if (err)
        {
          return this.skip(err);
        }

        this.passwordResetRequest = new PasswordResetRequest({
          _id: idBytes.toString('hex').toUpperCase(),
          createdAt: new Date(),
          creator: userModule.createUserInfo(req.session.user, req),
          user: this.user._id,
          password: body.password
        });
        this.passwordResetRequest.save(this.next());
      },
      function sendEmailStep(err)
      {
        if (err)
        {
          return this.skip(err);
        }

        const subject = body.subject;
        const text = body.text
          .replace(/\{REQUEST_ID\}/g, this.passwordResetRequest._id)
          .replace(/\{LOGIN\}/g, this.user.login)
          .replace(/\{PASSWORD\}/g, body.passwordText);

        mailSender.send(this.user.email, subject, text, this.next());
      },
      function sendResponseStep(err)
      {
        if (err)
        {
          return next(err);
        }

        return res.sendStatus(204);
      }
    );
  }

  function confirmPasswordResetRoute(req, res, next)
  {
    step(
      function findRequestStep()
      {
        PasswordResetRequest.findById(req.params.id, this.next());
      },
      function validateRequestStep(err, passwordResetRequest)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!passwordResetRequest)
        {
          err = new Error('REQUEST_NOT_FOUND');
          err.status = 404;

          return this.skip(err);
        }

        if ((Date.now() - passwordResetRequest.createdAt.getTime()) > 3600 * 24 * 1000)
        {
          err = new Error('REQUEST_EXPIRED');
          err.status = 400;

          return this.skip(err);
        }

        this.passwordResetRequest = passwordResetRequest;
      },
      function findUserStep()
      {
        User.findById(this.passwordResetRequest.user, this.next());
      },
      function validateUserStep(err, user)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!user)
        {
          err = new Error('USER_NOT_FOUND');
          err.status = 400;

          return this.skip(err);
        }

        this.user = user;
      },
      function updatePasswordStep()
      {
        this.user.password = this.passwordResetRequest.password;
        this.user.save(this.next());
      },
      function sendResponseStep(err)
      {
        if (err)
        {
          return next(err);
        }

        res.redirect(303, '/');

        if (this.passwordResetRequest)
        {
          const passwordResetRequest = this.passwordResetRequest;

          passwordResetRequest.remove(function(err)
          {
            if (err)
            {
              usersModule.error(
                'Failed to remove the password reset request [%s]: %s',
                passwordResetRequest._id,
                err.message
              );
            }
          });
        }

        this.passwordResetRequest = null;
        this.user = null;
      }
    );
  }

  function hashPassword(req, res, next)
  {
    if (!_.isObject(req.body))
    {
      return next();
    }

    const password = req.body.password;

    if (!_.isString(password) || password.length === 0)
    {
      return next();
    }

    bcrypt.hash(password, 10, function(err, hash)
    {
      if (err)
      {
        return next(err);
      }

      req.body.passwordText = password;
      req.body.password = hash;

      next();
    });
  }
};
