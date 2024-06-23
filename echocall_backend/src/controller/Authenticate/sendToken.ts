import { Request, Response } from "express";
import nodemailer from "nodemailer";

import createToken from "../../utils/createTokens";
import prisma from "../../db/prismaDb";

const sendToken = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res
        .status(200)
        .send({ message: "User already exists", success: "EXIST" });
    }
    const user = await prisma.emailVerification.findUnique({
      where: { email },
    });
    if (user) {
      await prisma.emailVerification.delete({
        where: { email },
      });
    }

    const token = String(await createToken(email));
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await prisma.emailCollection.create({
      data: {
        email,
      },
    });

    await prisma.emailVerification.create({
      data: {
        email: email,
        verificationToken: token,
      },
    });

    const link = `${process.env.SERVER_URL}/auth/verify/${email}/${token}`;

    await transporter.sendMail({
      from: "process.env.EMAIL",
      to: email,
      subject: "Email Verification",
      text: "Welcome",
      html: `<div style="font-family: Arial, sans-serif; text-align: center;">
        <a href="${link}" style="text-decoration: none; color: #007bff; font-size: 18px;">Click here to validate</a>
    </div>`,
    });
    res
      .status(200)
      .send({ message: "Link successfully sent", success: "SEND" });
  } catch (error) {
    console.log("Error in verifying Email");
    res.status(500).send({
      message: "Failed to send verification email",
    });
  }
};

export default sendToken;
