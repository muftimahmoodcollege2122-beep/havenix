import { Request, Response, NextFunction } from "express";

const ADMIN_KEY = (process.env.ADMIN_KEY || "havenix-admin").trim();

export function adminAuth(req: Request, res: Response, next: NextFunction) {
  const key = req.header("x-admin-key")?.trim();
  if (!key || key !== ADMIN_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

export { ADMIN_KEY };
