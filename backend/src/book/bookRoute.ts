import path from "node:path";
import express from "express";
import {
  createBook,
  deleteBook,
  getSingleBook,
  listBooksAuthor,
  totalBooks,
  updateBook,
} from "./bookController";
import multer from "multer";
import authenticate from "../middleware/authenticate";

const bookRouter = express.Router();

const upload = multer({
  dest: path.resolve(__dirname, "../../public/data/uploads"),

  limits: { fileSize: 1e7 }, // 30mb 30 * 1024 * 1024
});

bookRouter.post(
  "/",
  authenticate,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  createBook
);

bookRouter.get("/count", totalBooks);

bookRouter.patch(
  "/:bookId",
  authenticate,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  updateBook
);

bookRouter.get("/:bookId", getSingleBook);

bookRouter.delete("/:bookId", authenticate, deleteBook);
bookRouter.get("/", authenticate, listBooksAuthor);

export default bookRouter;
