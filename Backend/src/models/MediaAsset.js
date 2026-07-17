const mongoose = require('mongoose');
const { MEDIA_PROVIDERS, ASSET_TYPES, ASSET_PURPOSES } = require('../constants/mediaTypes');

const mediaAssetSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  provider: {
    type: String,
    enum: Object.values(MEDIA_PROVIDERS),
    required: true
  },
  storageKey: {
    type: String,
    default: null
  },
  publicId: {
    type: String,
    default: null
  },
  url: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: Object.values(ASSET_TYPES),
    required: true
  },
  sizeBytes: {
    type: Number,
    required: true
  },
  purpose: {
    type: String,
    enum: Object.values(ASSET_PURPOSES),
    default: ASSET_PURPOSES.GENERAL
  },
  isOrphan: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

mediaAssetSchema.index({ ownerId: 1, isOrphan: 1 });

module.exports = mongoose.model('MediaAsset', mediaAssetSchema);
