import { Request, Response } from "express";
import prisma from "../db/prismaDb";

const checkVerification = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await prisma.emailVerification.findUnique({
      where: {
        email,
      },
    });
    if (user) {
      if (user.verification) {
        return res.status(200).send({ message: "Email is verified", success:"VERIFIED" });
      }
      return res.status(400).send({ message: "Email is not verified" });
    }
  } catch (error) {
    console.log("email is not verified", error);
    return res.status(500).send({ message: "Internal server error" });
  }
};

export default checkVerification;
