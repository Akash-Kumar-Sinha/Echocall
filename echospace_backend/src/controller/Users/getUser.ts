import { Request, Response } from "express";
import prisma from "../../db/prismaDb";
import jwt from "jsonwebtoken";

const getUser = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.status(401).send({ error: "Unauthorized" });

    jwt.verify(token, "JWT_SECRET_KEY", async (err, decodedToken) => {
      if (err) return res.status(403).send({ error: "Forbidden" });
      // const profileId = id;
      const userId = (decodedToken as { userId: string }).userId;

      try {
        const foundUser = await prisma.user.findUnique({
          where: { userId: userId },
        });
        if (!foundUser)
          return res.status(404).send({ error: "User not found" });
        const profile = await prisma.profile.findUnique({
          where: { userId: foundUser.userId },
        });
        return res.status(200).send({ profile: profile });
      } catch (error) {
        console.log("Error in fetching user details:", error);
        return res.status(500).send({ error: "Internal Server Error" });
      }
    });
  } catch (error) {
    console.log("Error in fetching user details:", error);
    return res.status(500).send({ error: "Internal Server Error" });
  }
};

export default getUser;
