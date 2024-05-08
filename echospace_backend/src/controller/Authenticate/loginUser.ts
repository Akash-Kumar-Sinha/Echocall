import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import prisma from "../../db/prismaDb";

const loginUser = async (req: Request, res: Response) => {
  try {
    
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      const payload = {
        email: user.email,
        id: user.id,
        userId: user.userId,
      };

      const token = jwt.sign(payload, "JWT_SECRET_KEY", { expiresIn: "1d" });

      return res.status(200).json({ message: "Login successful", user, token });

    } else {

      return res.status(401).json({ message: "Invalid credentials" });

    }
  } catch (error) {
    console.error("Error in login:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default loginUser;
