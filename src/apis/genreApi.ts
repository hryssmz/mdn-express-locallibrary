// apis/genreApi.ts
import { Request, Response } from "express";
import Genre from "../models/genre";

export const genreListApi = async (req: Request, res: Response) => {
  const genreList = await Genre.find().sort({ name: 1 });
  return res.json({ genreList });
};
