"use client";

import { useState, useContext } from "react";
import { GameContext } from "@/context/GameContext";
import PlayerList from "./PlayerList";

interface GameLobbyProps {
  onExit: () => void;
}

export default function GameLobby({ onExit }: GameLobbyProps) {
  const { gameState, startGame, leaveGame } = useContext(GameContext);

  const [question, setQuestion] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  const isGameMaster = gameState.isGameMaster;
  const playersCount = gameState.players?.length || 0;
  const canStartGame = isGameMaster && playersCount >= 2;

  const handleStartGame = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!question.trim()) {
      setError("Question is required");
      return;
    }
    if (!answer.trim()) {
      setError("Answer is required");
      return;
    }

    if (gameState.code) {
      startGame(gameState.code, question, answer);
    }
  };

  const copyGameCode = async () => {
    if (gameState.code) {
      try {
        await navigator.clipboard.writeText(gameState.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy game code:", err);
      }
    }
  };

  const handleExit = () => {
    if (gameState.code) {
      leaveGame(gameState.code);
    }
    onExit();
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="card mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Game Lobby</h2>
          <button onClick={handleExit} className="btn btn-danger text-sm">
            Leave Game
          </button>
        </div>

        <div className="flex items-center justify-center mb-6 space-x-4">
          <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
            <div className="text-xs text-indigo-600 uppercase font-medium mb-1">
              Game Code
            </div>
            <div className="text-xl font-bold tracking-wider text-indigo-700">
              {gameState.code}
            </div>
          </div>
          <button
            onClick={copyGameCode}
            className="btn bg-indigo-100 text-indigo-700 hover:bg-indigo-200 text-sm"
          >
            {copied ? "Copied!" : "Copy Code"}
          </button>
        </div>

        <div className="mb-6">
          <PlayerList
            players={gameState.players}
            gameMaster={gameState.gameMaster}
          />
        </div>

        <div className="text-center text-gray-600 text-sm mb-2">
          {playersCount < 2 ? (
            <p>
              Waiting for more players to join... (minimum 2 players required)
            </p>
          ) : !isGameMaster ? (
            <p>Waiting for game master to start the game...</p>
          ) : null}
        </div>

        {isGameMaster && (
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-4 text-center">
              Game Master Controls
            </h3>
            <form onSubmit={handleStartGame} className="space-y-4">
              <div>
                <label
                  htmlFor="question"
                  className="block mb-2 text-sm font-medium"
                >
                  Enter Question
                </label>
                <input
                  id="question"
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="input w-full"
                  placeholder="Type your question here..."
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="answer"
                  className="block mb-2 text-sm font-medium"
                >
                  Enter Answer
                </label>
                <input
                  id="answer"
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="input w-full"
                  placeholder="Type the answer here..."
                  required
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div className="text-center">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!canStartGame}
                >
                  Start Game
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
