const Course = require('../models/Course');

const courseRepository = {
  create(data) {
    return Course.create(data);
  },

  findById(id) {
    return Course.findById(id).populate('teacherId', 'fullName email avatar').populate('thumbnailAssetId');
  },

  findBySlug(slug) {
    return Course.findOne({ slug }).populate('teacherId', 'fullName email avatar').populate('thumbnailAssetId');
  },

  findBySlugOrId(identifier) {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);
    if (isObjectId) {
      return Course.findById(identifier).populate('teacherId', 'fullName email avatar').populate('thumbnailAssetId');
    }
    return Course.findOne({ slug: identifier }).populate('teacherId', 'fullName email avatar').populate('thumbnailAssetId');
  },

  updateById(id, data) {
    return Course.findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .populate('teacherId', 'fullName email avatar')
      .populate('thumbnailAssetId');
  },

  deleteById(id) {
    return Course.findByIdAndDelete(id);
  },

  async list(filter = {}, page = 1, limit = 20, sort = { createdAt: -1 }) {
    const skip = (page - 1) * limit;
    
    const query = Course.find(filter);
    
    if (filter.$text) {
      query.select({ score: { $meta: 'textScore' } });
      if (sort.score) {
        sort = { score: { $meta: 'textScore' } };
      }
    }
    
    const [items, total] = await Promise.all([
      query
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('teacherId', 'fullName email avatar')
        .populate('thumbnailAssetId'),
      Course.countDocuments(filter)
    ]);
    
    return { items, total };
  },

  existsSlug(slug, excludeId = null) {
    const query = { slug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    return Course.exists(query);
  }
};

module.exports = courseRepository;
