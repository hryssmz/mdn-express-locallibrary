// apis/genreApi.ts
import { Request, Response } from "express";
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
