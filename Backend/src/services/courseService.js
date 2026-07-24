const courseRepository = require('../repositories/courseRepository');
const mediaService = require('./mediaService');
const { ASSET_TYPES, ASSET_PURPOSES } = require('../constants/mediaTypes');
const ERROR_CODES = require('../constants/errorCodes');
const ValidationError = require('../exceptions/ValidationError');
const ForbiddenError = require('../exceptions/ForbiddenError');
const NotFoundError = require('../exceptions/NotFoundError');
const ConflictError = require('../exceptions/ConflictError');

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

const normalizePagination = ({ page = 1, limit = 20 }) => ({
  page: Math.max(1, Number(page) || 1),
  limit: Math.min(100, Math.max(1, Number(limit) || 20))
});

const courseService = {
  async createCourse(teacherId, data) {
    // BR-COURSE-006: Price >= 0
    if (data.price !== undefined && data.price < 0) {
      throw new ValidationError('Price must be zero or greater', [{ field: 'price', message: 'Price cannot be negative' }]);
    }

    // BR-COURSE-003: Draft on creation
    data.status = 'draft';
    data.teacherId = teacherId;

    // BR-COURSE-009: Unique Slug
    let slug = data.slug || slugify(data.title || '');
    if (!slug) {
      slug = 'course-' + Date.now();
    }
    
    // If user provided a slug and it conflicts, error out
    if (data.slug && await courseRepository.existsSlug(data.slug)) {
      throw new ConflictError('Slug already exists', ERROR_CODES.VALIDATION_ERROR);
    }

    // Otherwise if auto-generated, resolve collision
    let resolvedSlug = slug;
    let suffix = 1;
    while (await courseRepository.existsSlug(resolvedSlug)) {
      resolvedSlug = `${slug}-${suffix++}`;
    }
    data.slug = resolvedSlug;

    // Handle thumbnail association
    if (data.thumbnailAssetId) {
      await mediaService.verifyOwnedAssets({
        ownerId: teacherId,
        assetIds: [data.thumbnailAssetId],
        type: ASSET_TYPES.IMAGE,
        purpose: ASSET_PURPOSES.THUMBNAIL
      });
      const asset = await mediaService.attachAsset({
        assetId: data.thumbnailAssetId,
        purpose: ASSET_PURPOSES.THUMBNAIL
      });
      data.image = asset.url;
    }

    return courseRepository.create(data);
  },

  async updateCourse(userId, role, id, data) {
    const course = await courseRepository.findById(id);
    if (!course) {
      throw new NotFoundError('Course not found', ERROR_CODES.NOT_FOUND);
    }

    // BR-COURSE-001: Owner Only Edits
    if (course.teacherId._id.toString() !== userId && role !== 'admin') {
      throw new ForbiddenError('No permission to edit this course', ERROR_CODES.FORBIDDEN);
    }

    // BR-COURSE-006: Price >= 0
    if (data.price !== undefined && data.price < 0) {
      throw new ValidationError('Price must be zero or greater', [{ field: 'price', message: 'Price cannot be negative' }]);
    }

    // BR-COURSE-007: Structural Lock on Published
    if (course.status === 'published') {
      const languageChanged = data.language && data.language !== course.language;
      const cefrLevelChanged = data.cefrLevel && data.cefrLevel !== course.cefrLevel;
      if (languageChanged || cefrLevelChanged) {
        data.status = 'pending_approval'; // lock & require re-approval
      }
    }

    // Handle slug update if provided
    if (data.slug && data.slug !== course.slug) {
      if (await courseRepository.existsSlug(data.slug, id)) {
        throw new ConflictError('Slug already exists', ERROR_CODES.VALIDATION_ERROR);
      }
    } else if (data.title && data.title !== course.title && !data.slug) {
      // Re-generate slug if title changed and slug wasn't explicitly updated
      let newSlug = slugify(data.title);
      let resolvedSlug = newSlug;
      let suffix = 1;
      while (await courseRepository.existsSlug(resolvedSlug, id)) {
        resolvedSlug = `${newSlug}-${suffix++}`;
      }
      data.slug = resolvedSlug;
    }

    // Handle thumbnail changes
    if (data.thumbnailAssetId && data.thumbnailAssetId.toString() !== (course.thumbnailAssetId?._id?.toString() || '')) {
      await mediaService.verifyOwnedAssets({
        ownerId: course.teacherId._id,
        assetIds: [data.thumbnailAssetId],
        type: ASSET_TYPES.IMAGE,
        purpose: ASSET_PURPOSES.THUMBNAIL,
        allowAttachedId: course.thumbnailAssetId?._id
      });

      if (course.thumbnailAssetId) {
        await mediaService.detachAsset(course.thumbnailAssetId._id);
      }

      const asset = await mediaService.attachAsset({
        assetId: data.thumbnailAssetId,
        purpose: ASSET_PURPOSES.THUMBNAIL
      });
      data.image = asset.url;
    }

    return courseRepository.updateById(id, data);
  },

  async getCourseById(id, userId = null, role = null) {
    const course = await courseRepository.findById(id);
    if (!course) {
      throw new NotFoundError('Course not found', ERROR_CODES.NOT_FOUND);
    }

    // Public details show only published courses. Admin/Owner can see others.
    const isOwner = userId && course.teacherId._id.toString() === userId.toString();
    const isAdmin = role === 'admin';
    if (course.status !== 'published' && !isOwner && !isAdmin) {
      throw new ForbiddenError('No permission to access this course details', ERROR_CODES.FORBIDDEN);
    }

    return course;
  },

  async getCourseBySlug(slug, userId = null, role = null) {
    const course = await courseRepository.findBySlug(slug);
    if (!course) {
      throw new NotFoundError('Course not found', ERROR_CODES.NOT_FOUND);
    }

    const isOwner = userId && course.teacherId._id.toString() === userId.toString();
    const isAdmin = role === 'admin';
    if (course.status !== 'published' && !isOwner && !isAdmin) {
      throw new ForbiddenError('No permission to access this course details', ERROR_CODES.FORBIDDEN);
    }

    return course;
  },

  async submitCourse(userId, id) {
    const course = await courseRepository.findById(id);
    if (!course) {
      throw new NotFoundError('Course not found', ERROR_CODES.NOT_FOUND);
    }

    if (course.teacherId._id.toString() !== userId) {
      throw new ForbiddenError('Only the course teacher can submit it', ERROR_CODES.FORBIDDEN);
    }

    // BR-COURSE-002: Min 3 Lessons to Submit
    if (course.lessonCount < 3) {
      throw new ValidationError('Must contain 3 lessons', [{ field: 'lessonCount', message: 'At least 3 lessons are required before submitting for approval' }]);
    }

    return courseRepository.updateById(id, { status: 'pending_approval', rejectionReason: null });
  },

  async approveCourse(adminId, id) {
    const course = await courseRepository.findById(id);
    if (!course) {
      throw new NotFoundError('Course not found', ERROR_CODES.NOT_FOUND);
    }

    const updated = await courseRepository.updateById(id, { status: 'approved', rejectionReason: null });

    // Notify teacher (Step 11 integration)
    const notificationService = require('./notificationService');
    await notificationService.createNotification(
      course.teacherId._id,
      'Course Approved! 🎓',
      `Congratulations! Your course "${course.title}" has been approved by the administrators. You can now publish it to the catalog.`,
      'course'
    );

    return updated;
  },

  async rejectCourse(adminId, id, rejectionReason) {
    const course = await courseRepository.findById(id);
    if (!course) {
      throw new NotFoundError('Course not found', ERROR_CODES.NOT_FOUND);
    }

    // BR-COURSE-005: Rejection requires feedback
    if (!rejectionReason || !rejectionReason.trim()) {
      throw new ValidationError('Reason required', [{ field: 'rejectionReason', message: 'Rejection reason is required' }]);
    }

    const updated = await courseRepository.updateById(id, { status: 'rejected', rejectionReason: rejectionReason.trim() });

    // Notify teacher (Step 11 integration)
    const notificationService = require('./notificationService');
    await notificationService.createNotification(
      course.teacherId._id,
      'Course Revision Required ⚠️',
      `Your course "${course.title}" requires revisions. Reason: ${rejectionReason}`,
      'course'
    );

    return updated;
  },

  async publishCourse(userId, id) {
    const course = await courseRepository.findById(id);
    if (!course) {
      throw new NotFoundError('Course not found', ERROR_CODES.NOT_FOUND);
    }

    if (course.teacherId._id.toString() !== userId) {
      throw new ForbiddenError('Only the course teacher can publish it', ERROR_CODES.FORBIDDEN);
    }

    // BR-COURSE-004: Approval Required to Publish
    if (course.status !== 'approved') {
      throw new ValidationError('Must be approved before publishing', [{ field: 'status', message: 'Only approved courses can be published' }]);
    }

    return courseRepository.updateById(id, { status: 'published', publishedAt: Date.now() });
  },

  async archiveCourse(userId, role, id) {
    const course = await courseRepository.findById(id);
    if (!course) {
      throw new NotFoundError('Course not found', ERROR_CODES.NOT_FOUND);
    }

    const isOwner = course.teacherId._id.toString() === userId;
    const isAdmin = role === 'admin';
    if (!isOwner && !isAdmin) {
      throw new ForbiddenError('No permission to archive this course', ERROR_CODES.FORBIDDEN);
    }

    // BR-COURSE-008: Archive Status
    return courseRepository.updateById(id, { status: 'archived' });
  },

  async listCourses(query, userId = null, role = null) {
    const { page, limit } = normalizePagination(query);
    const { status, language, cefrLevel, category, teacherId, search, sortBy } = query;

    const filter = {};

    // Standard filters
    if (language) filter.language = language;
    if (cefrLevel) filter.cefrLevel = cefrLevel;
    if (category) filter.category = category;

    // Search query
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Role-based visibility
    if (role === 'admin') {
      if (status) filter.status = status;
      if (teacherId) filter.teacherId = teacherId;
    } else if (role === 'teacher') {
      // Teachers see all published courses OR their own courses
      if (teacherId && teacherId === userId) {
        filter.teacherId = userId;
        if (status) filter.status = status;
      } else {
        // General catalog listing for teachers shows published, or their own drafts
        filter.$or = [
          { status: 'published' },
          { teacherId: userId }
        ];
        if (status) {
          // If filtering by status, intersect
          filter.status = status;
        }
      }
    } else {
      // Students and Guests see only published courses
      filter.status = 'published';
    }

    // Sorting
    let sort = { createdAt: -1 };
    if (sortBy === 'price_asc') sort = { price: 1 };
    if (sortBy === 'price_desc') sort = { price: -1 };
    if (sortBy === 'rating_desc') sort = { averageRating: -1 };
    if (sortBy === 'title_asc') sort = { title: 1 };

    const { items, total } = await courseRepository.list(filter, page, limit, sort);
    
    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  async deleteCourse(userId, role, id) {
    const course = await courseRepository.findById(id);
    if (!course) {
      throw new NotFoundError('Course not found', ERROR_CODES.NOT_FOUND);
    }

    const isOwner = course.teacherId._id.toString() === userId;
    const isAdmin = role === 'admin';
    if (!isOwner && !isAdmin) {
      throw new ForbiddenError('No permission to delete this course', ERROR_CODES.FORBIDDEN);
    }

    if (course.thumbnailAssetId) {
      await mediaService.detachAsset(course.thumbnailAssetId._id);
    }

    await courseRepository.deleteById(id);
    return { message: 'Course deleted successfully' };
  },

  // Builds a compact, plain-text summary of the real published course catalog
  // so the AI Assistant can ground its answers in actual data instead of
  // inventing course names that don't exist on the platform.
  async getCatalogSummaryForAi() {
    const Course = require('../models/Course');
    const courses = await Course.find({ status: 'published' })
      .select('title slug category language price description')
      .sort({ enrollmentCount: -1 })
      .limit(50)
      .lean();

    if (!courses.length) {
      return 'No published courses are currently available on the platform.';
    }

    const baseUrl = (process.env.FRONTEND_URL || '').replace(/\/$/, '');

    return courses
      .map((c) => {
        const shortDesc = (c.description || '').slice(0, 120);
        const priceLabel = c.price > 0 ? `$${c.price}` : 'Free';
        const link = `${baseUrl}/courses/${c.slug}`;
        return `- "${c.title}" | Category: ${c.category} | Language/Tech: ${c.language} | Price: ${priceLabel} | Link: ${link} | ${shortDesc}`;
      })
      .join('\n');
  }
};

module.exports = courseService;
