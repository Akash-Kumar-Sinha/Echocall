import express, { Response, Request } from "express";

import sendToken from "../controller/Authenticate/sendToken";
import verifyToken from "../controller/Authenticate/verifyToken";
import createUsername from "../controller/Authenticate/createUsername";
import createUser from "../controller/Authenticate/createUser";
import checkVerification from "../middleware/checkVerification";
import loginUser from "../controller/Authenticate/loginUser";
import getUser from "../controller/Users/getUser";

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  res.send("auth route");
});

router.post("/send", sendToken);

router.post("/getuser", getUser);

router.get("/verify/:email/:token", verifyToken);

router.post("/getname", createUsername);

router.post("/signup", createUser);

router.post("/login", loginUser);

router.post("/checkverification", checkVerification);

export default router;
