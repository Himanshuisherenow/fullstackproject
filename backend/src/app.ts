import express from "express";
import cors from "cors"
import { config } from "./config/config";
const app = express();


const corsOptions: cors.CorsOptions = {
    origin: `http://localhost:${config.port}`, // Replace with your allowed origin(s)
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
    credentials: true, // Allow cookies to be sent with requests
    
  };
  
  // Use the CORS middleware
  app.use(cors(corsOptions));
  


app.get('/',(req,res)=>{
    res.json({message:"hey man "})
})

export default app;