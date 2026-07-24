const MediaAsset = require('../models/MediaAsset');

const mediaAssetRepository = {
  create(data) {
    return MediaAsset.create(data);
  },

  findById(id) {
    return MediaAsset.findById(id);
  },

  findByIds(ids) {
    return MediaAsset.find({ _id: { $in: ids } });
  },

  updateById(id, data) {
    return MediaAsset.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  },

  deleteById(id) {
    return MediaAsset.findByIdAndDelete(id);
  },

  markOrphan(id) {
    return MediaAsset.findByIdAndUpdate(id, { isOrphan: true }, { new: true });
  },

  markAttached(id, purpose) {
    return MediaAsset.findByIdAndUpdate(
      id,
      { isOrphan: false, purpose },
      { new: true, runValidators: true }
    );
  },

  findOrphansOlderThan(cutoffDate) {
    return MediaAsset.find({ isOrphan: true, createdAt: { $lt: cutoffDate } });
  }
};

module.exports = mediaAssetRepository;
