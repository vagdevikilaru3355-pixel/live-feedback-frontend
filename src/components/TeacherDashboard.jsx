import React, { useRef, useEffect, useState } from 'react';

const TeacherDashboard = ({ roomId, teacherId, teacherName, websocketUrl }) => {
    const videoRef = useRef(null);
    const wsRef = useRef(null);

    const [isConnected, setIsConnected] = useState(false);
    const [participants, setParticipants] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [cameraActive, setCameraActive] = useState(false);
    const [stats, setStats] = useState({
        totalAlerts: 0,
        activeStudents: 0,
        drowsyStudents: 0,
        distractedStudents: 0
    });

    // Initialize WebSocket
    useEffect(() => {
        const connectWebSocket = () => {
            const wsUrl = `${websocketUrl}/ws/${roomId}/teacher/${teacherId}?name=${encodeURIComponent(teacherName)}`;
            console.log('Teacher connecting to:', wsUrl);

            const ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                console.log('Teacher WebSocket connected');
                setIsConnected(true);

                // Request participants list
                ws.send(JSON.stringify({ type: 'request_participants' }));
            };

            ws.onmessage = (event) => {
                const message = JSON.parse(event.data);
                console.log('Teacher received:', message);

                handleIncomingMessage(message);
            };

            ws.onerror = (error) => {
                console.error('Teacher WebSocket error:', error);
                setIsConnected(false);
            };

            ws.onclose = () => {
                console.log('Teacher WebSocket disconnected');
                setIsConnected(false);

                // Attempt to reconnect
                setTimeout(connectWebSocket, 3000);
            };

            wsRef.current = ws;
        };

        connectWebSocket();

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [roomId, teacherId, teacherName, websocketUrl]);

    // Handle incoming messages
    const handleIncomingMessage = (message) => {
        switch (message.type) {
            case 'participants_list':
                setParticipants(message.participants || []);
                setStats(prev => ({
                    ...prev,
                    activeStudents: message.count || 0
                }));
                break;

            case 'student_joined':
                setParticipants(prev => {
                    // Check if student already exists
                    if (prev.some(p => p.student_id === message.student_id)) {
                        return prev;
                    }
                    return [...prev, {
                        student_id: message.student_id,
                        name: message.name,
                        joined_at: message.timestamp,
                        status: 'active'
                    }];
                });

                setAlerts(prev => [{
                    id: Date.now(),
                    type: 'info',
                    student_id: message.student_id,
                    student_name: message.name,
                    message: `${message.name} joined the session`,
                    timestamp: new Date().toLocaleTimeString(),
                    severity: 'low'
                }, ...prev]);

                setStats(prev => ({
                    ...prev,
                    activeStudents: prev.activeStudents + 1
                }));
                break;

            case 'student_left':
                setParticipants(prev =>
                    prev.filter(p => p.student_id !== message.student_id)
                );

                setAlerts(prev => [{
                    id: Date.now(),
                    type: 'info',
                    student_id: message.student_id,
                    student_name: message.name,
                    message: `${message.name} left the session`,
                    timestamp: new Date().toLocaleTimeString(),
                    severity: 'low'
                }, ...prev]);

                setStats(prev => ({
                    ...prev,
                    activeStudents: Math.max(0, prev.activeStudents - 1)
                }));
                break;

            case 'drowsy':
                addAlert({
                    type: 'drowsy',
                    student_id: message.student_id,
                    student_name: message.student_name,
                    message: `${message.student_name} appears drowsy (EAR: ${message.ear || 'N/A'})`,
                    severity: message.severity || 'high',
                    details: message
                });

                setStats(prev => ({
                    ...prev,
                    totalAlerts: prev.totalAlerts + 1,
                    drowsyStudents: prev.drowsyStudents + 1
                }));
                break;

            case 'looking_away':
                addAlert({
                    type: 'looking_away',
                    student_id: message.student_id,
                    student_name: message.student_name,
                    message: `${message.student_name} is looking away (Angle: ${message.angle || 'N/A'}°)`,
                    severity: message.severity || 'medium',
                    details: message
                });

                setStats(prev => ({
                    ...prev,
                    totalAlerts: prev.totalAlerts + 1,
                    distractedStudents: prev.distractedStudents + 1
                }));
                break;

            case 'distracted':
                addAlert({
                    type: 'distracted',
                    student_id: message.student_id,
                    student_name: message.student_name,
                    message: `${message.student_name} appears distracted`,
                    severity: message.severity || 'medium',
                    details: message
                });

                setStats(prev => ({
                    ...prev,
                    totalAlerts: prev.totalAlerts + 1,
                    distractedStudents: prev.distractedStudents + 1
                }));
                break;

            default:
                console.log('Unknown message type:', message.type);
        }
    };

    // Add alert with deduplication
    const addAlert = (alertData) => {
        setAlerts(prev => {
            const newAlert = {
                id: Date.now(),
                timestamp: new Date().toLocaleTimeString(),
                ...alertData
            };

            // Keep only last 50 alerts
            return [newAlert, ...prev.slice(0, 49)];
        });

        // Play notification sound
        playNotificationSound(alertData.severity);
    };

    // Play notification sound
    const playNotificationSound = (severity) => {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = severity === 'high' ? 800 : 400;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.error('Audio error:', error);
        }
    };

    // Initialize teacher's camera
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                },
                audio: false
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
                setCameraActive(true);
                console.log('Camera started successfully');
            }
        } catch (error) {
            console.error('Error starting camera:', error);
            alert('Could not access camera. Please check permissions and try again.');
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
            setCameraActive(false);
            console.log('Camera stopped');
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    // Clear alert
    const dismissAlert = (alertId) => {
        setAlerts(prev => prev.filter(a => a.id !== alertId));
    };

    // Clear all alerts
    const clearAllAlerts = () => {
        setAlerts([]);
    };

    // Get severity color
    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'high': return '#dc3545';
            case 'medium': return '#ffc107';
            case 'low': return '#28a745';
            default: return '#6c757d';
        }
    };

    // Get alert icon
    const getAlertIcon = (type) => {
        switch (type) {
            case 'drowsy': return '😴';
            case 'looking_away': return '👀';
            case 'distracted': return '📱';
            case 'info': return 'ℹ️';
            default: return '⚠️';
        }
    };

    return (
        <div className="teacher-dashboard">
            {/* Header */}
            <div className="dashboard-header">
                <div className="header-content">
                    <h1>Teacher Dashboard - {teacherName}</h1>
                    <div className="room-info">
                        <span className="room-id">Room: {roomId}</span>
                        <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
                            <span className="status-dot"></span>
                            {isConnected ? 'Connected' : 'Disconnected'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#007bff' }}>👥</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.activeStudents}</div>
                        <div className="stat-label">Active Students</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#dc3545' }}>⚠️</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.totalAlerts}</div>
                        <div className="stat-label">Total Alerts</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#ffc107' }}>😴</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.drowsyStudents}</div>
                        <div className="stat-label">Drowsy Alerts</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#17a2b8' }}>👀</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.distractedStudents}</div>
                        <div className="stat-label">Distracted Alerts</div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="dashboard-content">
                {/* Left Panel - Camera and Participants */}
                <div className="left-panel">
                    {/* Teacher Camera */}
                    <div className="camera-section">
                        <div className="section-header">
                            <h2>Your Video</h2>
                            <button
                                onClick={cameraActive ? stopCamera : startCamera}
                                className={`camera-toggle ${cameraActive ? 'active' : ''}`}
                            >
                                {cameraActive ? '📹 Stop Camera' : '📷 Start Camera'}
                            </button>
                        </div>

                        <div className="camera-wrapper">
                            <video
                                ref={videoRef}
                                className="teacher-video"
                                autoPlay
                                playsInline
                                muted
                                style={{ display: cameraActive ? 'block' : 'none' }}
                            />
                            {!cameraActive && (
                                <div className="camera-placeholder">
                                    <div className="placeholder-icon">📷</div>
                                    <p>Camera is off</p>
                                    <small>Click "Start Camera" to begin</small>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Participants List */}
                    <div className="participants-section">
                        <div className="section-header">
                            <h2>Participants ({participants.length})</h2>
                        </div>

                        <div className="participants-list">
                            {participants.length === 0 ? (
                                <div className="empty-state">
                                    <p>No students in the session yet</p>
                                    <small>Share Room ID: <strong>{roomId}</strong></small>
                                </div>
                            ) : (
                                participants.map(participant => (
                                    <div key={participant.student_id} className="participant-card">
                                        <div className="participant-avatar">
                                            {participant.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="participant-info">
                                            <div className="participant-name">{participant.name}</div>
                                            <div className="participant-meta">
                                                Joined: {new Date(participant.joined_at).toLocaleTimeString()}
                                            </div>
                                        </div>
                                        <div className={`participant-status ${participant.status}`}>
                                            <span className="status-indicator"></span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Panel - Alerts */}
                <div className="right-panel">
                    <div className="alerts-section">
                        <div className="section-header">
                            <h2>Live Alerts</h2>
                            {alerts.length > 0 && (
                                <button onClick={clearAllAlerts} className="clear-btn">
                                    Clear All
                                </button>
                            )}
                        </div>

                        <div className="alerts-list">
                            {alerts.length === 0 ? (
                                <div className="empty-state">
                                    <p>No alerts yet. All students are engaged! 🎉</p>
                                </div>
                            ) : (
                                alerts.map(alert => (
                                    <div
                                        key={alert.id}
                                        className="alert-card"
                                        style={{ borderLeftColor: getSeverityColor(alert.severity) }}
                                    >
                                        <div className="alert-header">
                                            <span className="alert-icon">{getAlertIcon(alert.type)}</span>
                                            <div className="alert-meta">
                                                <span className="alert-time">{alert.timestamp}</span>
                                                <span
                                                    className="alert-severity"
                                                    style={{ color: getSeverityColor(alert.severity) }}
                                                >
                                                    {alert.severity}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => dismissAlert(alert.id)}
                                                className="dismiss-btn"
                                            >
                                                ×
                                            </button>
                                        </div>

                                        <div className="alert-content">
                                            <div className="alert-message">{alert.message}</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .teacher-dashboard {
          min-height: 100vh;
          background: #f5f7fa;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        }
        
        .dashboard-header {
          background: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          padding: 20px 30px;
        }
        
        .header-content {
          max-width: 1400px;
          margin: 0 auto;
        }
        
        .header-content h1 {
          margin: 0 0 10px 0;
          color: #2c3e50;
          font-size: 28px;
        }
        
        .room-info {
          display: flex;
          gap: 20px;
          align-items: center;
        }
        
        .room-id {
          color: #6c757d;
          font-size: 14px;
          font-weight: 500;
        }
        
        .connection-status {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .connection-status.connected {
          background: #d4edda;
          color: #155724;
        }
        
        .connection-status.disconnected {
          background: #f8d7da;
          color: #721c24;
        }
        
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        
        .connected .status-dot {
          background: #28a745;
        }
        
        .disconnected .status-dot {
          background: #dc3545;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .stats-grid {
          max-width: 1400px;
          margin: 30px auto;
          padding: 0 30px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }
        
        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 15px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          transition: transform 0.2s;
        }
        
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: white;
        }
        
        .stat-content {
          flex: 1;
        }
        
        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #2c3e50;
        }
        
        .stat-label {
          font-size: 14px;
          color: #6c757d;
          margin-top: 4px;
        }
        
        .dashboard-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 30px 30px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
        }
        
        .left-panel, .right-panel {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .camera-section, .participants-section, .alerts-section {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        
        .section-header h2 {
          margin: 0;
          font-size: 20px;
          color: #2c3e50;
        }
        
        .camera-toggle {
          padding: 8px 16px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          background: #007bff;
          color: white;
        }
        
        .camera-toggle.active {
          background: #dc3545;
        }
        
        .camera-toggle:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .camera-wrapper {
          border-radius: 8px;
          overflow: hidden;
          background: #000;
          aspect-ratio: 4/3;
          position: relative;
        }
        
        .teacher-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .camera-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          gap: 10px;
        }
        
        .placeholder-icon {
          font-size: 48px;
        }
        
        .camera-placeholder p {
          margin: 0;
          font-size: 18px;
        }
        
        .camera-placeholder small {
          font-size: 14px;
          opacity: 0.7;
        }
        
        .participants-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 400px;
          overflow-y: auto;
        }
        
        .participant-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 8px;
          background: #f8f9fa;
          transition: background 0.2s;
        }
        
        .participant-card:hover {
          background: #e9ecef;
        }
        
        .participant-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 18px;
        }
        
        .participant-info {
          flex: 1;
        }
        
        .participant-name {
          font-weight: 500;
          color: #2c3e50;
        }
        
        .participant-meta {
          font-size: 12px;
          color: #6c757d;
          margin-top: 2px;
        }
        
        .participant-status {
          width: 12px;
          height: 12px;
        }
        
        .status-indicator {
          display: block;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: #28a745;
          animation: pulse 2s infinite;
        }
        
        .alerts-section {
          height: calc(100vh - 300px);
          display: flex;
          flex-direction: column;
        }
        
        .alerts-list {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .alert-card {
          background: #fff;
          border: 1px solid #e9ecef;
          border-left: 4px solid;
          border-radius: 8px;
          padding: 12px;
          transition: all 0.2s;
        }
        
        .alert-card:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .alert-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }
        
        .alert-icon {
          font-size: 24px;
        }
        
        .alert-meta {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        
        .alert-time {
          font-size: 12px;
          color: #6c757d;
        }
        
        .alert-severity {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }
        
        .dismiss-btn {
          background: none;
          border: none;
          font-size: 24px;
          color: #6c757d;
          cursor: pointer;
          line-height: 1;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: all 0.2s;
        }
        
        .dismiss-btn:hover {
          background: #f8f9fa;
          color: #dc3545;
        }
        
        .alert-content {
          padding-left: 34px;
        }
        
        .alert-message {
          color: #2c3e50;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .clear-btn {
          padding: 6px 12px;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          background: #f8f9fa;
          color: #495057;
          transition: all 0.2s;
        }
        
        .clear-btn:hover {
          background: #dc3545;
          color: white;
        }
        
        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #6c757d;
        }
        
        .empty-state p {
          margin: 0 0 8px 0;
          font-size: 14px;
        }
        
        .empty-state small {
          font-size: 12px;
        }
        
        .empty-state strong {
          color: #667eea;
          font-weight: 600;
        }
        
        @media (max-width: 1024px) {
          .dashboard-content {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    );
};

export default TeacherDashboard;