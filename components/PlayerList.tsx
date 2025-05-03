"use client";

interface Player {
  username: string;
  score: number;
}

interface PlayerListProps {
  players?: Player[];
  gameMaster?: string | null;
  // The username of the game master
  highlight?: string;
}

export default function PlayerList({
  players = [],
  gameMaster,
  highlight,
}: PlayerListProps) {
  if (!players || players.length === 0) {
    return (
      <div className="text-center text-gray-500">No players joined yet</div>
    );
  }

  return (
    <div>
      <h3 className="font-semibold mb-2">Players ({players.length})</h3>
      <div className="bg-gray-50 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left p-3 text-sm text-gray-600">Player</th>
              <th className="text-right p-3 text-sm text-gray-600">Score</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player, index) => (
              <tr
                key={index}
                className={`border-t border-gray-200 ${
                  highlight === player.username ? "bg-green-50" : ""
                }`}
              >
                <td className="p-3 flex items-center">
                  <span className="font-medium">{player.username}</span>
                  {player.username === gameMaster && (
                    <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 py-1 px-2 rounded-full">
                      Host
                    </span>
                  )}
                </td>
                <td className="p-3 text-right font-medium">{player.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
