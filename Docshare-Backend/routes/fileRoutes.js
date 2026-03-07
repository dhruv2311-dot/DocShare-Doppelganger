const express = require('express');
const { uploadFile, getMyFiles, deleteFile } = require('../controllers/fileController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { uploadLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// protect routes initially
router.use(protect);

router.post('/upload', uploadLimiter, authorizeRoles('Administrator', 'Partner'), upload.single('file'), uploadFile);
router.get('/my-files', getMyFiles);
// Note: Delete route allows owners or Admins to delete, controlled in the controller
router.delete('/:id', authorizeRoles('Administrator', 'Partner'), deleteFile);

module.exports = router;
