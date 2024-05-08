import { Request, Response } from "express";
import prisma from "../../db/prismaDb";

const createUsername = async (req: Request, res: Response) => {
  try {
    const { username, email } = req.body;

    if (!username || username.trim() === "") {
      return res.status(400).send({ message: "Username cannot be empty" });
    }

    if (/\s/.test(username)) {
      return res
        .status(400)
        .send({ message: "Username cannot contain spaces" });
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (existingUser) {
      return res.status(400).send({ message: "Username is not available" });
    }

    const checkVerification = await prisma.emailVerification.findUnique({
      where: {
        email,
      },
    });
    if (!checkVerification?.verification) {
      return res.status(400).send({ message: "Email is not verified" });
    }

    const user = await prisma.emailname.findUnique({
      where: { username },
    });

    if (user) {
      await prisma.emailname.delete({
        where: { username },
      });
    }

    const createUser = await prisma.emailname.create({
      data: {
        email,
        username,
      },
    });
    if (createUser) {
      return res
        .status(200)
        .send({ message: "Assigned username", success: "ASSIGNED" });
    }
    return res.status(500).send({ message: "Username already taken" });
  } catch (error) {
    console.log("unable to generate UserName", error);
    return res.status(500).send({ message: "Failed to assign username" });
  }
};

export default createUsername;
