// apis/genreApi.ts
import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { Types } from "mongoose";
import { genreValidator } from "../validators/genreValidator";
import Book from "../models/book";
import Genre from "../models/genre";

export const genreListApi = async (req: Request, res: Response) => {
  const genreList = await Genre.find().sort({ name: 1 });
  // HTTP 200: return genre list sorted by name
  return res.json({ genreList });
};

export const genreDetailApi = async (req: Request, res: Response) => {
  try {
    new Types.ObjectId(req.params.id);
  } catch (err) {
    // HTTP 404: bad ID provided
    return res.status(404).json("Genre not found");
  }
  const [genre, genreBooks] = await Promise.all([
    Genre.findById(req.params.id),
    Book.find({ genre: req.params.id }),
  ]);
  if (genre === null) {
    // HTTP 404: genre not found
    return res.status(404).json("Genre not found");
  }
  // HTTP 200: return genre and all related books
  return res.json({ genre, genreBooks });
};

export const genreCreateApi = async (req: Request, res: Response) => {
  await genreValidator.run(req);
  const errors = validationResult(req);
  const genreData = { name: req.body.name };
  if (!errors.isEmpty()) {
    // HTTP 400: return genre data and validation errors
    return res.status(400).json({ genre: genreData, errors: errors.mapped() });
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

export const genreUpdateGetApi = async (req: Request, res: Response) => {
  try {
    new Types.ObjectId(req.params.id);
  } catch (err) {
    // HTTP 404: bad ID provided
    return res.status(404).json("Genre not found");
  }
  const genre = await Genre.findById(req.params.id);
  if (genre === null) {
    // HTTP 404: genre not found
    return res.status(404).json("Genre not found");
  }
  // HTTP 200: return genre data
  return res.json({ genre });
};

export const genreUpdateApi = async (req: Request, res: Response) => {
  try {
    new Types.ObjectId(req.params.id);
  } catch (err) {
    // HTTP 404: bad ID provided
    return res.status(404).json("Genre not found");
  }
  const genre = await Genre.findById(req.params.id);
  if (genre === null) {
    // HTTP 404: genre not found
    return res.status(404).json("Genre not found");
  }
  await genreValidator.run(req);
  const errors = validationResult(req);
  const genreData = { name: req.body.name };
  if (!errors.isEmpty()) {
    // HTTP 400: return genre data and validation errors
    return res.status(400).json({ genre: genreData, errors: errors.mapped() });
  }
  // HTTP 302: update genre and redirect to detail view
  await genre.updateOne(genreData);
  return res.redirect(genre.url);
};

export const genreDeleteGetApi = async (req: Request, res: Response) => {
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
  // HTTP 200: return genre and all related books
  return res.json({ genre, genreBooks });
};

export const genreDeleteApi = async (req: Request, res: Response) => {
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
    // HTTP 200: return genre and all related books without deleting
    return res.json({ genre, genreBooks });
  }
  // HTTP 302: delete genre and redirect to list view
  await genre.deleteOne();
  return res.redirect("/catalog/genres");
};
