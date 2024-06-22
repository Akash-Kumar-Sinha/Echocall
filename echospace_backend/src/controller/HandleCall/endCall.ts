import { Request, Response } from "express";
import prisma from "../../db/prismaDb";

const endCall = async (req: Request, res: Response) => {
  try {
    const callId = req.query.callId as string;

    const call = await prisma.call.findMany({
      where: {
        callId: callId,
      },
    });
    if (call) {
      await prisma.call.update({
        where: {
          callId: callId,
        },
        data: {
          callActive: false,
        },
      });
    } else {
      console.log(`Call not found or already inactive.`);
    }
  } catch (error) {
    console.log("Error in ending the call user details:", error);
    return res.status(500).send({ error: "Internal Server Error" });
  }
};

export default endCall;
