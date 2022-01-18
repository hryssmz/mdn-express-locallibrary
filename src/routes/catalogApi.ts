// routes/catalogApi.ts
import { Router } from "express";
import {
  authorListApi,
  authorDetailApi,
  authorCreateApi,
  authorUpdateGetApi,
  authorUpdateApi,
} from "../apis/authorApi";
import {
  indexApi,
  bookListApi,
  bookDetailApi,
  bookCreateGetApi,
  bookCreateApi,
  bookUpdateGetApi,
  bookUpdateApi,
} from "../apis/bookApi";
import {
  bookInstanceListApi,
  bookInstanceDetailApi,
  bookInstanceCreateGetApi,
  bookInstanceCreateApi,
  bookInstanceUpdateGetApi,
  bookInstanceUpdateApi,
} from "../apis/bookInstanceApi";
import {
  genreListApi,
  genreDetailApi,
  genreCreateApi,
  genreUpdateGetApi,
  genreUpdateApi,
} from "../apis/genreApi";

const router = Router();

router.get("/", indexApi);

router.get("/authors", authorListApi);
router.get("/author/:id", authorDetailApi);
router.post("/authors/create", authorCreateApi);
router.get("/author/:id/update", authorUpdateGetApi);
router.post("/author/:id/update", authorUpdateApi);

router.get("/books", bookListApi);
router.get("/book/:id", bookDetailApi);
router.get("/books/create", bookCreateGetApi);
router.post("/books/create", bookCreateApi);
router.get("/book/:id/update", bookUpdateGetApi);
router.post("/book/:id/update", bookUpdateApi);

router.get("/book-instances", bookInstanceListApi);
router.get("/book-instance/:id", bookInstanceDetailApi);
router.get("/book-instances/create", bookInstanceCreateGetApi);
router.post("/book-instances/create", bookInstanceCreateApi);
router.get("/book-instance/:id/update", bookInstanceUpdateGetApi);
router.post("/book-instance/:id/update", bookInstanceUpdateApi);

router.get("/genres", genreListApi);
router.get("/genre/:id", genreDetailApi);
router.post("/genres/create", genreCreateApi);
router.get("/genre/:id/update", genreUpdateGetApi);
router.post("/genre/:id/update", genreUpdateApi);

export default router;
