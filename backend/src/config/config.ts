import { config as Conf } from 'dotenv';

Conf(); 
interface ConfigType {
  port: string;
  databaseURL: string;
  allowOrigin : string;
  cloudinaryCloud : string;

}
function Config():ConfigType{

  const port = process.env.PORT;
  const databaseURL = process.env.MONGO_URI;
  const allowOrigin = process.env.ALLOW_ORIGIN;
  const cloudinaryCloud = process.env.cloudinaryCloud;
  const cloudinaryApiKey = process.env.cloudinaryApiKey;
  const cloudinarySecret = process.env.cloudinarySecret;


  if (!port) {
    throw new Error('Error: PORT is not defined.');
  }
 
  if (!databaseURL) {
    throw new Error('Error: MONGO_URI is not defined.');
  }
  if (!cloudinaryCloud) {
    throw new Error('Error: cloudinaryCloud is not defined.');
  }
  if (!cloudinaryApiKey) {
    throw new Error('Error: cloudinaryApiKey is not defined.');
  }
  if (!cloudinarySecret) {
    throw new Error('Error: cloudinaryCloud is not defined.');
  }
  if(!allowOrigin){
    throw new Error('Error: allowOrigin is not defined.');
 }
  return {
    port,
    databaseURL,
    allowOrigin,
    cloudinaryCloud,
    cloudinaryApiKey,
    cloudinarySecret,
  };
}

export const config : ConfigType = Config();

// import {config as conf} from 'dotenv';
import cloudinary from './cloudnary';

// conf()
// const _config = {

//     port : process.env.PORT,
// }

// export const config = Object.freeze(_config); when you use the only object 