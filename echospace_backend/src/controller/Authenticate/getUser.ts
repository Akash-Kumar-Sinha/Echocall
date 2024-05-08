import { Request, Response } from "express";
import prisma from "../../db/prismaDb";
import jwt from "jsonwebtoken";

const getUser = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.status(401).json({ error: "Unauthorized" });

    jwt.verify(token, "JWT_SECRET_KEY", async (err, decodedToken) => {
      if (err) return res.status(403).json({ error: "Forbidden" });
      // const profileId = id;
      const userId = (decodedToken as { id: string }).id;

      try {
        const foundUser = await prisma.user.findUnique({
          where: { id: userId },
        });
        if (!foundUser)
          return res.status(404).json({ error: "User not found" });
        const profile = await prisma.profile.findUnique({
          where: { id: foundUser.userId },
        });
        res.json({ profile: profile });
      } catch (error) {
        console.log("Error in fetching user details:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });
  } catch (error) {
    console.log("Error in fetching user details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export default getUser;
