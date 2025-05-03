"use client";

import { useState, useContext } from "react";
import CreateGame from "@/components/CreateGame";
import JoinGame from "@/components/JoinGame";
import GameLobby from "@/components/GameLobby";
import ActiveGame from "@/components/ActiveGame";
import GameOver from "@/components/GameOver";
import { GameProvider, GameContext } from "@/context/GameContext";

// Define allowed views
type View = "home" | "create" | "join" | "game";

export default function Home() {
  const [view, setView] = useState<View>("home");

  return (
    <GameProvider>
      <div className="flex flex-col items-center">
        {view === "home" && (
          <div className="w-full max-w-md space-y-4">
            <div className="card">
              <h2 className="text-2xl font-semibold mb-4 text-center">
                Welcome!
              </h2>
              <p className="text-gray-600 mb-6 text-center">
                Challenge your friends in a real-time guessing game. Create a
                new game or join an existing one.
              </p>
              <div className="flex flex-col space-y-3">
                <button
                  className="btn btn-primary w-full"
                  onClick={() => setView("create")}
                >
                  Create New Game
                </button>
                <button
                  className="btn btn-secondary w-full"
                  onClick={() => setView("join")}
                >
                  Join Existing Game
                </button>
              </div>
            </div>
          </div>
        )}

        {view === "create" && (
          <CreateGame
            onBack={() => setView("home")}
            onGameCreated={() => setView("game")}
          />
        )}
        {view === "join" && (
          <JoinGame
            onBack={() => setView("home")}
            onGameJoined={() => setView("game")}
          />
        )}
        {view === "game" && <GameScreen onExit={() => setView("home")} />}
      </div>
    </GameProvider>
  );
}

// Props type for GameScreen
interface GameScreenProps {
  onExit: () => void;
}

// GameScreen component handles rendering the appropriate game view based on game state
function GameScreen({ onExit }: GameScreenProps) {
  const { gameState } = useContext(GameContext);

  if (!gameState?.joined) {
    return <div className="card text-center">Loading game...</div>;
  }

  if (gameState.status === "waiting") {
    return <GameLobby onExit={onExit} />;
  }

  if (gameState.status === "active") {
    return <ActiveGame />;
  }

  if (gameState.status === "completed") {
    return <GameOver onExit={onExit} />;
  }

  return <div className="card text-center">Something went wrong...</div>;
}
