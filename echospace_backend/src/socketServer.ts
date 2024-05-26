import { Server } from "socket.io";
import http from "http";
import dotenv from "dotenv";

dotenv.config();

const socket_port = parseInt(process.env.SOCKET_PORT || '8000', 10);

const userIdToSocketMapping = new Map();
const socketToUserIdMapping = new Map();
const userIdToUsernameMapping = new Map();

export const initializeSocket = (server: http.Server) => {
  const io = new Server(server, {
    cors: {
      origin: `${process.env.CLIENT_URL}`,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`User connected`);

    socket.on("Join-call", (data) => {
      const { userId, username, callId } = data;

      userIdToSocketMapping.set(userId, socket.id);
      socketToUserIdMapping.set(socket.id, userId);
      userIdToUsernameMapping.set(userId, username);

      socket.join(callId);

      socket.emit("joined-call", { callId });

      socket.broadcast.to(callId).emit("user-joined", { username, userId });
    });

    socket.on("call-user", (data) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { userId, username, offer } = data;
      const fromUserId = socketToUserIdMapping.get(socket.id);
      const socketId = userIdToSocketMapping.get(userId);
      const fromUsername = userIdToUsernameMapping.get(fromUserId);

      socket.to(socketId).emit("incoming-call", {
        from: fromUserId,
        offer,
        username: fromUsername,
      });
    });

    socket.on("call-accepted", (data) => {
      const { userId, ans } = data;
      const socketId = userIdToSocketMapping.get(userId);
      socket.to(socketId).emit("call-accepted", { ans });
    });
  });

  io.listen(socket_port);
};
