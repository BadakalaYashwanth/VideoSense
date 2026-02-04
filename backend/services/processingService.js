exports.startProcessing = (video, io) => {
    let progress = 0;
    // Simulate processing time
    const interval = setInterval(async () => {
        progress += 10;

        io.emit('videoStatusUpdate', { videoId: video._id, progress, status: 'processing' });

        if (progress >= 100) {
            clearInterval(interval);
            // Random sensitivity analysis
            const isSafe = Math.random() > 0.3; // 70% chance safe
            video.status = isSafe ? 'safe' : 'flagged';
            video.processingProgress = 100;
            await video.save();
            io.emit('videoStatusUpdate', { videoId: video._id, progress: 100, status: video.status });
        } else {
            // Optional: save intermediate progress
            video.processingProgress = progress;
            await video.save();
        }
    }, 1000);
};
