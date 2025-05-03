import mongoose from "mongoose";

const gameSessionSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    gameMaster: {
      type: String,
      required: true,
    },
    players: [
      {
        id: String,
        username: String,
        score: {
          type: Number,
          default: 0,
        },
        attempts: {
          type: Number,
          default: 0,
        },
      },
    ],
    currentQuestion: {
      text: String,
      answer: String,
    },
    status: {
      type: String,
      enum: ["waiting", "active", "completed"],
      default: "waiting",
    },
    winner: {
      id: String,
      username: String,
    },
    startTime: Date,
    endTime: Date,
    timeLimit: {
      type: Number,
      default: 60, // 60 seconds by default
    },
  },
  { timestamps: true }
);

// Generate a unique 6-character code for game sessions
gameSessionSchema.pre("save", async function (next) {
  if (this.isNew && !this.code) {
    let code;
    let isUnique = false;

    // Generate a unique code
    while (!isUnique) {
      code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const existingSession = await this.constructor.findOne({ code });
      if (!existingSession) {
        isUnique = true;
      }
    }

    this.code = code;
  }
  next();
});

const GameSession = mongoose.model("GameSession", gameSessionSchema);

export default GameSession;
