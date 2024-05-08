import express from "express";
import getUser from "../controller/Authenticate/getUser";

const useRouter = express.Router();


useRouter.get("/userinfo", getUser);

export default useRouter;