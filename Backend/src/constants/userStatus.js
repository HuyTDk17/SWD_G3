const USER_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  BANNED: 'banned',
  DELETED: 'deleted'
};

const USER_STATUS_LIST = Object.values(USER_STATUS);

module.exports = { USER_STATUS, USER_STATUS_LIST };
