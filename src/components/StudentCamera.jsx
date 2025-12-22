import React, { useRef, useEffect, useState } from 'react';
import { Camera } from '@mediapipe/camera_utils';
import { FaceMesh } from '@mediapipe/face_mesh';

const StudentCamera = ({ roomId, studentId, studentName, websocketUrl }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const wsRef = useRef(null);
  const faceMeshRef = useRef(null);
  const cameraRef = useRef(null);

  const [isConnected, setIsConnected] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('initializing');
  const [feedbackHistory, setFeedbackHistory] = useState([]);

  // Tracking states
  const lastAlertTime = useRef({});
  const consecutiveFrames = useRef({
    drowsy: 0,
    lookingAway: 0,
    distracted: 0
  });

  // Thresholds
  const ALERT_COOLDOWN = 5000; // 5 seconds between same alerts
  const DROWSY_THRESHOLD = 0.2; // EAR threshold
  const LOOKING_AWAY_THRESHOLD = 30; // degrees
  const CONSECUTIVE_FRAMES_REQUIRED = 10; // frames before triggering

  // Calculate Eye Aspect Ratio (EAR)
  const calculateEAR = (landmarks, eye) => {
    const vertical1 = Math.hypot(
      landmarks[eye[1]].x - landmarks[eye[5]].x,
      landmarks[eye[1]].y - landmarks[eye[5]].y
    );
    const vertical2 = Math.hypot(
      landmarks[eye[2]].x - landmarks[eye[4]].x,
      landmarks[eye[2]].y - landmarks[eye[4]].y
    );
    const horizontal = Math.hypot(
      landmarks[eye[0]].x - landmarks[eye[3]].x,
      landmarks[eye[0]].y - landmarks[eye[3]].y
    );
    return (vertical1 + vertical2) / (2.0 * horizontal);
  };

  // Calculate head pose
  const calculateHeadPose = (landmarks) => {
    const nose = landmarks[1];
    const leftEye = landmarks[33];
    const rightEye = landmarks[263];

    const centerX = (leftEye.x + rightEye.x) / 2;
    const yaw = (nose.x - centerX) * 100; // Horizontal angle

    return { yaw: Math.abs(yaw) };
  };

  // Send feedback to server
  const sendFeedback = (type, severity = 'medium', details = {}) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    const now = Date.now();
    const lastAlert = lastAlertTime.current[type] || 0;

    // Cooldown check
    if (now - lastAlert < ALERT_COOLDOWN) return;

    const message = {
      type,
      severity,
      student_id: studentId,
      student_name: studentName,
      timestamp: new Date().toISOString(),
      ...details
    };

    wsRef.current.send(JSON.stringify(message));
    lastAlertTime.current[type] = now;

    setFeedbackHistory(prev => [{
      type,
      time: new Date().toLocaleTimeString(),
      severity
    }, ...prev.slice(0, 9)]);
  };

  // Initialize WebSocket
  useEffect(() => {
    const connectWebSocket = () => {
      const wsUrl = `${websocketUrl}/ws/${roomId}/student/${studentId}?name=${encodeURIComponent(studentName)}`;
      console.log('Connecting to:', wsUrl);

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setCurrentStatus('connected');
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log('Received message:', message);

        if (message.type === 'teacher_message') {
          alert(`Teacher: ${message.message}`);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
        setCurrentStatus('error');
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        setCurrentStatus('disconnected');

        // Attempt to reconnect after 3 seconds
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
  }, [roomId, studentId, studentName, websocketUrl]);

  // Initialize MediaPipe and Camera
  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return;

    setCurrentStatus('initializing_camera');

    const onResults = (results) => {
      if (!canvasRef.current || !videoRef.current) return;

      const canvasCtx = canvasRef.current.getContext('2d');
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      // Draw clean video WITHOUT face mesh overlay
      canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);

      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const landmarks = results.multiFaceLandmarks[0];

        // Analyze face (detection happens in background - no visible overlay)
        analyzeFace(landmarks);
        setCurrentStatus('tracking');
      } else {
        setCurrentStatus('no_face_detected');
        consecutiveFrames.current = { drowsy: 0, lookingAway: 0, distracted: 0 };
      }

      canvasCtx.restore();
    };

    // Initialize FaceMesh
    const faceMesh = new FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    faceMesh.onResults(onResults);
    faceMeshRef.current = faceMesh;

    // Initialize Camera
    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        if (faceMeshRef.current && videoRef.current) {
          await faceMeshRef.current.send({ image: videoRef.current });
        }
      },
      width: 640,
      height: 480
    });

    camera.start().then(() => {
      console.log('Camera started');
      setCurrentStatus('camera_active');
    }).catch(err => {
      console.error('Camera error:', err);
      setCurrentStatus('camera_error');
    });

    cameraRef.current = camera;

    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
    };
  }, []);

  // Analyze face landmarks
  const analyzeFace = (landmarks) => {
    // Left eye landmarks: [33, 160, 158, 133, 153, 144]
    const leftEye = [33, 160, 158, 133, 153, 144];
    // Right eye landmarks: [362, 385, 387, 263, 373, 380]
    const rightEye = [362, 385, 387, 263, 373, 380];

    // Calculate EAR for both eyes
    const leftEAR = calculateEAR(landmarks, leftEye);
    const rightEAR = calculateEAR(landmarks, rightEye);
    const avgEAR = (leftEAR + rightEAR) / 2;

    // Check for drowsiness
    if (avgEAR < DROWSY_THRESHOLD) {
      consecutiveFrames.current.drowsy++;
      if (consecutiveFrames.current.drowsy > CONSECUTIVE_FRAMES_REQUIRED) {
        sendFeedback('drowsy', 'high', { ear: avgEAR.toFixed(3) });
      }
    } else {
      consecutiveFrames.current.drowsy = 0;
    }

    // Calculate head pose
    const { yaw } = calculateHeadPose(landmarks);

    // Check if looking away
    if (yaw > LOOKING_AWAY_THRESHOLD) {
      consecutiveFrames.current.lookingAway++;
      if (consecutiveFrames.current.lookingAway > CONSECUTIVE_FRAMES_REQUIRED) {
        sendFeedback('looking_away', 'medium', { angle: yaw.toFixed(1) });
      }
    } else {
      consecutiveFrames.current.lookingAway = 0;
    }
  };

  // Load MediaPipe dependencies
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js';
    script.crossOrigin = 'anonymous';
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="student-camera-container">
      <div className="camera-header">
        <h2>Student View - {studentName}</h2>
        <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
          <span className="status-dot"></span>
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </div>

      <div className="camera-wrapper">
        <video
          ref={videoRef}
          className="input-video"
          style={{ display: 'none' }}
        />
        <canvas
          ref={canvasRef}
          className="output-canvas"
          width="640"
          height="480"
        />

        <div className="status-overlay">
          <div className={`status-badge ${currentStatus}`}>
            {currentStatus.replace(/_/g, ' ')}
          </div>
        </div>
      </div>

      <div className="feedback-panel">
        <h3>Recent Feedback Sent</h3>
        <div className="feedback-list">
          {feedbackHistory.length === 0 ? (
            <p className="no-feedback">No feedback sent yet</p>
          ) : (
            feedbackHistory.map((item, index) => (
              <div key={index} className={`feedback-item ${item.severity}`}>
                <span className="feedback-time">{item.time}</span>
                <span className="feedback-type">{item.type.replace(/_/g, ' ')}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <style jsx>{`
        .student-camera-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        }
        
        .camera-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .camera-header h2 {
          margin: 0;
          color: #333;
        }
        
        .connection-status {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 500;
          font-size: 14px;
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
        
        .camera-wrapper {
          position: relative;
          background: #000;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .output-canvas {
          width: 100%;
          height: auto;
          display: block;
        }
        
        .status-overlay {
          position: absolute;
          top: 10px;
          left: 10px;
        }
        
        .status-badge {
          background: rgba(0,0,0,0.7);
          color: white;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          text-transform: capitalize;
        }
        
        .status-badge.tracking {
          background: rgba(40, 167, 69, 0.9);
        }
        
        .status-badge.no_face_detected {
          background: rgba(255, 193, 7, 0.9);
        }
        
        .status-badge.camera_error {
          background: rgba(220, 53, 69, 0.9);
        }
        
        .feedback-panel {
          margin-top: 20px;
          background: #f8f9fa;
          border-radius: 12px;
          padding: 20px;
        }
        
        .feedback-panel h3 {
          margin: 0 0 15px 0;
          color: #333;
          font-size: 18px;
        }
        
        .feedback-list {
          max-height: 200px;
          overflow-y: auto;
        }
        
        .no-feedback {
          text-align: center;
          color: #6c757d;
          font-style: italic;
        }
        
        .feedback-item {
          display: flex;
          justify-content: space-between;
          padding: 10px;
          margin-bottom: 8px;
          border-radius: 6px;
          background: white;
          border-left: 4px solid;
        }
        
        .feedback-item.high {
          border-left-color: #dc3545;
        }
        
        .feedback-item.medium {
          border-left-color: #ffc107;
        }
        
        .feedback-item.low {
          border-left-color: #28a745;
        }
        
        .feedback-time {
          color: #6c757d;
          font-size: 12px;
        }
        
        .feedback-type {
          font-weight: 500;
          text-transform: capitalize;
        }
      `}</style>
    </div>
  );
};

export default StudentCamera;