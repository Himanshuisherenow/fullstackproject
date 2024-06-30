import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import globalErrorHandler from "./middleware/globalErrorHandler";
import userRouter from "./user/userRoute";
import bookRouter from "./book/bookRoute";
import { config } from "./config/config";
const app = express();

const corsOptions = {
  origin: config.allowOrigin, // need to change this
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', 
  allowedHeaders: 'Content-Type,Authorization', 
  preflightContinue: false,
  optionsSuccessStatus: 204,
  Credential:false,
};
  
  // Use the CORS middleware  
  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true })); 


  app.get("/", (req, res, next) => {
    res.json({ message: "Welcome to elib apis" });
});

app.use("/api/users", userRouter);
app.use("/api/books", bookRouter);

// Global error handler
app.use(globalErrorHandler);

export default app;