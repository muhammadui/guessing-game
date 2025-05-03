import express from "express";
import * as gameController from "../controllers/gameController.mjs";

const router = express.Router();

// Game session routes
router.post("/create", gameController.createGameSession);
router.post("/join", gameController.joinGameSession);
router.get("/:code", gameController.getGameSession);
router.post("/start", gameController.startGameSession);

export default router;
