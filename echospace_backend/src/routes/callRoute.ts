import express from "express";
import getStart from "../controller/HandleCall/getStart";
import fetchCall from "../controller/HandleCall/fetchCall";
import endCall from "../controller/HandleCall/endCall";

const callRoute = express.Router();

callRoute.post("/start", getStart);
callRoute.get("/fetchcall", fetchCall)
callRoute.get("/activecall", fetchCall)
callRoute.get("/endcall", endCall)


export default callRoute;
