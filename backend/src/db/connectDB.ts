import mongoose ,  {ConnectOptions} from 'mongoose';
import { config } from '../config/config';

const uri : string = config.databaseURL; 

let isConnected = false;
let connectionAttempts = 0;
const maxConnectionAttempts = 3; 

const clientOptions : ConnectOptions = {
  authSource: 'admin',
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true
  }
};

export default async function connectDB(): Promise<void> {
  if (!uri) {
    console.error('Error: MongoDB connection string is undefined.');
    process.exit(1); 
  }
  console.log('MongoDB URI:', uri);
  while (connectionAttempts < maxConnectionAttempts && !isConnected) {
    try {

      const connection = await mongoose.connect(uri as string, clientOptions);
        mongoose.connection.on("connected",(err)=>{
        console.log("database connected successfully",err)
      })
      mongoose.connection.on("error",()=>{
        console.log("Failed to connect to database")
      })
      isConnected = true;
      //console.log(connection)
      console.log('Connected to MongoDB via Mongoose');

    } catch (error) {
      
     console.log(error)
      console.error(`Error connecting to MongoDB: Attempt ${connectionAttempts + 1}/${maxConnectionAttempts}`, error);
      connectionAttempts++;
      await retryConnection(); 
     
    }
  }

  if (!isConnected) {
    console.error(`Unable to connect to MongoDB after ${maxConnectionAttempts} attempts`);
    
    process.exit(1);
  }
}
async function disconnect(): Promise<void> {
  try {
    if (isConnected) {
      await mongoose.disconnect();
      isConnected = false;
      console.log('Disconnected from MongoDB');
    }
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
    await retryDisconnection();
  }
}

async function retryConnection(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 5000)); 
}

async function retryDisconnection(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 5000)); 
  await disconnect();
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('Closing MongoDB connection due to application termination');
  await disconnect();
  process.exit(0); 
});
export { disconnect };
