// controllers/genreController.ts
import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import Book from "../models/book";
import Genre from "../models/genre";

export const genreList = async (req: Request, res: Response) => {
  const genreList = await Genre.find().sort({ name: 1 });
  return res.render("genreList", { title: "Genre List", genreList });
};

export const genreDetail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const [genre, genreBooks] = await Promise.all([
      Genre.findById(req.params.id),
      Book.find({ genre: req.params.id }),
    ]);
    if (genre === null) {
      return next(createError(404, "Genre not found"));
    }
    return res.render("genreDetail", {
      title: "Genre Detail",
      genre,
      genreBooks,
    });
  } catch (err) {
    return next(err);
  }
};
