// apis/authorApi.ts
import { Request, Response } from "express";
import Author from "../models/author";

export const authorListApi = async (req: Request, res: Response) => {
  const authorList = await Author.find().sort({ familyName: 1 });
  return res.json({ authorList });
};
