// routes/catalog.ts
import { Router } from "express";
import apiRouter from "./catalogApi";
import { index } from "../controllers/bookController";

const router = Router();

router.use("/api", apiRouter);

router.get("/", index);

export default router;
