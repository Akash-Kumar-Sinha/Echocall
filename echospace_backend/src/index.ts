import express, { Express, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import router from "./routes/authRoute";
import userRouter from "./routes/userRouter";
import callRoute from "./routes/callRoute";
import { initializeSocket } from "./socketServer";

dotenv.config();

const app: Express = express();
const server = http.createServer(app);

const server_port = process.env.SERVER_PORT || 3000;
const client_url = process.env.CLIENT_URL;

const corsOptions = {
  origin: `${client_url}`,
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.use("/auth", router);
app.use("/get", userRouter);
app.use("/call", callRoute);

initializeSocket(server);

server.listen(server_port, () => {
  console.log(`[server]: Server is running at ${process.env.SERVER_URL}`);
});
