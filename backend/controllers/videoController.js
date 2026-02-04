const Video = require('../models/Video');
const fs = require('fs');
const path = require('path');
const { startProcessing } = require('../services/processingService');

exports.uploadVideo = async (req, res) => {
    try {
        const { title } = req.body;
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const newVideo = new Video({
            title,
            filename: req.file.filename,
            filepath: req.file.path,
            uploadedBy: req.user.id
        });

        await newVideo.save();

        startProcessing(newVideo, req.io);

        res.json(newVideo);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.getVideos = async (req, res) => {
    try {
        const videos = await Video.find().sort({ createdAt: -1 }).populate('uploadedBy', 'username');
        res.json(videos);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.streamVideo = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) return res.status(404).send('Video not found');

        const pathToFile = path.resolve(video.filepath);

        if (!fs.existsSync(pathToFile)) {
            return res.status(404).send('File not found on server');
        }

        const stat = fs.statSync(pathToFile);
        const fileSize = stat.size;
        const range = req.headers.range;

        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = (end - start) + 1;
            const file = fs.createReadStream(pathToFile, { start, end });
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'video/mp4',
            };
            res.writeHead(206, head);
            file.pipe(res);
        } else {
            const head = {
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4',
            };
            res.writeHead(200, head);
            fs.createReadStream(pathToFile).pipe(res);
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Stream Error');
    }
};
