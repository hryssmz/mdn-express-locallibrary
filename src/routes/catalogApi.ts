// routes/catalogApi.ts
import { Router } from "express";
import { indexApi } from "../apis/bookApi";

const router = Router();

router.get("/", indexApi);

export default router;
