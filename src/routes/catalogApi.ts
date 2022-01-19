// routes/catalogApi.ts
import { Router } from "express";
import {
  authorListApi,
  authorDetailApi,
  authorCreateApi,
  authorUpdateGetApi,
  authorUpdateApi,
  authorDeleteGetApi,
  authorDeleteApi,
} from "../apis/authorApi";
import {
  indexApi,
  bookListApi,
  bookDetailApi,
  bookCreateGetApi,
  bookCreateApi,
  bookUpdateGetApi,
  bookUpdateApi,
  bookDeleteGetApi,
  bookDeleteApi,
} from "../apis/bookApi";
import {
  bookInstanceListApi,
  bookInstanceDetailApi,
  bookInstanceCreateGetApi,
  bookInstanceCreateApi,
  bookInstanceUpdateGetApi,
  bookInstanceUpdateApi,
  bookInstanceDeleteGetApi,
  bookInstanceDeleteApi,
} from "../apis/bookInstanceApi";
import {
  genreListApi,
  genreDetailApi,
  genreCreateApi,
  genreUpdateGetApi,
  genreUpdateApi,
  genreDeleteGetApi,
  genreDeleteApi,
} from "../apis/genreApi";

const router = Router();

router.get("/", indexApi);

router.get("/authors", authorListApi);
router.get("/author/:id", authorDetailApi);
router.post("/authors/create", authorCreateApi);
router.get("/author/:id/update", authorUpdateGetApi);
router.post("/author/:id/update", authorUpdateApi);
router.get("/author/:id/delete", authorDeleteGetApi);
router.post("/author/:id/delete", authorDeleteApi);

router.get("/books", bookListApi);
router.get("/book/:id", bookDetailApi);
router.get("/books/create", bookCreateGetApi);
router.post("/books/create", bookCreateApi);
router.get("/book/:id/update", bookUpdateGetApi);
router.post("/book/:id/update", bookUpdateApi);
router.get("/book/:id/delete", bookDeleteGetApi);
router.post("/book/:id/delete", bookDeleteApi);

router.get("/book-instances", bookInstanceListApi);
router.get("/book-instance/:id", bookInstanceDetailApi);
router.get("/book-instances/create", bookInstanceCreateGetApi);
router.post("/book-instances/create", bookInstanceCreateApi);
router.get("/book-instance/:id/update", bookInstanceUpdateGetApi);
router.post("/book-instance/:id/update", bookInstanceUpdateApi);
router.get("/book-instance/:id/delete", bookInstanceDeleteGetApi);
router.post("/book-instance/:id/delete", bookInstanceDeleteApi);

router.get("/genres", genreListApi);
router.get("/genre/:id", genreDetailApi);
router.post("/genres/create", genreCreateApi);
router.get("/genre/:id/update", genreUpdateGetApi);
router.post("/genre/:id/update", genreUpdateApi);
router.get("/genre/:id/delete", genreDeleteGetApi);
router.post("/genre/:id/delete", genreDeleteApi);

export default router;
