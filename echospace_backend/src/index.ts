import express, { Express, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routes/authRoute";
import userRouter from "./routes/userRouter";

dotenv.config();

const app: Express = express();
const server_port = process.env.SERVER_PORT;
const client_port = process.env.CLIENT_PORT;

const corsOptions = {
  origin: `http://localhost:${client_port}`,
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.use("/auth", router);

app.use("/get", userRouter)

app.listen(server_port, () => {
  console.log(`[server]: Server is running at http://localhost:${server_port}`);
});
