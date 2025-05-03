// server.mjs
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import gameRoutes from "./routes/gameRoutes.mjs";
import { setupSocketHandlers } from "./socket/socketHandler.mjs";

dotenv.config();

// Initialize Express app
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/guessinggame")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/games", gameRoutes);

// Socket.io setup
setupSocketHandlers(io);

// Default route
app.get("/", (req, res) => {
  res.send("Guessing Game API is running");
});

// Start server
const PORT = process.env.PORT || 5003;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
