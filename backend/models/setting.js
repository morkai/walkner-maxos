// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupSettingModel(app, mongoose)
{
  var settingSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true,
      trim: true
    },
    value: {},
    updatedAt: Date,
    updater: {}
  }, {
    id: false
  });

  settingSchema.statics.TOPIC_PREFIX = 'settings';
  settingSchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('Setting', settingSchema);
};
