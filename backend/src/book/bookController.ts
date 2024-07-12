import path from "node:path";
import fs from "node:fs";
import { Request, Response, NextFunction, response } from "express";
import cloudinary from "../config/cloudinary";
import createHttpError from "http-errors";
import { Book } from "./bookModel";
import { AuthRequest } from "../middleware/authenticate";
import mongoose from "mongoose";
import { IBook } from "./bookType";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
  const { title, genre, description } = req.body;

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  // Assuming 'coverImage' and 'file' fields are in req.files
  const coverImageFile = files.coverImage[0];
  const bookFile = files.file[0];

  const filePath = path.resolve(
    __dirname,
    "../../public/data/uploads",
    coverImageFile.filename
  );
  const bookFilePath = path.resolve(
    __dirname,
    "../../public/data/uploads",
    bookFile.filename
  );

  try {
    // Upload cover image to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      filename_override: coverImageFile.filename,
      folder: "book-covers",
      invalidate: true,
      format: coverImageFile.mimetype.split("/").at(-1), // Adjust as needed
    });

    // Upload book file (PDF) to Cloudinary
    const bookFileUploadResult = await cloudinary.uploader.upload(
      bookFilePath,
      {
        resource_type: "raw",
        filename_override: bookFile.filename,
        folder: "book-pdfs",
        format: "pdf",
        invalidate: true,
      }
    );

    const _req = req as AuthRequest;

    // Create new book in the database using the retrieved public_ids
    const newBook = await Book.create({
      title,
      description,
      genre,
      author: _req.userId,
      coverImage: uploadResult.public_id,
      file: bookFileUploadResult.public_id,
    });

    // Delete temporary files from server's storage
    await fs.promises.unlink(filePath);
    await fs.promises.unlink(bookFilePath);

    res.status(201).json({ id: newBook._id });
  } catch (err) {
    console.error("Error:", err);
    return next(createHttpError(500, "Error while uploading the files."));
  }
};

const updateBook = async (req: Request, res: Response, next: NextFunction) => {
  const { title, description, genre, coverImageUrl, fileUrl } = req.body;
  const bookId = req.params.bookId;

  const book = await Book.findOne({ _id: bookId });

  if (!book) {
    return next(createHttpError(404, "Book not found"));
  }

  // Check access
  const _req = req as AuthRequest;
  if (book.author.toString() !== _req.userId) {
    return next(createHttpError(403, "You can not update others book."));
  }

  // Handle cover image
  let completeCoverImage = book.coverImage; // Default to existing image
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  if (files.coverImage) {
    const filename = files.coverImage[0].filename;
    const converMimeType = files.coverImage[0].mimetype.split("/").at(-1);
    const filePath = path.resolve(
      __dirname,
      "../../public/data/uploads/" + filename
    );
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      filename_override: filename,
      folder: "book-covers",
      format: converMimeType,
    });
    completeCoverImage = uploadResult.public_id;
    await fs.promises.unlink(filePath);
  } else if (coverImageUrl) {
    completeCoverImage = coverImageUrl;
  }

  // Handle file (PDF)
  let completeFileName = book.file; // Default to existing file
  if (files.file) {
    const bookFilePath = path.resolve(
      __dirname,
      "../../public/data/uploads/" + files.file[0].filename
    );
    const bookFileName = files.file[0].filename;
    const uploadResultPdf = await cloudinary.uploader.upload(bookFilePath, {
      resource_type: "raw",
      filename_override: bookFileName,
      folder: "book-pdfs",
      format: "pdf",
    });
    completeFileName = uploadResultPdf.public_id;
    await fs.promises.unlink(bookFilePath);
  } else if (fileUrl) {
    completeFileName = fileUrl;
  }

  const updatedBook = await Book.findOneAndUpdate(
    { _id: bookId },
    {
      title,
      description,
      genre,
      coverImage: completeCoverImage,
      file: completeFileName,
    },
    { new: true }
  );

  res.json(updatedBook);
};

const listBooksAuthor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.userId;
    const { type } = req.query;
    let book: IBook[];
    if (type === "user") {
      book = await Book.aggregate([
        {
          $match: {
            author: new mongoose.Types.ObjectId(userId),
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "author",
            foreignField: "_id",
            as: "authorDetails",
          },
        },
        {
          $unwind: "$authorDetails",
        },
        {
          $addFields: {
            author: {
              _id: "$authorDetails._id",
              name: "$authorDetails.name",
            },
          },
        },
        {
          $project: {
            _id: 1,
            title: 1,
            description: 1,
            genre: 1,
            author: 1,
            coverImage: 1,
            file: 1,
            createdAt: 1,
          },
        },
      ]);
    } else if (type === "all") {
      book = await Book.find({})
        .populate("author", "name")
        .select("_id title description genre coverImage file createdAt author");
    } else {
      return res.status(400).json({ error: "Invalid request type" });
    }

    res.status(200).json(book);
  } catch (error) {
    next(error);
  }
};

const deleteBook = async (req: Request, res: Response, next: NextFunction) => {
  const bookId = req.params.bookId;

  //  const newObjectId = mongoose.Types.ObjectId(bookId);
  const book = await Book.findOne({ _id: bookId });
  console.log(bookId);

  if (!book) {
    return next(createHttpError(404, "Book not found"));
  }

  const _req = req as AuthRequest;
  if (book.author.toString() !== _req.userId) {
    return next(createHttpError(403, "You can not delete others book."));
  }

  const coverFileSplits = book.coverImage.split("/");
  const coverImagePublicId =
    coverFileSplits.at(-2) + "/" + coverFileSplits.at(-1)?.split(".").at(-2);

  const bookFileSplits = book.file.split("/");
  const bookFilePublicId = bookFileSplits.at(-2) + "/" + bookFileSplits.at(-1);

  try {
    await cloudinary.uploader.destroy(coverImagePublicId);
    await cloudinary.uploader.destroy(bookFilePublicId, {
      resource_type: "raw",
    });
  } catch (error) {
    return next(
      createHttpError(500, "problem while deleting the book file and Image")
    );
  }
  try {
    await Book.deleteOne({ _id: bookId });
  } catch (error) {
    return next(createHttpError(500, "error while deleting the book file"));
  }
  return res.sendStatus(204);
};
const bookDownload = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).send("Book not found");
    }

    res.json({ coverImage: book.coverImage, file: book.file });
  } catch (error) {
    return next(createHttpError(500, "error while downlading the book pdf"));
  }
};

const getSingleBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const bookId = req.params.bookId;

  try {
    const book = await Book.findOne({ _id: bookId }).populate("author", "name");
    if (!book) {
      return next(createHttpError(404, "Book not found."));
    }
    return res.json(book);
  } catch (err) {
    console.log(err);
    return next(createHttpError(500, "Error while getting a book"));
  }
};

const totalBooks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const count = await Book.countDocuments();
    res.json({ count });
  } catch (error) {
    return next(createHttpError(500, "Error while counting books"));
  }
};

export {
  createBook,
  updateBook,
  listBooksAuthor,
  getSingleBook,
  deleteBook,
  totalBooks,
  bookDownload,
};
