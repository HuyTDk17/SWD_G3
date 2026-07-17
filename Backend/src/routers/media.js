const express = require('express');
const mediaController = require('../controllers/mediaController');
const mediaValidators = require('../validators/mediaValidator');
const validate = require('../middlewares/validateMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const optionalAuthMiddleware = require('../middlewares/optionalAuthMiddleware');
const { handleUpload } = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.get('/config', mediaController.getConfig);
router.get('/:id/content', optionalAuthMiddleware, mediaController.getContent);

router.use(authMiddleware);

router.post('/upload', handleUpload, validate(mediaValidators.upload), mediaController.upload);
router.post('/signed-upload', validate(mediaValidators.signedUpload), mediaController.signedUpload);
router.post('/confirm', validate(mediaValidators.confirm), mediaController.confirm);
router.get('/:id', mediaController.getById);
router.delete('/:id', mediaController.remove);

module.exports = router;
