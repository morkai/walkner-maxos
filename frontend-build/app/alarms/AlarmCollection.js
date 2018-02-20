// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

define(["../core/Collection","./Alarm"],function(e,t){"use strict";return e.extend({model:t,rqlQuery:"select(name,state,lastStateChangeTime,severity,stopConditionMode)&sort(-state,-lastStateChangeTime)&limit(15)"})});