import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader: string | undefined = req.headers["authorization"];
  const token: string | undefined = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(403).send({
      message: "No token provided!",
    });
    return;
  }

  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET || "",
    (err: jwt.VerifyErrors | null, decoded: any) => {
      if (err) {
        return res.status(401).send({
          message: "Unauthorized!",
        });
      }
      req.userId = decoded._id;
      next();
    }
  );
};

export default verifyToken;
