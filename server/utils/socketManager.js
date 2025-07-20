import { Server } from 'socket.io';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", // Your client URL
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

export const emitUploadProgress = (socketId, uploadId, progress) => {
  if (!io) return;
  
  if (socketId) {
    // Emit to specific client
    io.to(socketId).emit('upload-progress', { uploadId, progress });
  } else {
    // Broadcast to all clients
    io.emit('upload-progress', { uploadId, progress });
  }
};
