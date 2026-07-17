const mediaService = require('../services/mediaService');

const mediaController = {
  async getConfig(req, res, next) {
    try {
      const data = mediaService.getConfig();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async upload(req, res, next) {
    try {
      const data = await mediaService.uploadLocal({
        ownerId: req.user.id,
        file: req.file,
        purpose: req.validated.purpose
      });
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async signedUpload(req, res, next) {
    try {
      const data = await mediaService.createSignedUpload({
        ownerId: req.user.id,
        ...req.validated
      });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async confirm(req, res, next) {
    try {
      const data = await mediaService.confirmCloudinaryUpload({
        ownerId: req.user.id,
        ...req.validated
      });
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const data = await mediaService.getAssetMetadata({
        assetId: req.params.id,
        user: req.user
      });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getContent(req, res, next) {
    try {
      const data = await mediaService.getAssetContent({
        assetId: req.params.id,
        user: req.optionalUser || null
      });
      if (data.redirectUrl) {
        return res.redirect(data.redirectUrl);
      }
      res.setHeader('Content-Type', data.mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(data.originalName)}"`);
      return res.send(data.buffer);
    } catch (error) {
      next(error);
    }
  },

  async remove(req, res, next) {
    try {
      const data = await mediaService.deleteAsset({
        assetId: req.params.id,
        user: req.user
      });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = mediaController;
