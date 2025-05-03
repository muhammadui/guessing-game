"use client";

import { useState, useContext, FormEvent } from "react";
import { GameContext } from "@/context/GameContext";

interface JoinGameProps {
  onBack: () => void;
  onGameJoined: () => void;
}

export default function JoinGame({ onBack, onGameJoined }: JoinGameProps) {
  const [username, setUsername] = useState("");
  const [gameCode, setGameCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { joinGameSession } = useContext(GameContext);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!username.trim()) {
      setError("Username is required");
      return;
    }
    if (!gameCode.trim()) {
      setError("Game code is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await joinGameSession(gameCode.toUpperCase(), username);
      onGameJoined();
    } catch (err: any) {
      console.error("Error joining game:", err);
      setError(
        err.message || "Failed to join game. Please check the game code."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="card">
        <h2 className="text-2xl font-semibold mb-6 text-center">Join Game</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block mb-2 text-sm font-medium"
            >
              Your Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input w-full"
              placeholder="Enter your username"
              maxLength={20}
              required
            />
          </div>

          <div>
            <label
              htmlFor="gameCode"
              className="block mb-2 text-sm font-medium"
            >
              Game Code
            </label>
            <input
              id="gameCode"
              type="text"
              value={gameCode}
              onChange={(e) => setGameCode(e.target.value.toUpperCase())}
              className="input w-full"
              placeholder="Enter 6-character game code"
              maxLength={6}
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={onBack}
              className="btn border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Joining..." : "Join Game"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
