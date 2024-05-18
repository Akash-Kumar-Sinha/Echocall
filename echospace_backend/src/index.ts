import express, { Express, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";
import http from "http";

import router from "./routes/authRoute";
import userRouter from "./routes/userRouter";
import callRoute from "./routes/callRoute";

dotenv.config();

const app: Express = express();
const server = http.createServer(app);

const server_port = process.env.SERVER_PORT;
const client_port = process.env.CLIENT_PORT;
const socket_port = process.env.SOCKET_PORT;

const corsOptions = {
  origin: `http://localhost:${client_port}`,
  credentials: true,
};

const io = new Server(server, {
  cors: corsOptions,
});

app.use(cors(corsOptions));
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.use("/auth", router);

app.use("/get", userRouter);

app.use("/call", callRoute);

const emailToSocketMapping = new Map();

io.on("connection", (socket) => {
  console.log(`User connected`);
  socket.on("Join-call", (data) => {
    const { userId, username, callId } = data;
    // console.log("userId", userId);
    // console.log("username", username);
    // console.log("callId", callId);
    emailToSocketMapping.set(userId, socket.id);
    socket.join(callId);
    socket.emit('joined-call', {callId})
    socket.broadcast.to(callId).emit("A new user joined", { username });
  });
});

app.listen(server_port, () => {
  console.log(`[server]: Server is running at http://localhost:${server_port}`);
});

io.listen(8000);
