// controllers/genreController.ts
import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import createError from "http-errors";
import { Types } from "mongoose";
import { genreValidator } from "../validators/genreValidator";
import Book from "../models/book";
import Genre from "../models/genre";

export const genreList = async (req: Request, res: Response) => {
  const genreList = await Genre.find().sort({ name: 1 });
  // HTTP 200: render genre list sorted by name
  return res.render("genreList", { title: "Genre List", genreList });
};

export const genreDetail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    new Types.ObjectId(req.params.id);
  } catch (err) {
    // HTTP 404: bad ID provided
    return next(createError(404, "Genre not found"));
  }
  const [genre, genreBooks] = await Promise.all([
    Genre.findById(req.params.id),
    Book.find({ genre: req.params.id }),
  ]);
  if (genre === null) {
    // HTTP 404: genre not found
    return next(createError(404, "Genre not found"));
  }
  // HTTP 200: render genre and all related books
  return res.render("genreDetail", {
    title: "Genre Detail",
    genre,
    genreBooks,
  });
};

export async function genreCreateGet(req: Request, res: Response) {
  return res.render("genreForm", { title: "Create Genre" });
}

export const genreCreate = async (req: Request, res: Response) => {
  await genreValidator.run(req);
  const errors = validationResult(req);
  const genreData = { name: req.body.name };
  if (!errors.isEmpty()) {
    // HTTP 200: render genre data and validation errors
    return res.render("genreForm", {
      title: "Create Genre",
      genre: genreData,
      errors: errors.mapped(),
    });
  }
  const foundGenre = await Genre.findOne(genreData);
  if (foundGenre !== null) {
    // HTTP 302: redirect to its detail page if Genre name exists
    return res.redirect(foundGenre.url);
  }
  // HTTP 302: create genre and redirect to detail view
  const genre = await Genre.create(genreData);
  return res.redirect(genre.url);
};

export const genreUpdateGet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    new Types.ObjectId(req.params.id);
  } catch (err) {
    // HTTP 404: bad ID provided
    return next(createError(404, "Genre not found"));
  }
  const genre = await Genre.findById(req.params.id);
  if (genre === null) {
    // HTTP 404: genre not found
    return next(createError(404, "Genre not found"));
  }
  // HTTP 200: render genre data
  return res.render("genreForm", { title: "Update Genre", genre });
};

export const genreUpdate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    new Types.ObjectId(req.params.id);
  } catch (err) {
    // HTTP 404: bad ID provided
    return next(createError(404, "Genre not found"));
  }
  const genre = await Genre.findById(req.params.id);
  if (genre === null) {
    // HTTP 404: genre not found
    return next(createError(404, "Genre not found"));
  }
  await genreValidator.run(req);
  const errors = validationResult(req);
  const genreData = { name: req.body.name };
  if (!errors.isEmpty()) {
    // HTTP 200: render genre data and validation errors
    return res.render("genreForm", {
      title: "Update Genre",
      genre: genreData,
      errors: errors.mapped(),
    });
  }
  // HTTP 302: update genre and redirect to detail view
  await genre.updateOne(genreData);
  return res.redirect(genre.url);
};

export const genreDeleteGet = async (req: Request, res: Response) => {
  try {
    new Types.ObjectId(req.params.id);
  } catch (err) {
    // HTTP 302: redirect to list view if bad ID provided
    return res.redirect("/catalog/genres");
  }
  const [genre, genreBooks] = await Promise.all([
    Genre.findById(req.params.id),
    Book.find({ genre: req.params.id }),
  ]);
  if (genre === null) {
    // HTTP 302: redirect to list view if genre not found
    return res.redirect("/catalog/genres");
  }
  // HTTP 200: render genre and all related books
  return res.render("genreDelete", {
    title: "Delete Genre",
    genre,
    genreBooks,
  });
};

export const genreDelete = async (req: Request, res: Response) => {
  try {
    new Types.ObjectId(req.body.genreId);
  } catch (err) {
    // HTTP 302: redirect to list view if bad ID provided
    return res.redirect("/catalog/genres");
  }
  const [genre, genreBooks] = await Promise.all([
    Genre.findById(req.body.genreId),
    Book.find({ genre: req.body.genreId }),
  ]);
  if (genre === null) {
    // HTTP 302: redirect to list view if genre not found
    return res.redirect("/catalog/genres");
  }
  if (genreBooks.length > 0) {
    // HTTP 200: render genre and all related books without deleting
    return res.render("genreDelete", {
      title: "Delete Genre",
      genre,
      genreBooks,
    });
  }
  // HTTP 302: delete genre and redirect to list view
  await genre.deleteOne();
  return res.redirect("/catalog/genres");
};
