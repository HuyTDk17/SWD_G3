const ValidationError = require('../exceptions/ValidationError');
const { ROLE_LIST } = require('../constants/roles');

const notificationValidators = {
  broadcastAnnouncement(body) {
    const errors = [];
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    const role = body.role || 'all';

    if (!title || title.length < 3) {
      errors.push({ field: 'title', message: 'Title must contain at least 3 characters' });
    }
    if (!message || message.length < 3) {
      errors.push({ field: 'message', message: 'Message must contain at least 3 characters' });
    }
    if (role !== 'all' && !ROLE_LIST.includes(role)) {
      errors.push({ field: 'role', message: `Role must be "all" or one of: ${ROLE_LIST.join(', ')}` });
    }

    if (errors.length) throw new ValidationError('Validation failed', errors);
    return { title, message, role };
  }
};

module.exports = notificationValidators;
