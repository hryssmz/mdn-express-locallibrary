// apis/authorController.ts
import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import Author from "../models/author";
import Book from "../models/book";

export const authorList = async (req: Request, res: Response) => {
  const authorList = await Author.find().sort({ familyName: 1 });
  return res.render("authorList", { title: "Author List", authorList });
};

export const authorDetail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const [author, authorsBooks] = await Promise.all([
      Author.findById(req.params.id),
      Book.find({ author: req.params.id }, "title summary"),
    ]);
    if (author === null) {
      return next(createError(404, "Author not found"));
    }
    return res.render("authorDetail", {
      title: "Author Detail",
      author,
      authorsBooks,
    });
  } catch (err) {
    return next(err);
  }
};
