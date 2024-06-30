import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import {User} from "./userModel";
import { sign } from "jsonwebtoken";
import { config } from '../config/config';
import { IUser } from './userType';
import crypto from "crypto";


function generateSalt(length = Number(config.salt_length) || 16): string {
  const randomBytes = crypto.randomBytes(Math.ceil(length / 2));
  return randomBytes.toString('hex').slice(0, length);
}
// Hash password
function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password,config.salt_length, 100000, 64, 'sha512', (err, derivedKey) => {
      if (err) reject(createHttpError(500, 'Password hashing failed'));
      else resolve(derivedKey.toString('hex'));
    });
  });
}

// Create User Controller
export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      throw createHttpError(400, 'Name, email, and password are required');
    }
    const hashedPassword = await hashPassword(password);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    }) ;

    const savedUser = await newUser.save();
    console.log(savedUser)
      try {
    // Token generation JWT
    const token = sign({ sub: newUser._id }, config.jwtSecret as string, {
      expiresIn: "7d",
      algorithm: "HS256",
    });
    // Response
    res.status(201).json({ accessToken: token });
  } catch (err) {
    return next(createHttpError(500, "Error while signing the jwt token"));
  }
  
  
    // Token generation JWT
     const token : string  = sign({ sub: newUser._id }, config.jwtSecret as string, {
      expiresIn: "7d",
      algorithm: "HS256",
    });
   
 const options = { 
  expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), httpOnly: true ,secure:true}; 
    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
      
      },
    });
  } catch (error) {
    console.log(error+"------------------------------------------");
    // if (error.name === 'MongoError' && error.code === 11000) {
    //   next(createHttpError(409, 'Email already exists'));
    // } else {
    //   next(createHttpError(500, 'User creation failed', { cause: error }));
    // }
  }
};

// Login User Controller
export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw createHttpError(400, 'Email and password are required');
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw createHttpError(401, 'Invalid email or password');
    }

    const hashedPassword = await hashPassword(password);

    if (hashedPassword !== user.password) {
      throw createHttpError(401, 'Invalid email or password');
    }
    const token = sign({ sub: user._id }, config.jwtSecret as string, {
      expiresIn: "7d",
      algorithm: "HS256",
    });
    const options = {
      httpOnly: true,
      secure: true,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };
    res.status(200)
    .cookie( "acessetoken",token ,options )
    .json({  
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
       
      },
    });
  } catch (error) {
    next(error);
  }
};