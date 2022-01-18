// apis/bookInstanceApi.ts
import { Request, Response } from "express";
import Book from "../models/book";
import BookInstance from "../models/bookInstance";

export const bookInstanceListApi = async (req: Request, res: Response) => {
  const bookInstanceList = await BookInstance.find().populate<{ book: Book }>(
    "book"
  );
  return res.json({ bookInstanceList });
};

export const bookInstanceDetailApi = async (req: Request, res: Response) => {
  try {
    const bookInstance = await BookInstance.findById(req.params.id).populate<{
      book: Book;
    }>("book");
    if (bookInstance === null) {
      return res.status(404).json("Book copy not found");
    }
    return res.json({ bookInstance });
  } catch (err) {
    return res.status(500).json(err);
  }
};
