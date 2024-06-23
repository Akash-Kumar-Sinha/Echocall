import express from "express";
import getUser from "../controller/Users/getUser";
import searchUser from "../controller/Users/searchUser";
import sendRequest from "../controller/HandleRequest/sendRequest";
import acceptRequest from "../controller/HandleRequest/acceptRequest";
import listRequest from "../controller/HandleRequest/listRequest";
import listConnection from "../controller/HandleRequest/listConnection";

const useRouter = express.Router();

useRouter.get("/userinfo", getUser);

useRouter.get("/searchuser", searchUser);

useRouter.post("/sendrequest", sendRequest)

useRouter.post("/acceptrequest", acceptRequest)

useRouter.get("/listrequest", listRequest)

useRouter.get("/listconnection", listConnection)




export default useRouter;
