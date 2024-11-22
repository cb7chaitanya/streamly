import { JWT_SECRET } from "../config/conf.js";
import jwt, { JwtPayload } from "jsonwebtoken";

export const extractUserId = (token: string): string => {
    const verified = jwt.verify(token, JWT_SECRET!) as JwtPayload;
    return verified?.userId;
};