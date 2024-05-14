import express from "express";
import getUser from "../controller/Users/getUser";
import searchUser from "../controller/Users/searchUser";
import sendRequest from "../controller/HandleRequest/sendRequest";
import acceptRequest from "../controller/HandleRequest/acceptRequest";

const useRouter = express.Router();

useRouter.get("/userinfo", getUser);

useRouter.get("/searchuser", searchUser);

useRouter.post("/sendrequest", sendRequest)

useRouter.post("/acceptrequest", acceptRequest)

export default useRouter;
