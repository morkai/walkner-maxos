// Part of <https://miracle.systems/p/walkner-maxos> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setUpPasswordResetRequestModel(app, mongoose)
{
  var passwordResetRequest = new mongoose.Schema({
    _id: String,
    createdAt: Date,
    creator: {},
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    password: String
  }, {
    id: false
  });

  mongoose.model('PasswordResetRequest', passwordResetRequest);
};
