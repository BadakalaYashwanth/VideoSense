const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const { auth, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/upload', auth, authorize(['editor', 'admin']), upload.single('video'), videoController.uploadVideo);
router.get('/', auth, videoController.getVideos);
router.get('/stream/:id', auth, videoController.streamVideo);

module.exports = router;
