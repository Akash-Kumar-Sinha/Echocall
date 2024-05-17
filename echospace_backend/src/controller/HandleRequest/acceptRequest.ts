import { Request, Response } from "express";
import prisma from "../../db/prismaDb";

const acceptRequest = async (req: Request, res: Response) => {
  try {
    const { senderId, receiverId } = req.body;

    const receiverExists = await prisma.profile.findUnique({
      where: { userId: receiverId },
    });

    const senderExists = await prisma.profile.findUnique({
      where: { userId: senderId },
    });

    if (!receiverExists || !senderExists) {
      return res
        .status(404)
        .send({ message: "Receiver or Sender does not exist" });
    }

    const connectionExist = await prisma.connection.findFirst({
      where: { user1Id: senderId, user2Id: receiverId },
    });
    if (connectionExist) {
      return res.status(409).send({ message: "connection already exist" });
    }

    const request = await prisma.request.findFirst({
      where: { senderId, receiverId },
    });

    if (!request) {
      return res.status(404).send({ message: "Request does not exist" });
    }
    console.log(senderId)
    console.log(receiverId)
    console.log(request.id)
    console.log(senderId)

    const acceptedRequest = await prisma.accepted.create({
      data: {
        senderId: senderId,
        receiverId: receiverId,
        requestId: request.id,
        profileId: senderId
      },
    });

    await prisma.request.update({
      where: { id: request.id },
      data: {
        acceptedAt: acceptedRequest.acceptedAt,
        accept: true,
      },
    });

    await prisma.connection.create({
      data: {
        requestId: request.id,
        user1Id: senderId,
        user2Id: receiverId,
      },
    });

    if (acceptedRequest) {
      return res.status(200).send({ message: "Request Accepted" });
    }


    return res.status(404).send({ message: "Failed to sent Request" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Internal server error" });
  }
};

export default acceptRequest;
