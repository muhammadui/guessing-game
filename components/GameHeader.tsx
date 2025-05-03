"use client";

import React from "react";

interface GameHeaderProps {
  code: string;
  onCopyCode: () => void;
}

const GameHeader: React.FC<GameHeaderProps> = ({ code, onCopyCode }) => {
  return (
    <div className="flex items-center justify-center mb-6 space-x-4">
      <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
        <div className="text-xs text-indigo-600 uppercase font-medium mb-1">
          Game Code
        </div>
        <div className="text-xl font-bold tracking-wider text-indigo-700">
          {code}
        </div>
      </div>
      <button
        type="button"
        onClick={onCopyCode}
        className="btn bg-indigo-100 text-indigo-700 hover:bg-indigo-200 text-sm"
      >
        Copy Code
      </button>
    </div>
  );
};

export default GameHeader;
