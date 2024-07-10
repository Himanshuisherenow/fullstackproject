import path from "node:path";
import fs from "node:fs";
import { Request, Response, NextFunction } from "express";
import cloudinary from "../config/cloudinary";
import createHttpError from "http-errors";
import { Book } from "./bookModel";
import { AuthRequest } from "../middleware/authenticate";
import { HttpError } from "http-errors";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
    const { title, genre, description } = req.body;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    // 'application/pdf'
    const coverImageMimeType = files.coverImage[0].mimetype.split("/").at(-1);
    const fileName = files.coverImage[0].filename;
    const filePath = path.resolve(
        __dirname,
        "../../public/data/uploads",
        fileName
    );

    try {
        const uploadResult = await cloudinary.uploader.upload(filePath, {
            filename_override: fileName,
            folder: "book-covers",
            format: coverImageMimeType,
        });

        const bookFileName = files.file[0].filename;
        const bookFilePath = path.resolve(
            __dirname,
            "../../public/data/uploads",
            bookFileName
        );

        const bookFileUploadResult = await cloudinary.uploader.upload(
            bookFilePath,
            {
                resource_type: "raw",
                filename_override: bookFileName,
                folder: "book-pdfs",
                format: "pdf",
            }
        );
        const _req = req as AuthRequest;

        const newBook = await Book.create({
            title,
            description,
            genre,
            author: _req.userId,
            coverImage: uploadResult.secure_url,
            file: bookFileUploadResult.secure_url,
        });

        // Delete temp.files
        // todo: wrap in try catch...

        try {
            await fs.promises.unlink(filePath);
            await fs.promises.unlink(bookFilePath);
        } catch (error) {
            return next(
                createHttpError(
                    500,
                    "error while unlinking the files from server's storage"
                )
            );
        }

        res.status(201).json({ id: newBook._id });
    } catch (err) {
        console.log(err);
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
        completeCoverImage = uploadResult.secure_url;
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
        completeFileName = uploadResultPdf.secure_url;
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

const listBooks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // todo: add pagination.
        const book = await Book.find().populate("author", "name");
        res.json(book);
    } catch (err) {
        return next(createHttpError(500, "Error while getting a book"));
    }
};

const getSingleBook = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const bookId = req.params.bookId;

    try {
        const book = await Book.findOne({ _id: bookId })
            // populate author field
            .populate("author", "name");
        if (!book) {
            return next(createHttpError(404, "Book not found."));
        }

        return res.json(book);
    } catch (err) {
        return next(createHttpError(500, "Error while getting a book"));
    }
};

const deleteBook = async (req: Request, res: Response, next: NextFunction) => {
    const bookId = req.params.bookId;

    //  const newObjectId = mongoose.Types.ObjectId(bookId);
    const book = await Book.findOne({ _id: bookId });

    if (!book) {
        return next(createHttpError(404, "Book not found"));
    }

    const _req = req as AuthRequest;
    if (book.author.toString() !== _req.userId) {
        return next(createHttpError(403, "You can not delete others book."));
    }

    const coverFileSplits = book.coverImage.split("/");
    const coverImagePublicId =
        coverFileSplits.at(-2) +
        "/" +
        coverFileSplits.at(-1)?.split(".").at(-2);

    const bookFileSplits = book.file.split("/");
    const bookFilePublicId =
        bookFileSplits.at(-2) + "/" + bookFileSplits.at(-1);
    console.log("bookFilePublicId", bookFilePublicId);

    try {
        await cloudinary.uploader.destroy(coverImagePublicId);
        await cloudinary.uploader.destroy(bookFilePublicId, {
            resource_type: "raw",
        });
    } catch (error) {
        return next(
            createHttpError(
                500,
                "problem while deleting the book file and Image"
            )
        );
    }
    try {
        await Book.deleteOne({ _id: bookId });
    } catch (error) {
        return next(createHttpError(500, "error while deleting the book file"));
    }
    return res.sendStatus(204);
};

export { createBook, updateBook, listBooks, getSingleBook, deleteBook };
