// apis/authorController.ts
import { Request, Response } from "express";
import Author from "../models/author";

export const authorList = async (req: Request, res: Response) => {
  const authorList = await Author.find().sort({ familyName: 1 });
  return res.render("authorList", { title: "Author List", authorList });
};
