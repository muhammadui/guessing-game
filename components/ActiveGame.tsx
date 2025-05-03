"use client";

import { useState, useContext, useEffect, FormEvent, ChangeEvent } from "react";
import { GameContext } from "@/context/GameContext";
import PlayerList from "./PlayerList";

export default function ActiveGame() {
  const { gameState, submitGuess } = useContext(GameContext);
  const [guess, setGuess] = useState<string>("");
  const [remainingTime, setRemainingTime] = useState<number>(
    gameState.timeLimit || 60
  );
  const [attempts, setAttempts] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmitGuess = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!guess.trim()) {
      setErrorMsg("Please enter a guess");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      submitGuess(gameState.code!, guess);
      setGuess(""); // Clear input after submission
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit guess");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (gameState.currentPlayer) {
      setAttempts(gameState.currentPlayer.attempts || 0);
    }
  }, [gameState.currentPlayer]);

  useEffect(() => {
    if (gameState.status !== "active") return;

    const interval = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.status]);

  const maxAttemptsReached = attempts >= 3;
  const canSubmit =
    gameState.status === "active" && !maxAttemptsReached && !isSubmitting;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleGuessChange = (e: ChangeEvent<HTMLInputElement>) => {
    setGuess(e.target.value);
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="card mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Game in Progress</h2>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-600">Time Remaining:</div>
            <div
              className={`font-mono font-bold ${
                remainingTime < 10 ? "text-red-500" : "text-indigo-600"
              }`}
            >
              {formatTime(remainingTime)}
            </div>
          </div>
        </div>

        <div className="bg-indigo-50 p-4 rounded-lg mb-6">
          <div className="text-sm text-indigo-600 uppercase font-medium mb-1">
            Question:
          </div>
          <div className="text-xl font-medium text-indigo-900">
            {gameState.currentQuestion?.text}
          </div>
        </div>

        <div className="mb-6">
          <PlayerList
            players={gameState.players}
            gameMaster={gameState.gameMaster}
          />
        </div>

        {maxAttemptsReached ? (
          <div className="bg-yellow-50 p-4 rounded-lg text-center text-yellow-800 mb-4">
            You have used all 3 attempts. Waiting for other players or time
            expiration.
          </div>
        ) : gameState.isGameMaster ? (
          <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-600 mb-4">
            As the Game Master, you cannot guess the answer.
          </div>
        ) : (
          <form onSubmit={handleSubmitGuess} className="space-y-4">
            <div>
              <label htmlFor="guess" className="block mb-2 text-sm font-medium">
                Your Guess ({3 - attempts} attempts remaining)
              </label>
              <div className="flex space-x-2">
                <input
                  id="guess"
                  type="text"
                  value={guess}
                  onChange={handleGuessChange}
                  className="input flex-grow"
                  placeholder="Type your answer here..."
                  disabled={!canSubmit}
                  required
                />
                <button
                  type="submit"
                  className="btn btn-primary whitespace-nowrap"
                  disabled={!canSubmit}
                >
                  {isSubmitting ? "Submitting..." : "Submit Guess"}
                </button>
              </div>
              {errorMsg && (
                <p className="text-red-500 text-sm mt-1">{errorMsg}</p>
              )}
            </div>
          </form>
        )}

        <div className="mt-6 pt-4 border-t">
          <h3 className="font-semibold mb-2">Game Status</h3>
          <div className="text-sm text-gray-600">
            <p>You have made {attempts} out of 3 possible guesses.</p>
            <p>
              Game will end when someone guesses correctly or time runs out.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
