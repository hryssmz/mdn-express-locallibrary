// routes/index.ts
import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  return res.redirect("/catalog");
});

export default router;
