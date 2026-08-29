import { Request, Response, NextFunction } from "express";
import { verifyCustomerToken } from "../lib/jwt";

declare global {
  namespace Express {
    interface Request {
      customerId?: string;
    }
  }
}

function extractToken(req: Request): string | null {
  const header = req.header("authorization") || req.header("Authorization");
  if (!header || !header.startsWith("Bearer ")) return null;
  return header.slice(7);
}

/** Attaches req.customerId if a valid token is present; never blocks the request. */
export function optionalCustomer(req: Request, _res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (token) {
    const customerId = verifyCustomerToken(token);
    if (customerId) req.customerId = customerId;
  }
  next();
}

/** Requires a valid customer token; responds 401 if missing/invalid. */
export function requireCustomer(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req);
  const customerId = token ? verifyCustomerToken(token) : null;
  if (!customerId) {
    return res.status(401).json({ error: "Please log in to continue." });
  }
  req.customerId = customerId;
  next();
}
