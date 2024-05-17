import { Request, Response } from "express";
import prisma from "../../db/prismaDb";

const searchUser = async (req: Request, res: Response) => {
  try {
    const searchData = req.query.data as { search?: string };
    const search = searchData.search;
    if (search) {
      const users = await prisma.profile.findMany({
        where: {
          OR: [
            {
              username: {
                startsWith: search,
              },
            },
            {
              userId: {
                startsWith: search,
              },
            },
          ],
        },
      });
      if (users) {
        if (users.length > 0) {
          const userResults = await Promise.all(
            users.map(async (user) => {
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
              return {
                ...user,
                hasConnection: connections.length > 0,
              };
            })
          );
          return res.status(200).send({ otheruser: userResults });
        }
      }
      return res.status(404).send({ message: "User does not exist" });
    }
    return res.status(500).send({ message: "Unable to fetch request" });
  } catch (error) {
    console.log("unable to search User");
    return res.status(500).send({ error: "Internal Server Error" });
  }
};

export default searchUser;
