import {Request, Response, NextFunction} from "express";

export function requireAuthHeader(req: Request, res: Response, next: NextFunction)
{
  const header = req.headers.authorization;

  // No existing bearer
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({error: "Missing or malformed Authorization header"});
  }

  const token = header.slice("Bearer ".length).trim();
  if (!token) {
    return res.status(401).json({error: "Missing token"});
  }

  // to do: check is the jwt exist
  req.token = token; // store token for future usage

  next();
}
