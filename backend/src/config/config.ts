import { config as Conf } from "dotenv";

Conf();
interface ConfigType {
  port: string;
  databaseURL: string;
  allowOrigin: string;
  cloudinaryCloud: string;
  cloudinaryApiKey: string;
  cloudinarySecret: string;
  jwtSecret: string;
  env: string;
  salt_length: string;
  refreshTokenSecret: string;
  accessTokenSecret: string;
  accessTokenExpiry: string;
  refreshTokenExpiry: string;
}
function Config(): ConfigType {
  const port = process.env.PORT;
  const databaseURL = process.env.MONGO_URI;
  const allowOrigin = process.env.ALLOW_ORIGIN;
  const cloudinaryCloud = process.env.cloudinaryCloud;
  const cloudinaryApiKey = process.env.cloudinaryApiKey;
  const cloudinarySecret = process.env.cloudinarySecret;
  const jwtSecret = process.env.JWT_SECRET;
  const env = process.env.NODE_ENV;
  const salt_length = process.env.SALT_LENGTH;
  const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
  const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
  const accessTokenExpiry = process.env.ACCESS_TOKEN_EXPIRY;
  const refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRY;

  if (!refreshTokenExpiry) {
    throw new Error("Error: refreshTokenExpiry is not defined.");
  }
  if (!accessTokenExpiry) {
    throw new Error("Error: accessTokenExpiry is not defined.");
  }
  if (!refreshTokenSecret) {
    throw new Error("Error: refreshTokenSecret is not defined.");
  }
  if (!accessTokenSecret) {
    throw new Error("Error: accessTokenSecret is not defined.");
  }
  if (!port) {
    throw new Error("Error: PORT is not defined.");
  }
  if (!databaseURL) {
    throw new Error("Error: MONGO_URI is not defined.");
  }
  if (!cloudinaryCloud) {
    throw new Error("Error: cloudinaryCloud is not defined.");
  }
  if (!cloudinaryApiKey) {
    throw new Error("Error: cloudinaryApiKey is not defined.");
  }
  if (!cloudinarySecret) {
    throw new Error("Error: cloudinaryCloud is not defined.");
  }
  if (!allowOrigin) {
    throw new Error("Error: allowOrigin is not defined.");
  }
  if (!env) {
    throw new Error("Error: env is not defined.");
  }
  if (!jwtSecret) {
    throw new Error("Error: jwtSecret is not defined.");
  }
  if (!salt_length) {
    throw new Error("Error:  is not defined.");
  }
  return {
    port,
    databaseURL,
    allowOrigin,
    cloudinaryCloud,
    cloudinaryApiKey,
    cloudinarySecret,
    jwtSecret,
    env,
    salt_length,
    refreshTokenSecret,
    accessTokenSecret,
    accessTokenExpiry,
    refreshTokenExpiry,
  };
}

export const config: ConfigType = Config();

// import {config as conf} from 'dotenv';
// conf()
// const _config = {
//     port : process.env.PORT,
// }
// export const config = Object.freeze(_config); when you use the only object
