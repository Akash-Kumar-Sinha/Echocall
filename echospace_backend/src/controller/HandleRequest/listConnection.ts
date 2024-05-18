import { Request, Response } from "express";
import prisma from "../../db/prismaDb";

const listConnection = async (req: Request, res: Response) => {
  try {
    const senderId = req.query.userId as string;
    // console.log(senderId)

    const user = await prisma.user.findUnique({
      where: { userId: senderId },
    });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const connections = await prisma.connection.findMany({
      where: {
        OR: [
          {
            user1Id: user.userId,
          },
          {
            user2Id: user.userId,
          },
        ],
      },
    });

    if (connections && connections.length > 0) {
      try {
        const connectedUsers = await Promise.all(
          connections.map(async (connection) => {
            let userinfo;
            if (connection.user1Id !== senderId) {
              userinfo = await prisma.profile.findUnique({
                where: {
                  userId: connection.user1Id,
                },
              });
            } else if (connection.user2Id !== senderId) {
              userinfo = await prisma.profile.findUnique({
                where: {
                  userId: connection.user2Id,
                },
              });
            }
            return { ...userinfo, requestId: connection.requestId }; // Accumulate the user info fetched
          })
        );

        // Filter out null values if any
        const validConnectedUsers = connectedUsers.filter(
          (userinfo) => userinfo !== null
        );

        return res.status(200).send({ connections: validConnectedUsers });
      } catch (error) {
        console.error("Error listing requests:", error);
        return res.status(500).send({ message: "Internal Server error" });
      }
    } else {
      return res.status(200).send({ connections: [] });
    }
  } catch (error) {
    console.error("Error listing connections:", error);
    return res.status(500).send({ message: "Internal Server error" });
  }
};

export default listConnection;
