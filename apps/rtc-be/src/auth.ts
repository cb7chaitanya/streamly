import { Request } from "express";
import { JWT_SECRET } from "./conf.js";
import jwt, { JwtPayload } from "jsonwebtoken";
import prisma from "@repo/db/client";

interface AuthRequest extends Request {
  userId?: string;
}

//TODO: Add correct types for socket here rather than any, find type for Duplex interface
const authenticateUpgrade = async (
  req: AuthRequest,
  socket: any,
  head: Buffer,
  callback: Function
) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      socket.send("Unauthorized, missing token");
      socket.close();
      return;
    }

    const verified = jwt.verify(token, JWT_SECRET || "secret") as JwtPayload;
    const user = await prisma.user.findUnique({
      where: {
        id: verified.id,
      },
    });
    if (!user) {
      socket.send("Unauthorized, user not found");
      socket.close();
      return;
    }

    req.userId = verified.id;
    callback();
  } catch (error) {
    socket.send("Failed to authenticate, exited with error:" + error);
    socket.close();
  }
};

export default authenticateUpgrade;
