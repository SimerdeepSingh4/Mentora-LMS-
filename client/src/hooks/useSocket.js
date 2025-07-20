import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

let socket;

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});

  useEffect(() => {
    // Initialize socket connection if not already connected
    if (!socket) {
      socket = io('http://localhost:8080', {
        withCredentials: true,
        transports: ['websocket']
      });
    }

    // Set up event listeners
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setIsConnected(true);
      setSocketId(socket.id);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
      setSocketId(null);
    });

    socket.on('upload-progress', (data) => {
      console.log('Upload progress:', data);
      setUploadProgress(prev => ({
        ...prev,
        [data.uploadId]: data.progress
      }));
    });

    // Clean up on unmount
    return () => {
      if (socket) {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('upload-progress');
      }
    };
  }, []);

  // Function to get progress for a specific upload
  const getUploadProgress = (uploadId) => {
    return uploadProgress[uploadId] || 0;
  };

  // Function to reset progress for a specific upload
  const resetUploadProgress = (uploadId) => {
    setUploadProgress(prev => {
      const newState = { ...prev };
      delete newState[uploadId];
      return newState;
    });
  };

  return {
    socket,
    isConnected,
    socketId,
    uploadProgress,
    getUploadProgress,
    resetUploadProgress
  };
};
