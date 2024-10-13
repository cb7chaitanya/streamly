import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import prisma from "@repo/db/client";
import bcrypt from "bcrypt";
import { signinSchema, signupSchema } from "@repo/validator/client";
import { JWT_SECRET } from "../conf.js";

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;
    const { success } = signupSchema.safeParse(req.body);
    console.log('name', name)
    console.log('email', email)
    console.log('password', password)
    if (!success) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }
    const userExists = await prisma.user.findUnique({
      where: {
        email: email
      },
    });
    if (userExists) {
      res.status(400).json({ message: "User already exists" });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
        name: name,
      },
    });
    const userId = user.id;
    const token = jwt.sign({ userId }, JWT_SECRET || 'secret');
    res.cookie("token", token);
    res.status(200).json({
      message: "User created successfully",
    });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export const signin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const { success } = signinSchema.safeParse(req.body);
    if(!success){
      res.status(400).json({ message: "Missing required fields" });
      return;
    }
    const user = await prisma.user.findUnique({
      where: {
        email: email
      },
    })
    if (!user) {
      res.status(400).json({ message: "User not found" });
      return;
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(400).json({ message: "Invalid password" });
      return;
    }
    const userId = user.id;
    const token = jwt.sign({ userId }, JWT_SECRET || 'secret');
    res.cookie("token", token);
    res.status(200).json({
      message: "User signed in successfully",
    });
    return;
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
    return;
  }
}

export const signout = async (req: Request, res: Response): Promise<void> => {
  try {
    res.clearCookie("token");
    res.status(200).json({
      message: "User signed out successfully",
    });
    return;
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
    return;
  }
}