// @/components/CreateGame.tsx
"use client";

import { useState, useContext, FormEvent, ChangeEvent } from "react";
import { GameContext } from "@/context/GameContext";
import { createGame } from "@/lib/api";

interface CreateGameProps {
  onBack: () => void;
  onGameCreated: () => void;
}

export default function CreateGame({ onBack, onGameCreated }: CreateGameProps) {
  const [username, setUsername] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { joinGameSession } = useContext(GameContext);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!username.trim()) {
      setError("Username is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await createGame(username);
      console.log("Game created:", response);

      // Join the newly created game session
      await joinGameSession(response.code, username);
      onGameCreated();
    } catch (err: any) {
      console.error("Error creating game:", err);
      setError(err?.message || "Failed to create game. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  return (
    <div className="w-full max-w-md">
      <div className="card">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Create New Game
        </h2>
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
              onChange={handleUsernameChange}
              className="input w-full"
              placeholder="Enter your username"
              maxLength={20}
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
              {loading ? "Creating..." : "Create Game"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
