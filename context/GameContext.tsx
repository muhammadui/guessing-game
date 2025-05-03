"use client";

import { createContext, useState, useEffect, ReactNode } from "react";
import { initializeSocket, getSocket } from "@/lib/socket";

// --- Types ---
interface Player {
  id: string;
  username: string;
  attempts?: number;
  score: number; // Add this
}

interface GameSession {
  code: string;
  status: string;
  gameMaster: string;
}

interface GameState {
  joined: boolean;
  code: string | null;
  players: Player[];
  status: "waiting" | "active" | "completed";
  isGameMaster: boolean;
  gameMaster: string | null;
  currentQuestion: { text: string } | null;
  timeLimit: number;
  winner: string | null;
  answer: string | null;
  currentPlayer: Player | null;
  newGameMaster: string | null;
  reason?: string;
}

interface GameContextProps {
  gameState: GameState;
  joinGameSession: (code: string, username: string) => Promise<void>;
  startGame: (code: string, question: string, answer: string) => void;
  submitGuess: (code: string, guess: string) => void;
  leaveGame: (code: string) => void;
}

// --- Context ---
export const GameContext = createContext<GameContextProps>(
  {} as GameContextProps
);

// --- Provider ---
interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider = ({ children }: GameProviderProps) => {
  const [gameState, setGameState] = useState<GameState>({
    joined: false,
    code: null,
    players: [],
    status: "waiting",
    isGameMaster: false,
    gameMaster: null,
    currentQuestion: null,
    timeLimit: 60,
    winner: null,
    answer: null,
    currentPlayer: null,
    newGameMaster: null,
  });

  useEffect(() => {
    initializeSocket();
    const socket = getSocket();

    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on("error", (data: { message: string }) => {
      console.error("Socket error:", data.message);
    });

    socket.on("identified", (data: { userId: string; username: string }) => {
      console.log("User identified:", data);
      setGameState((prev) => ({
        ...prev,
        currentPlayer: {
          id: data.userId,
          username: data.username,
          score: 0,
          attempts: 0,
        },
      }));
    });

    socket.on("playerJoined", (data: { players: Player[] }) => {
      console.log("Player joined:", data);
      setGameState((prev) => ({
        ...prev,
        players: data.players,
      }));
    });

    socket.on(
      "gameJoined",
      (data: { gameSession: GameSession; isGameMaster: boolean }) => {
        console.log("Game joined:", data);
        setGameState((prev) => ({
          ...prev,
          joined: true,
          code: data.gameSession.code,
          status: data.gameSession.status as GameState["status"],
          gameMaster: data.gameSession.gameMaster,
          isGameMaster: data.isGameMaster,
        }));
      }
    );

    socket.on("playerList", (data: { players: Player[] }) => {
      console.log("Player list updated:", data);
      setGameState((prev) => ({
        ...prev,
        players: data.players,
      }));
    });

    socket.on(
      "gameStarted",
      (data: { question: string; timeLimit: number }) => {
        console.log("Game started:", data);
        setGameState((prev) => ({
          ...prev,
          status: "active",
          currentQuestion: { text: data.question },
          timeLimit: data.timeLimit,
        }));
      }
    );

    socket.on("guessResult", (data: { attempts: number }) => {
      console.log("Guess result:", data);
      setGameState((prev) => ({
        ...prev,
        currentPlayer: prev.currentPlayer
          ? { ...prev.currentPlayer, attempts: data.attempts }
          : null,
      }));
    });

    socket.on("playerMaxAttempts", () => {
      console.log("Player max attempts reached");
      // You could trigger some UI notification here
    });

    socket.on(
      "gameEnded",
      (data: { answer: string; winner: string; reason: string }) => {
        console.log("Game ended:", data);
        setGameState((prev) => ({
          ...prev,
          status: "completed",
          answer: data.answer,
          winner: data.winner,
          reason: data.reason,
        }));
      }
    );

    socket.on("winnerNotification", () => {
      console.log("Winner notification received");
      // You could trigger winner toast here
    });

    socket.on(
      "newRound",
      (data: { players: Player[]; newGameMaster: string }) => {
        console.log("New round started:", data);
        setGameState((prev) => ({
          ...prev,
          status: "waiting",
          players: data.players,
          newGameMaster: data.newGameMaster,
          isGameMaster: prev.currentPlayer?.username === data.newGameMaster,
          currentQuestion: null,
          answer: null,
          winner: null,
        }));
      }
    );

    socket.on(
      "playerLeft",
      (data: { players: Player[]; newGameMaster: string | null }) => {
        console.log("Player left:", data);
        setGameState((prev) => ({
          ...prev,
          players: data.players,
          isGameMaster: prev.currentPlayer?.id === data.newGameMaster,
        }));
      }
    );

    return () => {
      socket.off("connect");
      socket.off("error");
      socket.off("identified");
      socket.off("playerJoined");
      socket.off("gameJoined");
      socket.off("playerList");
      socket.off("gameStarted");
      socket.off("guessResult");
      socket.off("playerMaxAttempts");
      socket.off("gameEnded");
      socket.off("winnerNotification");
      socket.off("newRound");
      socket.off("playerLeft");
    };
  }, []);

  const joinGameSession = (code: string, username: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        const socket = getSocket();
        socket.emit("identify", { username, sessionCode: code });
        socket.emit("joinGame", { sessionCode: code, username });

        const onJoinSuccess = () => {
          socket.off("gameJoined", onJoinSuccess);
          socket.off("error", onJoinError);
          resolve();
        };

        const onJoinError = (data: { message: string }) => {
          socket.off("gameJoined", onJoinSuccess);
          socket.off("error", onJoinError);
          reject(new Error(data.message));
        };

        socket.on("gameJoined", onJoinSuccess);
        socket.on("error", onJoinError);

        setTimeout(() => {
          socket.off("gameJoined", onJoinSuccess);
          socket.off("error", onJoinError);
          reject(new Error("Connection timeout. Please try again."));
        }, 5000);
      } catch (error) {
        console.log(error);
        reject(error as Error);
      }
    });
  };

  const startGame = (code: string, question: string, answer: string) => {
    const socket = getSocket();
    socket.emit("startGame", { sessionCode: code, question, answer });
  };

  const submitGuess = (code: string, guess: string) => {
    const socket = getSocket();
    socket.emit("submitGuess", { sessionCode: code, guess });
  };

  const leaveGame = (code: string) => {
    const socket = getSocket();
    socket.emit("leaveGame", { sessionCode: code });

    setGameState({
      joined: false,
      code: null,
      players: [],
      status: "waiting",
      isGameMaster: false,
      gameMaster: null,
      currentQuestion: null,
      timeLimit: 60,
      winner: null,
      answer: null,
      currentPlayer: null,
      newGameMaster: null,
    });
  };

  return (
    <GameContext.Provider
      value={{
        gameState,
        joinGameSession,
        startGame,
        submitGuess,
        leaveGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
