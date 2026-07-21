const SystemConfig = require('../models/SystemConfig');

const configService = {
  async getByKey(key) {
    let config = await SystemConfig.findOne({ key });
    if (!config) {
      // Seed default configs (Step 14 config values)
      if (key === 'categories') {
        config = await SystemConfig.create({ key, value: ['General', 'Business', 'Travel', 'Academic', 'Conversation'] });
      } else if (key === 'cefr_levels') {
        config = await SystemConfig.create({ key, value: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] });
      } else {
        config = await SystemConfig.create({ key, value: [] });
      }
    }
    return config;
  },

  async update(key, value, adminId) {
    let config = await SystemConfig.findOne({ key });
    if (!config) {
      config = new SystemConfig({ key });
    }
    config.value = value;
    config.updatedBy = adminId;
    await config.save();
    return config;
  },

  async listAll() {
    // Seed both configs if not present
    await this.getByKey('categories');
    await this.getByKey('cefr_levels');
    return SystemConfig.find({});
  }
};

module.exports = configService;
