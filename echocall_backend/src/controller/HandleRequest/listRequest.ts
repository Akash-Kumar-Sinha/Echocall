import { Request, Response } from "express";
import prisma from "../../db/prismaDb";

const listRequest = async (req: Request, res: Response) => {
  try {
    const receiverId = req.query.userId as string;

    const user = await prisma.user.findFirst({
      where: { userId: receiverId },
    });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const requestList = await prisma.request.findMany({
      where: {
        receiverId: receiverId,
        accept: false,
      },
    });

    if (!requestList || requestList.length === 0) {
      return res.status(204).send({ message: "No requests found" });
    }

    return res.status(200).send({
      message: "Listing requests",
      requestList,
    });
  } catch (error) {
    console.error("Error listing requests:", error);
    return res.status(500).send({ message: "Internal Server error" });
  }
};

export default listRequest;
