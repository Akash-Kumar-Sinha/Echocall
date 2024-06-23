import { Request, Response } from "express";
import prisma from "../../db/prismaDb";

const verifyToken = async (req: Request, res: Response) => {
  try {
    const { email, token } = req.params;
    const user = await prisma.emailVerification.findUnique({
      where: {
        email: email,
        verificationToken: token,
      },
    });

    if (user) {
      await prisma.emailVerification.update({
        where: {
          email: user.email,
        },
        data: {
          verification: true,
        },
      });
      res.status(200).send("Email verified successfully");
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    console.log("unable to verify", error);
    res.status(500).send("Unable to verify email");
  }
};

export default verifyToken;
