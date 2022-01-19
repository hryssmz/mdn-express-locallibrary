// controllers/genreController.ts
import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
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

export async function genreCreateGet(req: Request, res: Response) {
  return res.render("genreForm", { title: "Create Genre" });
}

export const genreCreate = [
  body("name", "Genre name required").trim().isLength({ min: 1 }).escape(),

  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("genreForm", {
        title: "Create Genre",
        genre: req.body,
        errors: errors.array(),
      });
    }
    try {
      const foundGenre = await Genre.findOne(req.body);
      if (foundGenre !== null) {
        // Genre exists, redirect to its detail page.
        return res.redirect(foundGenre.url);
      }
      const genre = await Genre.create(req.body);
      return res.redirect(genre.url);
    } catch (err) {
      return next(err);
    }
  },
];
export const genreUpdateGet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const genre = await Genre.findById(req.params.id);
    if (genre === null) {
      return next(createError(404, "Genre not found"));
    }
    return res.render("genreForm", { title: "Update Genre", genre });
  } catch (err) {
    return next(err);
  }
};

export const genreUpdate = [
  body("name", "Genre name required").trim().isLength({ min: 1 }).escape(),

  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("genreForm", {
        title: "Update Genre",
        genre: req.body,
        errors: errors.array(),
      });
    }
    try {
      const genre = await Genre.findByIdAndUpdate(req.params.id, req.body);
      if (genre === null) {
        return next(createError(404, "Genre not found"));
      }
      return res.redirect(genre.url);
    } catch (err) {
      return next(err);
    }
  },
];
