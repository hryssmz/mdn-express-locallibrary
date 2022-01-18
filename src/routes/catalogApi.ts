// routes/catalogApi.ts
import { Router } from "express";
import { authorListApi } from "../apis/authorApi";
import { indexApi, bookListApi } from "../apis/bookApi";
import { bookInstanceListApi } from "../apis/bookInstanceApi";
import { genreListApi } from "../apis/genreApi";

const router = Router();

router.get("/", indexApi);

router.get("/authors", authorListApi);

router.get("/books", bookListApi);

router.get("/book-instances", bookInstanceListApi);

router.get("/genres", genreListApi);

export default router;
