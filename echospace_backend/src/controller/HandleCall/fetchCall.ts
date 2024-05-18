import { Request, Response } from "express";
import prisma from "../../db/prismaDb";

const fetchCall = async (req: Request, res: Response) => {
  try {
    const username = req.query.username as string;

    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const calls = await prisma.call.findMany({
      where: {
        callReceiver: username,
        callActive: true,
      },
    });

    if (calls && calls.length > 0) {
      try {
        const calling = await Promise.all(
          calls.map(async (call) => {
            const userinfo = await prisma.profile.findUnique({
              where: {
                userId: call.callInitiater,
              },
            });

            return { ...userinfo, callId: call.callId };
          })
        );
        return res.status(200).send({ calledUser: calling });
      } catch (error) {
        return res.status(500).send({ message: "Internal Server error" });
      }
    }
    return res.status(200).send({ message: "Call is inactive" });
  } catch (error) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

export default fetchCall;
