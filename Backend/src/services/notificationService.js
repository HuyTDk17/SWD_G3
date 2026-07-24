const Notification = require('../models/Notification');
const NotificationPreference = require('../models/NotificationPreference');
const User = require('../models/User');
const emailHelper = require('../utils/emailHelper');

const notificationService = {
  async getPreferences(userId) {
    let pref = await NotificationPreference.findOne({ userId });
    if (!pref) {
      pref = await NotificationPreference.create({ userId });
    }
    return pref;
  },

  async updatePreferences(userId, data) {
    const { emailAlerts, systemAlerts } = data;
    let pref = await NotificationPreference.findOne({ userId });
    if (!pref) {
      pref = new NotificationPreference({ userId });
    }
    if (emailAlerts !== undefined) pref.emailAlerts = emailAlerts;
    if (systemAlerts !== undefined) pref.systemAlerts = systemAlerts;
    await pref.save();
    return pref;
  },

  async createNotification(recipientId, title, message, type = 'system') {
    try {
      const pref = await this.getPreferences(recipientId);
      const user = await User.findById(recipientId).select('email name');
      
      let systemNotification = null;
      if (pref.systemAlerts) {
        systemNotification = await Notification.create({
          recipientId,
          title,
          message,
          type
        });
      }

      if (pref.emailAlerts && user && user.email) {
        // Send email alert (SMTP trigger)
        await emailHelper.sendEmail({
          to: user.email,
          subject: title,
          text: message,
          html: `<div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2>${title}</h2>
            <p>${message}</p>
            <hr style="border: 0; border-top: 1px solid #eee;" />
            <p style="font-size: 12px; color: #777;">You are receiving this because you enabled alerts in your Profile. You can update your settings at any time.</p>
          </div>`
        });
      }

      return systemNotification;
    } catch (error) {
      console.error('Failed to dispatch notification:', error);
    }
  },

  async getMyNotifications(userId) {
    return Notification.find({ recipientId: userId }).sort({ createdAt: -1 }).limit(50);
  },

  async markAsRead(userId, id) {
    return Notification.findOneAndUpdate(
      { _id: id, recipientId: userId },
      { isRead: true },
      { new: true }
    );
  },

  async markAllAsRead(userId) {
    return Notification.updateMany(
      { recipientId: userId, isRead: false },
      { isRead: true }
    );
  },

  async broadcastAnnouncement({ title, message, role }) {
    const filter = { status: 'active' };
    if (role && role !== 'all') {
      filter.role = role;
    }

    const recipients = await User.find(filter).select('_id');
    const results = await Promise.allSettled(
      recipients.map((recipient) => this.createNotification(recipient._id, title, message, 'system'))
    );

    const sentCount = results.filter((r) => r.status === 'fulfilled').length;
    return { recipientCount: recipients.length, sentCount };
  }
};

module.exports = notificationService;
