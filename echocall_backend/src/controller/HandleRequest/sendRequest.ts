import { Request, Response } from "express";
import prisma from "../../db/prismaDb";

const sendRequest = async (req: Request, res: Response) => {
  try {
    
    const { senderId, receiverId,senderUsername } = req.body;

    const senderExists = await prisma.profile.findUnique({
      where: { userId: senderId },
    });
    const receiverExists = await prisma.profile.findUnique({
      where: { userId: receiverId },
    });

    if (!senderExists || !receiverExists) {
      return res.status(404).send({ message: "Sender or receiver does not exist" });
    }
    const createRequest = await prisma.request.create({
      data: {
        senderId,
        receiverId,
        senderUsername,
      },
    });
    
    if (createRequest) {
      return res.status(200).send({ message: "Request sent" });
    }

    return res.status(404).send({ message: "Failed to sent Request" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Internal server error" });
  }
};

export default sendRequest;
