// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'h5.rql/index',
  'app/i18n',
  'app/user'
], function(
  _,
  rql,
  t,
  user
) {
  'use strict';

  function formatText(user, name, query)
  {
    /*jshint unused:false*/

    if (user.personellId)
    {
      name += ' (' + user.personellId + ')';
    }

    return name;
  }

  function userToData(user, textFormatter, query)
  {
    if (user.id && user.text)
    {
      return user;
    }

    var name = user.lastName && user.firstName
      ? (user.lastName + ' ' + user.firstName)
      : (user.name || user.login || user._id);

    return {
      id: user._id,
      text: (textFormatter || formatText)(user, name, query),
      user: user
    };
  }

  function getSystemData()
  {
    return {
      id: '$SYSTEM',
      text: t('users', 'select2:users:system'),
      user: null
    };
  }

  function getRootData()
  {
    var root = user.getRootUserData();

    return {
      id: root._id,
      text: root.name || root.login,
      user: root
    };
  }

  function createDefaultRqlQuery(rql, term)
  {
    term = term.trim();

    var property = /^[0-9]+$/.test(term) ? 'personellId' : 'lastName';

    var options = {
      fields: {},
      sort: {},
      limit: 20,
      skip: 0,
      selector: {
        name: 'and',
        args: [
          {name: 'regex', args: [property, '^' + term, 'i']}
        ]
      }
    };

    options.sort[property] = 1;

    return rql.Query.fromObject(options);
  }

  function setUpUserSelect2($input, options)
  {
    if (!options)
    {
      options = {};
    }

    var rqlQueryProvider = options.rqlQueryProvider ? options.rqlQueryProvider : createDefaultRqlQuery;
    var userFilter = options.userFilter ? options.userFilter : null;

    $input.select2(_.extend({
      openOnEnter: null,
      allowClear: true,
      minimumInputLength: 3,
      placeholder: t('users', 'select2:placeholder'),
      ajax: {
        cache: true,
        quietMillis: 300,
        url: function(term)
        {
          return '/users' + '?' + rqlQueryProvider(rql, term);
        },
        results: function(data, page, query)
        {
          var results = [getSystemData(), getRootData()].filter(function(user)
          {
            return user.text.toLowerCase().indexOf(query.term.toLowerCase()) !== -1;
          });

          var users = results.concat(data.collection || []);

          if (userFilter)
          {
            users = users.filter(userFilter);
          }

          return {
            results: users
              .map(function(user) { return userToData(user, options.textFormatter, query); })
              .sort(function(a, b) { return a.text.localeCompare(b.text); })
          };
        }
      }
    }, options));

    var userId = $input.val();
    var rootData = getRootData();

    if (userId === rootData.id)
    {
      $input.select2('data', rootData);
    }
    else if (userId === '$SYSTEM')
    {
      $input.select2('data', getSystemData());
    }
    else if (userId && options.view)
    {
      var req = options.view.ajax({
        type: 'GET',
        url: '/users?_id=in=(' + userId + ')'
      });

      req.done(function(res)
      {
        if (res.collection && res.collection.length)
        {
          var data = res.collection.map(function(userData)
          {
            return userToData(userData, options.textFormatter);
          });

          $input.select2('data', options.multiple ? data : data[0]);

          if (options.onDataLoaded)
          {
            options.onDataLoaded();
          }
        }
      });
    }

    return $input;
  }

  setUpUserSelect2.defaultRqlQueryProvider = createDefaultRqlQuery;

  return setUpUserSelect2;
});
