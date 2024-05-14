import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import prisma from "../../db/prismaDb";
import createUserId from "../../utils/createUserid";

const createUser = async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).send({ message: "User already exists" });
    }

    const user = await prisma.emailname.findUnique({
      where: { email, username },
    });

    if (user) {
      const hashedPassword = await bcrypt.hash(password, 12);
      const userId = await createUserId(username);

      const createUser = await prisma.user.create({
        data: {
          email,
          username,
          password: hashedPassword,
          userId,
          profile: {
            create: {
              username,
            },
          },
        },
      });

      await prisma.emailname.delete({
        where: { email, username },
      });

      await prisma.emailVerification.deleteMany({
        where: { email },
      });
      
    const payload = {
      email: createUser.email,
      id: createUser.id,
      userId: createUser.userId
    };
    const token = jwt.sign(payload, "JWT_SECRET_KEY", { expiresIn: "1d" });


      return res.send({ message: "User created successfully" ,token});
    }

    return res.status(400).send({ message: "Unable to create user" });
  } catch (error) {
    console.error("Error in creating user:", error);
    return res.status(500).send({ message: "Internal server error" });
  }
};

export default createUser;
