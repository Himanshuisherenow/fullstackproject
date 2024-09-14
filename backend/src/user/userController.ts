import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import { JwtPayload, sign, verify } from "jsonwebtoken";
import { config } from "../config/config";
import { CustomJwtPayload, IUser } from "./userType";
import { User } from "./userModel";
import { strict } from "assert";

const generateAccessAndRefreshToken = async (userId: string) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return createHttpError(401, "Authorization token is required.");
    }

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    return createHttpError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};
const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const { username, email, password } = req.body;

  // Validation
  if ([email, username, password].some((field) => field?.trim() === "")) {
    const error = createHttpError(400, "All fields are required");
    return next(error);
  }

  try {
    const user = await User.findOne({ $or: [{ username }, { email }] });
    if (user) {
      const error = createHttpError(
        400,
        "User already exists with this email."
      );
      return next(error);
    }
  } catch (err) {
    return next(createHttpError(500, "Error while getting user"));
  }

  let newUser: IUser;
  try {
    newUser = await User.create({
      username,
      email,
      password,
    });
  } catch (err) {
    return next(createHttpError(500, "Error while creating user."));
  }

  console.log(newUser._id);
  const createdUser = await User.findById(newUser._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    return next(
      createHttpError(500, "Something went wrong while registering the user")
    );
  }

  return res
    .status(201)
    .json(
      next(createHttpError(5200, createdUser, "User registered Successfully"))
    );
};

const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(createHttpError(400, "All fields are required"));
  }

  const user = await User.findOne({
    $or: [{ email }],
  });

  if (!user) {
    return next(createHttpError(404, "User not found."));
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    return next(createHttpError(400, "Username or password incorrect!"));
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json({
      user: loggedInUser,
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
};

const logoutUser = async (req, res) => {
  /// req has access of user._id
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options: {
    httpOnly: true;
    secure: boolean;
    sameSite: "strict" | "lax" | "none";
  } = {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json({ message: "user has been logged out" });
};

const refreshAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    return createHttpError(401, "unauthorized request");
  }

  let user: IUser | null;
  try {
    const decodedToken = verify(
      incomingRefreshToken,
      config.refreshTokenSecret
    );

    if (decodedToken && typeof decodedToken !== "string") {
      const { _id } = decodedToken as CustomJwtPayload;

      user = await User.findById(_id);

      if (!user) {
        return next(createHttpError(401, "Invalid refresh token"));
      }

      if (incomingRefreshToken !== user?.refreshToken) {
        return next(createHttpError(401, "Refresh token is expired or used"));
      }

      const result = await generateAccessAndRefreshToken(user._id!!);

      if (result instanceof createHttpError.HttpError) {
        return next(result);
      }
      const { accessToken, refreshToken: newRefreshToken } = result;

      const options: {
        httpOnly: true;
        secure: boolean;
        sameSite: "strict" | "lax" | "none";
      } = {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      };
      return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json({ accessToken: accessToken, refreshToken: newRefreshToken });
    } else {
    }
  } catch (error) {
    return next(createHttpError(401, error || "Invalid refresh token"));
  }
};
export { createUser, loginUser, refreshAccessToken, logoutUser };
