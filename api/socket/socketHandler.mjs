// socket/socketHandler.mjs
import GameSession from "../models/gameSession.mjs";
import User from "../models/user.mjs";

export const setupSocketHandlers = (io) => {
  const activeUsers = new Map(); // socketId -> userId

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // User authentication/identification
    socket.on("identify", async ({ username, sessionCode }) => {
      try {
        let user = await User.findOne({ username });

        if (!user) {
          user = new User({ username });
          await user.save();
        }

        // Update socket ID
        user.socketId = socket.id;
        await user.save();

        // Associate socket with user
        activeUsers.set(socket.id, user._id.toString());

        // Join room for this game session if provided
        if (sessionCode) {
          const gameSession = await GameSession.findOne({ code: sessionCode });

          if (gameSession) {
            socket.join(sessionCode);

            // Broadcast updated player list
            io.to(sessionCode).emit("playerList", {
              players: gameSession.players.map((p) => ({
                username: p.username,
                score: p.score,
              })),
            });
          }
        }

        socket.emit("identified", {
          userId: user._id,
          username: user.username,
        });
      } catch (error) {
        console.error("Error identifying user:", error);
        socket.emit("error", { message: "Failed to identify user" });
      }
    });

    // Join game session
    socket.on("joinGame", async ({ sessionCode, username }) => {
      try {
        const gameSession = await GameSession.findOne({ code: sessionCode });

        if (!gameSession) {
          return socket.emit("error", { message: "Game session not found" });
        }

        if (gameSession.status === "active") {
          return socket.emit("error", {
            message: "Cannot join a game in progress",
          });
        }

        // Find or create user
        let user = await User.findOne({ username });
        if (!user) {
          user = new User({ username, socketId: socket.id });
          await user.save();
        } else {
          user.socketId = socket.id;
          await user.save();
        }

        // Associate socket with user
        activeUsers.set(socket.id, user._id.toString());

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

        // Join socket to game room
        socket.join(sessionCode);

        // Update user's current session
        user.currentSession = gameSession._id;
        await user.save();

        // Broadcast to all clients in the room
        io.to(sessionCode).emit("playerJoined", {
          players: gameSession.players.map((p) => ({
            username: p.username,
            score: p.score,
          })),
        });

        socket.emit("gameJoined", {
          gameSession: {
            id: gameSession._id,
            code: gameSession.code,
            gameMaster: gameSession.gameMaster,
            status: gameSession.status,
          },
          isGameMaster:
            gameSession.gameMaster.toString() === user._id.toString(),
        });
      } catch (error) {
        console.error("Error joining game session:", error);
        socket.emit("error", { message: "Failed to join game session" });
      }
    });

    // Start game
    socket.on("startGame", async ({ sessionCode, question, answer }) => {
      try {
        const userId = activeUsers.get(socket.id);
        if (!userId) {
          return socket.emit("error", { message: "User not authenticated" });
        }

        const gameSession = await GameSession.findOne({ code: sessionCode });

        if (!gameSession) {
          return socket.emit("error", { message: "Game session not found" });
        }

        // Check if user is the game master
        if (gameSession.gameMaster.toString() !== userId) {
          return socket.emit("error", {
            message: "Only the game master can start the game",
          });
        }

        // Check if there are at least 2 players
        if (gameSession.players.length < 2) {
          return socket.emit("error", {
            message: "At least 2 players are required to start the game",
          });
        }

        // Update game session
        gameSession.status = "active";
        gameSession.currentQuestion = { text: question, answer };
        gameSession.startTime = new Date();
        gameSession.endTime = new Date(
          Date.now() + gameSession.timeLimit * 1000
        );
        await gameSession.save();

        // Notify all players that the game has started
        io.to(sessionCode).emit("gameStarted", {
          question: gameSession.currentQuestion.text,
          timeLimit: gameSession.timeLimit,
        });

        // Set timer to end the game
        setTimeout(async () => {
          // Check if the game is still active
          const currentSession = await GameSession.findOne({
            code: sessionCode,
          });
          if (currentSession && currentSession.status === "active") {
            // End the game due to time expiry
            currentSession.status = "completed";
            await currentSession.save();

            // Notify all players
            io.to(sessionCode).emit("gameEnded", {
              reason: "timeExpired",
              answer: currentSession.currentQuestion.answer,
              winner: null,
            });

            // Rotate game master
            await rotateGameMaster(sessionCode);
          }
        }, gameSession.timeLimit * 1000);
      } catch (error) {
        console.error("Error starting game:", error);
        socket.emit("error", { message: "Failed to start game" });
      }
    });

    // Submit guess
    socket.on("submitGuess", async ({ sessionCode, guess }) => {
      try {
        const userId = activeUsers.get(socket.id);
        if (!userId) {
          return socket.emit("error", { message: "User not authenticated" });
        }

        const gameSession = await GameSession.findOne({ code: sessionCode });

        if (!gameSession) {
          return socket.emit("error", { message: "Game session not found" });
        }

        if (gameSession.status !== "active") {
          return socket.emit("error", { message: "Game is not active" });
        }

        // Find the player
        const playerIndex = gameSession.players.findIndex(
          (p) => p.id.toString() === userId
        );

        if (playerIndex === -1) {
          return socket.emit("error", {
            message: "Player not found in this game session",
          });
        }

        // Increment attempt count
        gameSession.players[playerIndex].attempts += 1;

        // Check if answer is correct (case insensitive)
        const isCorrect =
          guess.toLowerCase() ===
          gameSession.currentQuestion.answer.toLowerCase();

        // Check if player has reached max attempts
        const maxAttemptsReached =
          gameSession.players[playerIndex].attempts >= 3;

        if (isCorrect) {
          // Correct answer!
          gameSession.status = "completed";
          gameSession.winner = {
            id: userId,
            username: gameSession.players[playerIndex].username,
          };

          // Add points to the winner
          gameSession.players[playerIndex].score += 10;

          // Update user's total score
          const user = await User.findById(userId);
          if (user) {
            user.totalScore += 10;
            await user.save();
          }

          await gameSession.save();

          // Notify all players
          io.to(sessionCode).emit("gameEnded", {
            reason: "correctAnswer",
            answer: gameSession.currentQuestion.answer,
            winner: {
              username: gameSession.players[playerIndex].username,
              score: gameSession.players[playerIndex].score,
            },
          });

          // Notify the winner specifically
          socket.emit("winnerNotification", { message: "You have won!" });

          // Rotate game master
          await rotateGameMaster(sessionCode);
        } else {
          // Wrong answer
          await gameSession.save();

          // Notify the player
          socket.emit("guessResult", {
            correct: false,
            attempts: gameSession.players[playerIndex].attempts,
            maxAttemptsReached,
          });

          // If max attempts reached, notify all players about this player's status
          if (maxAttemptsReached) {
            io.to(sessionCode).emit("playerMaxAttempts", {
              username: gameSession.players[playerIndex].username,
            });
          }
        }
      } catch (error) {
        console.error("Error submitting guess:", error);
        socket.emit("error", { message: "Failed to submit guess" });
      }
    });

    // Leave game session
    socket.on("leaveGame", async ({ sessionCode }) => {
      try {
        const userId = activeUsers.get(socket.id);
        if (!userId) return;

        await handlePlayerLeaving(userId, sessionCode);
        socket.leave(sessionCode);
      } catch (error) {
        console.error("Error leaving game:", error);
      }
    });

    // Disconnect
    socket.on("disconnect", async () => {
      try {
        const userId = activeUsers.get(socket.id);
        if (!userId) return;

        // Find user's current session
        const user = await User.findById(userId);
        if (user && user.currentSession) {
          const gameSession = await GameSession.findById(user.currentSession);
          if (gameSession) {
            await handlePlayerLeaving(userId, gameSession.code);
          }
        }

        // Remove from active users
        activeUsers.delete(socket.id);
      } catch (error) {
        console.error("Error handling disconnect:", error);
      }

      console.log(`User disconnected: ${socket.id}`);
    });
  });

  // Helper function to handle player leaving
  const handlePlayerLeaving = async (userId, sessionCode) => {
    const gameSession = await GameSession.findOne({ code: sessionCode });
    if (!gameSession) return;

    // Remove player from the session
    const playerIndex = gameSession.players.findIndex(
      (p) => p.id.toString() === userId
    );
    if (playerIndex !== -1) {
      gameSession.players.splice(playerIndex, 1);
    }

    // If this was the game master, assign a new one
    if (
      gameSession.gameMaster.toString() === userId &&
      gameSession.players.length > 0
    ) {
      gameSession.gameMaster = gameSession.players[0].id;
    }

    // Update user record
    await User.findByIdAndUpdate(userId, { $unset: { currentSession: 1 } });

    // Delete session if no players left
    if (gameSession.players.length === 0) {
      await GameSession.findByIdAndDelete(gameSession._id);
      return;
    }

    await gameSession.save();

    // Notify remaining players
    io.to(sessionCode).emit("playerLeft", {
      players: gameSession.players.map((p) => ({
        username: p.username,
        score: p.score,
      })),
      newGameMaster: gameSession.gameMaster.toString(),
    });
  };

  // Helper function to rotate game master
  const rotateGameMaster = async (sessionCode) => {
    const gameSession = await GameSession.findOne({ code: sessionCode });
    if (!gameSession || gameSession.players.length < 2) return;

    // Find current game master index
    const currentMasterIndex = gameSession.players.findIndex(
      (p) => p.id.toString() === gameSession.gameMaster.toString()
    );

    // Set the next player as game master
    const nextMasterIndex =
      (currentMasterIndex + 1) % gameSession.players.length;
    gameSession.gameMaster = gameSession.players[nextMasterIndex].id;
    gameSession.status = "waiting";
    gameSession.currentQuestion = null;
    gameSession.winner = null;
    gameSession.startTime = null;
    gameSession.endTime = null;

    // Reset attempt counts for all players
    gameSession.players.forEach((player) => {
      player.attempts = 0;
    });

    await gameSession.save();

    // Notify all players about the new game master
    io.to(sessionCode).emit("newRound", {
      newGameMaster: gameSession.players[nextMasterIndex].username,
      players: gameSession.players.map((p) => ({
        username: p.username,
        score: p.score,
      })),
    });
  };
};
