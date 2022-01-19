// apis/genreApi.ts
import { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import Book from "../models/book";
import Genre from "../models/genre";

export const genreListApi = async (req: Request, res: Response) => {
  const genreList = await Genre.find().sort({ name: 1 });
  return res.json({ genreList });
};

export const genreDetailApi = async (req: Request, res: Response) => {
  try {
    const [genre, genreBooks] = await Promise.all([
      Genre.findById(req.params.id),
      Book.find({ genre: req.params.id }),
    ]);
    if (genre === null) {
      return res.status(404).json("Genre not found");
    }
    return res.json({ genre, genreBooks });
  } catch (err) {
    return res.status(500).json(err);
  }
};

export const genreCreateApi = [
  body("name", "Genre name required").trim().isLength({ min: 1 }).escape(),

  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ genre: req.body, errors: errors.array() });
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
      return res.status(500).json(err);
    }
  },
];

export const genreUpdateGetApi = async (req: Request, res: Response) => {
  try {
    const genre = await Genre.findById(req.params.id);
    if (genre === null) {
      return res.status(404).json("Genre not found");
    }
    return res.json({ genre });
  } catch (err) {
    return res.status(500).json(err);
  }
};

export const genreUpdateApi = [
  body("name", "Genre name required").trim().isLength({ min: 1 }).escape(),

  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ genre: req.body, errors: errors.array() });
    }
    try {
      const genre = await Genre.findByIdAndUpdate(req.params.id, req.body);
      if (genre === null) {
        return res.status(404).json("Genre not found");
      }
      return res.redirect(genre.url);
    } catch (err) {
      res.status(500).json(err);
    }
  },
];

export const genreDeleteGetApi = async (req: Request, res: Response) => {
  try {
    const [genre, genreBooks] = await Promise.all([
      Genre.findById(req.params.id),
      Book.find({ genre: req.params.id }),
    ]);
    if (genre === null) {
      return res.redirect("/catalog/genres");
    }
    return res.json({ genre, genreBooks });
  } catch (err) {
    return res.status(500).json(err);
  }
};

export const genreDeleteApi = async (req: Request, res: Response) => {
  try {
    const [genre, genreBooks] = await Promise.all([
      Genre.findById(req.body.genreId),
      Book.find({ genre: req.body.genreId }),
    ]);
    if (genreBooks.length > 0) {
      return res.json({ genre, genreBooks });
    }
    await Genre.findByIdAndRemove(req.body.genreId);
    return res.redirect("/catalog/genres");
  } catch (err) {
    return res.status(500).json(err);
  }
};
