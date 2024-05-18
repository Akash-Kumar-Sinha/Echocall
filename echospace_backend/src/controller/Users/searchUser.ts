import { Request, Response } from "express";
import prisma from "../../db/prismaDb";

const searchUser = async (req: Request, res: Response) => {
  try {
    const search = req.query.search as string;
    const currentUserId = req.query.currentUserId as string;

    if (!currentUserId) {
      return res.status(400).send({ message: "currentUserId is required" });
    }

    const user = await prisma.profile.findUnique({
      where: { userId: currentUserId },
    });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    if (search) {
      const users = await prisma.profile.findMany({
        where: {
          AND: [
            { userId: { not: currentUserId } },
            {
              OR: [
                { username: { startsWith: search } },
                { userId: { startsWith: search } },
              ],
            },
          ],
        },
      });

      if (users.length > 0) {
        const userIds = users.map((user) => user.userId);
        const connections = await prisma.connection.findMany({
          where: {
            OR: [
              {
                user1Id: currentUserId,
                user2Id: { in: userIds },
              },
              {
                user2Id: currentUserId,
                user1Id: { in: userIds },
              },
            ],
          },
        });

        const userResults = users.map((user) => {
          const hasConnection = connections.some(
            (connection) =>
              connection.user1Id === user.userId ||
              connection.user2Id === user.userId
          );
          return { ...user, hasConnection };
        });
        // console.log(userResults)
        return res.status(200).send({ otheruser: userResults });
      }

      return res.status(404).send({ message: "No users found" });
    }

    return res.status(400).send({ message: "Search query not provided" });
  } catch (error) {
    console.error("Unable to search user", error);
    return res.status(500).send({ error: "Internal Server Error" });
  }
};

export default searchUser;
