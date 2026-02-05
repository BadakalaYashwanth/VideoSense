import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';

const Dashboard = () => {
    const { user, api } = useContext(AuthContext);
    const socket = useContext(SocketContext);
    const [videos, setVideos] = useState([]);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const [activeVideo, setActiveVideo] = useState(null);

    useEffect(() => {
        loadVideos();

        if (socket) {
            socket.on('videoStatusUpdate', ({ videoId, progress, status }) => {
                setVideos(prev => prev.map(v =>
                    v._id === videoId ? { ...v, processingProgress: progress, status } : v
                ));
            });
        }

        return () => {
            if (socket) socket.off('videoStatusUpdate');
        };
    }, [socket]);

    const loadVideos = async () => {
        try {
            const res = await api.get('/videos');
            setVideos(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('video', file);
        formData.append('title', file.name);

        setUploading(true);
        try {
            const res = await api.post('/videos/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setVideos([res.data, ...videos]);
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err) {
            console.error(err);
            setUploading(false);
            alert('Upload failed');
        }
    };

    const playVideo = (video) => {
        setActiveVideo(video);
        window.scrollTo(0, 0);
    };

    const canUpload = ['editor', 'admin'].includes(user.role);

    return (
        <div>
            <div className="dashboard-header">
                <h1>Dashboard</h1>
                {canUpload ? (
                    <div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleUpload}
                            accept="video/*"
                        />
                        <button
                            className="btn btn-primary"
                            onClick={() => fileInputRef.current.click()}
                            disabled={uploading}
                        >
                            {uploading ? 'Uploading...' : 'Upload Video'}
                        </button>
                    </div>
                ) : <p>Viewer Mode (Read Only)</p>}
            </div>

            {activeVideo && (
                <div style={{ marginBottom: '3rem' }}>
                    <h2>Now Playing: {activeVideo.title}</h2>
                    <video
                        controls
                        autoPlay
                        className="video-player"
                        src={`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'}/api/videos/stream/${activeVideo._id}`}
                    />
                    <button className="btn" style={{ marginTop: '1rem' }} onClick={() => setActiveVideo(null)}>
                        Close Player
                    </button>
                </div>
            )}

            <div className="video-grid">
                {videos.map(video => (
                    <div key={video._id} className="card">
                        <h3>{video.title}</h3>
                        <p className="text-muted">Uploaded by: {video.uploadedBy?.username || 'Unknown'}</p>

                        <div style={{ margin: '1rem 0' }}>
                            Status:
                            <span className={`badge badge-${video.status}`} style={{ marginLeft: '10px' }}>
                                {video.status.toUpperCase()}
                            </span>
                        </div>

                        {video.status === 'pending' && (
                            <div>
                                <small>Processing: {video.processingProgress}%</small>
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${video.processingProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        {video.status !== 'pending' && (
                            <button className="btn" onClick={() => playVideo(video)} style={{ marginTop: '1rem' }}>
                                Play Video
                            </button>
                        )}
                    </div>
                ))}

                {videos.length === 0 && <p className="text-muted">No videos found.</p>}
            </div>
        </div>
    );
};

export default Dashboard;
