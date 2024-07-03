import { Server } from "socket.io";
import http from "http";
import dotenv from "dotenv";

dotenv.config();

const socket_port = parseInt(process.env.SOCKET_PORT || "8000", 10);

const userIdToSocketMapping = new Map();
const callIdToSocketMapping = new Map();
const userIdToUsernameMapping = new Map();
const usernameToSocketMapping = new Map();

const socketToUsernameMapping = new Map();

export const initializeSocket = (server: http.Server) => {
  const io = new Server(server, {
    cors: {
      origin: `${process.env.CLIENT_URL}`,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Connected");

    socket.on("call-initiated", (data) => {
      const { userId, username, callId } = data;
      userIdToSocketMapping.set(userId, socket.id);
      callIdToSocketMapping.set(callId, socket.id);
      usernameToSocketMapping.set(username, socket.id);
      socketToUsernameMapping.set(socket.id, username);

      userIdToUsernameMapping.set(userId, username);

      socket.join(callId);
      socket.emit("calling", callId);
      socket.broadcast
        .to(callId)
        .emit("user-joined", { username, userId, callId });
    });

    socket.on("call-accepted", (data) => {
      console.log("call-accepted");
      const { profileUserId, profileUsername, callId } = data;
      userIdToSocketMapping.set(profileUserId, socket.id);

      socket.join(callId);
      socket.broadcast.to(callId).emit("user-joined", { profileUsername });
    });

    socket.on("call-user", (data) => {
      const { username, offer, callId } = data;
      const fromUsername = socketToUsernameMapping.get(socket.id);
      const socketId = usernameToSocketMapping.get(username);
      socket
        .to(socketId)
        .emit("Incoming-Call", { fromUsername, offer, callId });
    });

    socket.on("call-started", (data) => {
      const { username, ans } = data;
      const socketId = usernameToSocketMapping.get(username);
      socket.to(socketId).emit("call-started", { ans });
    });

    socket.on("new-ice-candidate", (data) => {
      const { candidate, username } = data;
      const socketId = usernameToSocketMapping.get(username);
      socket.to(socketId).emit("new-ice-candidate", { candidate });
    });

    socket.on("end-call", (data) => {
      const { callId } = data;
      socket.to(callId).emit("end-call", { callId });
    });
  });

  io.listen(socket_port);
};
