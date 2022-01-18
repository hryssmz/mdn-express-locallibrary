// apis/authorApi.ts
import { Request, Response } from "express";
import Author from "../models/author";
import Book from "../models/book";

export const authorListApi = async (req: Request, res: Response) => {
  const authorList = await Author.find().sort({ familyName: 1 });
  return res.json({ authorList });
};

export const authorDetailApi = async (req: Request, res: Response) => {
  try {
    const [author, authorsBooks] = await Promise.all([
      Author.findById(req.params.id),
      Book.find({ author: req.params.id }, "title summary"),
    ]);
    if (author === null) {
      return res.status(404).json("Author not found");
    }
    return res.json({ author, authorsBooks });
  } catch (err) {
    return res.status(500).json(err);
  }
};
