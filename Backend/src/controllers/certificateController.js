const certificateService = require('../services/certificateService');

const certificateController = {
  async getMyCertificates(req, res, next) {
    try {
      const data = await certificateService.getMyCertificates(req.user.id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async verifyCertificate(req, res, next) {
    try {
      const { code } = req.params;
      const data = await certificateService.verifyCertificate(code);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async listAllCertificates(req, res, next) {
    try {
      const data = await certificateService.listAllCertificates(req.query);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async revokeCertificate(req, res, next) {
    try {
      const { id } = req.params;
      const data = await certificateService.revokeCertificate(id, req.body.reason);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = certificateController;
