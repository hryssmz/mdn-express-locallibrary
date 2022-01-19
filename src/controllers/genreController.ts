// controllers/genreController.ts
import { Request, Response } from "express";
import Genre from "../models/genre";

export const genreList = async (req: Request, res: Response) => {
  const genreList = await Genre.find().sort({ name: 1 });
  return res.render("genreList", { title: "Genre List", genreList });
};
