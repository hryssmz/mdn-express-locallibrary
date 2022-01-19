// controllers/bookInstanceController.ts
import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import Book from "../models/book";
import BookInstance from "../models/bookInstance";

export const bookInstanceList = async (req: Request, res: Response) => {
  const bookInstanceList = await BookInstance.find().populate<{ book: Book }>(
    "book"
  );
  return res.render("bookInstanceList", {
    title: "Book Instance List",
    bookInstanceList,
  });
};

export const bookInstanceDetail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bookInstance = await BookInstance.findById(req.params.id).populate<{
      book: Book;
    }>("book");
    if (bookInstance === null) {
      return next(createError(404, "Book copy not found"));
    }
    return res.render("bookInstanceDetail", {
      title: `Copy: ${bookInstance.book.title}`,
      bookInstance,
    });
  } catch (err) {
    return next(err);
  }
};
