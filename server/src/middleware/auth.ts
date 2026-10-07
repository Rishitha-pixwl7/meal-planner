import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { HttpError } from "../http.js";

export function jwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set. Add it to server/.env");
  return secret;
}

export function signToken(userId: number): string {
  return jwt.sign({ sub: String(userId) }, jwtSecret(), { expiresIn: "7d" });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) throw new HttpError(401, "Please log in");

  try {
    const payload = jwt.verify(token, jwtSecret()) as jwt.JwtPayload;
    res.locals.userId = Number(payload.sub);
    next();
  } catch {
    throw new HttpError(401, "Your session has expired. Please log in again");
  }
}

export function userIdOf(res: Response): number {
  return res.locals.userId as number;
}
