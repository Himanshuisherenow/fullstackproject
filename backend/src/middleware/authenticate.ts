import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "../config/config";
import { User } from "../user/userModel";
import { CustomJwtPayload, IUser } from "../user/userType";

export interface AuthRequest extends Request {
  userId?: IUser;
}
const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token: string =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer", "");

  if (!token) {
    return next(createHttpError(401, "Authorization token is required."));
  }
  try {
    const decodedToken = jwt.verify(
      token,
      config.accessTokenSecret
    ) as CustomJwtPayload;

    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      return next(createHttpError(401, "Invalid Access Token"));
    }

    (req as AuthRequest).userId = user;

    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      return next(createHttpError(401, "Invalid Access Token"));
    } else {
      return next(createHttpError(500, "Internal Server Error"));
    }
  }
};
export default authenticate;
