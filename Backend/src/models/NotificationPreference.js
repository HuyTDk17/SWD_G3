const mongoose = require('mongoose');

const notificationPreferenceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  emailAlerts: {
    type: Boolean,
    default: true
  },
  systemAlerts: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('NotificationPreference', notificationPreferenceSchema);
