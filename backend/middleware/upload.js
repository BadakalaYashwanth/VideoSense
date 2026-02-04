const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        if (ext !== '.mp4' && ext !== '.mkv' && ext !== '.avi' && ext !== '.mov') {
            return cb(new Error('Only videos are allowed'), false);
        }
        cb(null, true);
    }
});

module.exports = upload;
