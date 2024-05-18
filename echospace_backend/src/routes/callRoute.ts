import express from "express";
import getStart from "../controller/HandleCall/getStart";
import fetchCall from "../controller/HandleCall/fetchCall";

const callRoute = express.Router();

callRoute.post("/start", getStart);
callRoute.get("/fetchcall", fetchCall)
callRoute.get("/activecall", fetchCall)


export default callRoute;
