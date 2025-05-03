import GameSession from "../models/gameSession.mjs";
import User from "../models/user.mjs";

// Create a new game session
export const createGameSession = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    // Create or find user
    let user = await User.findOne({ username });
    if (!user) {
      user = new User({ username });
      await user.save();
    }

    // Generate a unique 6-character code
    const generateUniqueCode = async () => {
      let code;
      let isUnique = false;

      while (!isUnique) {
        code = Math.random().toString(36).substring(2, 8).toUpperCase();
        const existingSession = await GameSession.findOne({ code });
        if (!existingSession) {
          isUnique = true;
        }
      }

      return code;
    };

    // Create game session
    const gameSession = new GameSession({
      gameMaster: user._id,
      code: await generateUniqueCode(), // Explicitly set the code
    });

    // Add game master as first player
    gameSession.players.push({
      id: user._id,
      username: user.username,
      score: 0,
    });

    await gameSession.save();

    // Update user's current session
    user.currentSession = gameSession._id;
    await user.save();

    res.status(201).json({
      message: "Game session created successfully",
      gameSession: {
        id: gameSession._id,
        code: gameSession.code,
        gameMaster: user.username,
      },
    });
  } catch (error) {
    console.error("Error creating game session:", error);
    res.status(500).json({ message: "Failed to create game session" });
  }
};

// Join a game session
export const joinGameSession = async (req, res) => {
  try {
    const { code, username } = req.body;

    if (!code || !username) {
      return res
        .status(400)
        .json({ message: "Game code and username are required" });
    }

    // Find the game session
    const gameSession = await GameSession.findOne({ code });

    if (!gameSession) {
      return res.status(404).json({ message: "Game session not found" });
    }

    if (gameSession.status === "active") {
      return res
        .status(400)
        .json({ message: "Cannot join a game in progress" });
    }

    // Create or find user
    let user = await User.findOne({ username });
    if (!user) {
      user = new User({ username });
      await user.save();
    }

    // Check if user is already in the game
    const playerExists = gameSession.players.some(
      (player) => player.id.toString() === user._id.toString()
    );

    if (!playerExists) {
      // Add player to game session
      gameSession.players.push({
        id: user._id,
        username: user.username,
        score: 0,
      });
      await gameSession.save();
    }

    // Update user's current session
    user.currentSession = gameSession._id;
    await user.save();

    res.status(200).json({
      message: "Successfully joined game session",
      gameSession: {
        id: gameSession._id,
        code: gameSession.code,
        gameMaster: gameSession.gameMaster,
        players: gameSession.players.map((p) => ({
          username: p.username,
          score: p.score,
        })),
      },
    });
  } catch (error) {
    console.error("Error joining game session:", error);
    res.status(500).json({ message: "Failed to join game session" });
  }
};

// Get game session details
export const getGameSession = async (req, res) => {
  try {
    const { code } = req.params;

    const gameSession = await GameSession.findOne({ code });

    if (!gameSession) {
      return res.status(404).json({ message: "Game session not found" });
    }

    res.status(200).json({
      gameSession: {
        id: gameSession._id,
        code: gameSession.code,
        status: gameSession.status,
        gameMaster: gameSession.gameMaster,
        currentQuestion:
          gameSession.status === "active"
            ? { text: gameSession.currentQuestion.text }
            : null,
        players: gameSession.players.map((p) => ({
          username: p.username,
          score: p.score,
        })),
        winner: gameSession.winner,
        timeLimit: gameSession.timeLimit,
      },
    });
  } catch (error) {
    console.error("Error getting game session:", error);
    res.status(500).json({ message: "Failed to get game session details" });
  }
};

// Start a game session
export const startGameSession = async (req, res) => {
  try {
    const { code, question, answer } = req.body;
    const { userId } = req; // Assuming authentication middleware adds this

    if (!code || !question || !answer) {
      return res
        .status(400)
        .json({ message: "Game code, question, and answer are required" });
    }

    // Find the game session
    const gameSession = await GameSession.findOne({ code });

    if (!gameSession) {
      return res.status(404).json({ message: "Game session not found" });
    }

    // Check if user is the game master
    if (gameSession.gameMaster.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Only the game master can start the session" });
    }

    // Check if there are at least 2 players
    if (gameSession.players.length < 2) {
      return res
        .status(400)
        .json({ message: "At least 2 players are required to start the game" });
    }

    // Update game session
    gameSession.status = "active";
    gameSession.currentQuestion = { text: question, answer };
    gameSession.startTime = new Date();
    gameSession.endTime = new Date(Date.now() + gameSession.timeLimit * 1000);

    await gameSession.save();

    res.status(200).json({ message: "Game session started successfully" });
  } catch (error) {
    console.error("Error starting game session:", error);
    res.status(500).json({ message: "Failed to start game session" });
  }
};
