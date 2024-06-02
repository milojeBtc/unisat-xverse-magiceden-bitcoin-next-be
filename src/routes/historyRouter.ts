import express from "express";
import {
  writeHistory
} from "../controller/raffleController";

const router = express.Router();

router.post("/history", async (req, res, next) => {
  try {
    await writeHistory(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
