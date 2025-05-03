"use client";

import { useContext } from "react";
import { GameContext } from "@/context/GameContext";
import PlayerList from "./PlayerList";

interface GameOverProps {
  onExit: () => void;
}

export default function GameOver({ onExit }: GameOverProps) {
  const { gameState, leaveGame } = useContext(GameContext);

  if (!gameState) {
    return (
      <div className="w-full max-w-2xl">
        <p className="text-center text-gray-500">Loading game data...</p>
      </div>
    );
  }

  const handleExit = () => {
    if (gameState.code) {
      leaveGame(gameState.code);
    }
    onExit();
  };

  const isPlayerWinner = gameState.winner === gameState.currentPlayer?.username;

  const renderWinnerMessage = () => {
    if (gameState.winner) {
      return (
        <div
          className={`p-4 rounded-lg mb-6 text-center ${
            isPlayerWinner
              ? "bg-green-50 text-green-800"
              : "bg-indigo-50 text-indigo-800"
          }`}
        >
          <div className="text-lg font-medium mb-1">
            {isPlayerWinner ? "You won!" : `${gameState.winner} won!`}
          </div>
          <div className="text-sm">
            {isPlayerWinner
              ? "Congratulations! You guessed the correct answer."
              : `${gameState.winner} guessed the correct answer.`}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-yellow-50 p-4 rounded-lg mb-6 text-center text-yellow-800">
        <div className="text-lg font-medium mb-1">Time is up!</div>
        <div className="text-sm">
          Nobody guessed the correct answer in time.
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="card mb-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Game Over</h2>
          <button onClick={handleExit} className="btn btn-danger text-sm">
            Leave Game
          </button>
        </div>

        {/* Question & Answer */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="text-sm text-gray-600 uppercase font-medium mb-1">
            Question:
          </div>
          <div className="text-xl font-medium mb-4">
            {gameState.currentQuestion?.text ?? "No question available"}
          </div>
          <div className="text-sm text-gray-600 uppercase font-medium mb-1">
            Correct Answer:
          </div>
          <div className="text-xl font-medium text-green-600">
            {gameState.answer ?? "No answer available"}
          </div>
        </div>

        {/* Winner Message */}
        {renderWinnerMessage()}

        {/* Player List */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3">Player Scores</h3>
          <PlayerList
            players={gameState.players}
            gameMaster={gameState.gameMaster}
            highlight={gameState.winner ?? undefined}
          />
        </div>

        {/* New Round */}
        <div className="text-center mt-6">
          <p className="text-gray-600 mb-4">
            {gameState.newGameMaster === gameState.currentPlayer?.username
              ? "You're the new Game Master! Create a new question when everyone is ready."
              : `${
                  gameState.newGameMaster ?? "Someone"
                } is the new Game Master and will create the next question.`}
          </p>

          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Start New Round
          </button>
        </div>
      </div>
    </div>
  );
}
