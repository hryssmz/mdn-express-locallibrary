// controllers/bookController.ts
import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import Author from "../models/author";
import Book from "../models/book";
import BookInstance from "../models/bookInstance";
import Genre from "../models/genre";

export const index = async (req: Request, res: Response) => {
  const [
    bookCount,
    bookInstanceCount,
    bookInstanceAvailableCount,
    authorCount,
    genreCount,
  ] = await Promise.all([
    Book.countDocuments(),
    BookInstance.countDocuments(),
    BookInstance.countDocuments({ status: "Available" }),
    Author.countDocuments(),
    Genre.countDocuments(),
  ]);
  return res.render("index", {
    title: "Local Library Home",
    data: {
      bookCount,
      bookInstanceCount,
      bookInstanceAvailableCount,
      authorCount,
      genreCount,
    },
  });
};

export const bookList = async (req: Request, res: Response) => {
  const bookList = await Book.find({}, "title author")
    .sort({ title: 1 })
    .populate<{ author: Author }>("author");
  return res.render("bookList", { title: "Book List", bookList });
};

export const bookDetail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const [book, bookInstances] = await Promise.all([
      Book.findById(req.params.id)
        .populate<{ author: Author }>("author")
        .populate<{ genre: Genre[] }>("genre"),
      BookInstance.find({ book: req.params.id }),
    ]);
    if (book === null) {
      return next(createError(404, "Book not found"));
    }
    return res.render("bookDetail", { title: book.title, book, bookInstances });
  } catch (err) {
    return next(err);
  }
};
