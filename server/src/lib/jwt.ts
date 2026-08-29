import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "havenix-dev-secret-change-me";
const EXPIRES_IN = "30d";

export function signCustomerToken(customerId: string): string {
  return jwt.sign({ sub: customerId }, JWT_SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyCustomerToken(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { sub: string };
    return decoded.sub;
  } catch {
    return null;
  }
}
