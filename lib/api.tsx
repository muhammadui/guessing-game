const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface CreateGameResponse {
  code: string;
  username: string;
  gameMaster: string;
  players: string[];
  // Add more fields depending on your backend response
}

interface JoinGameResponse {
  code: string;
  players: string[];
  gameMaster: string;
  // Add more fields depending on your backend
}

interface GameDetailsResponse {
  code: string;
  players: string[];
  gameMaster: string;
  question?: string;
  answer?: string;
  // Adjust this depending on your API's /games/:code response
}

export const createGame = async (
  username: string
): Promise<CreateGameResponse> => {
  try {
    const response = await fetch(`${API_URL}/games/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create game");
    }

    return await response.json();
  } catch (error) {
    console.error("API Error creating game:", error);
    throw error;
  }
};

export const joinGame = async (
  code: string,
  username: string
): Promise<JoinGameResponse> => {
  try {
    const response = await fetch(`${API_URL}/games/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code, username }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to join game");
    }

    return await response.json();
  } catch (error) {
    console.error("API Error joining game:", error);
    throw error;
  }
};

export const getGameDetails = async (
  code: string
): Promise<GameDetailsResponse> => {
  try {
    const response = await fetch(`${API_URL}/games/${code}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to get game details");
    }

    return await response.json();
  } catch (error) {
    console.error("API Error getting game details:", error);
    throw error;
  }
};
export const startGame = async (
  code: string,
  question: string,
  answer: string
): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/games/${code}/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question, answer }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to start game");
    }
  } catch (error) {
    console.error("API Error starting game:", error);
    throw error;
  }
};
