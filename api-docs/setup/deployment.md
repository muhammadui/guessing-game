# Guessing Game API Documentation

## Overview

The Guessing Game API allows users to create and join game sessions where they can guess answers to questions. The API is built using Node.js and Socket.IO for real-time communication.

## Table of Contents

- [Installation](#installation)
- [API Endpoints](#api-endpoints)
  - [User Identification](#user-identification)
  - [Join Game Session](#join-game-session)
  - [Start Game](#start-game)
  - [Submit Guess](#submit-guess)
  - [Leave Game Session](#leave-game-session)
- [Socket Events](#socket-events)
  - [Connection](#connection)
  - [Disconnect](#disconnect)
- [Data Models](#data-models)
  - [User](#user)
  - [GameSession](#gamesession)
- [Error Handling](#error-handling)
- [License](#license)

## Installation

To set up the Guessing Game API, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/muhammadui/guessing-game.git
   cd guessing-game
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

## API Endpoints

### User Identification

- **Event:** `identify`
- **Description:** Identifies a user and associates them with a socket connection.
- **Payload:**
  ```json
  {
    "username": "string",
    "sessionCode": "string (optional)"
  }
  ```
- **Response:**
  ```json
  {
    "userId": "string",
    "username": "string"
  }
  ```

### Join Game Session

- **Event:** `joinGame`
- **Description:** Allows a user to join an existing game session.
- **Payload:**
  ```json
  {
    "sessionCode": "string",
    "username": "string"
  }
  ```
- **Response:**
  ```json
  {
    "gameSession": {
      "id": "string",
      "code": "string",
      "gameMaster": "string",
      "status": "string"
    },
    "isGameMaster": "boolean"
  }
  ```

### Start Game

- **Event:** `startGame`
- **Description:** Starts the game session if the user is the game master.
- **Payload:**
  ```json
  {
    "sessionCode": "string",
    "question": "string",
    "answer": "string"
  }
  ```
- **Response:** No specific response; emits `gameStarted` event.

### Submit Guess

- **Event:** `submitGuess`
- **Description:** Submits a guess for the current question.
- **Payload:**
  ```json
  {
    "sessionCode": "string",
    "guess": "string"
  }
  ```
- **Response:**
  ```json
  {
    "correct": "boolean",
    "attempts": "number",
    "maxAttemptsReached": "boolean"
  }
  ```

### Leave Game Session

- **Event:** `leaveGame`
- **Description:** Allows a user to leave the current game session.
- **Payload:**
  ```json
  {
    "sessionCode": "string"
  }
  ```
- **Response:** No specific response; emits `playerLeft` event.

## Socket Events

### Connection

- **Event:** `connection`
- **Description:** Triggered when a user connects to the server.

### Disconnect

- **Event:** `disconnect`
- **Description:** Triggered when a user disconnects from the server.

## Data Models

### User

- **Fields:**
  - `username`: String, unique identifier for the user.
  - `socketId`: String, the socket ID associated with the user.
  - `currentSession`: ObjectId, reference to the current game session.
  - `totalScore`: Number, total score accumulated by the user.

### GameSession

- **Fields:**
  - `code`: String, unique code for the game session.
  - `gameMaster`: ObjectId, reference to the user who is the game master.
  - `status`: String, current status of the game (e.g., "waiting", "active", "completed").
  - `players`: Array of player objects, each containing:
    - `id`: ObjectId, reference to the user.
    - `username`: String, username of the player.
    - `score`: Number, score of the player.
    - `attempts`: Number, number of attempts made by the player.
  - `currentQuestion`: Object, containing the current question and answer.
  - `startTime`: Date, when the game started.
  - `endTime`: Date, when the game is expected to end.

## Error Handling

The API emits error messages through the socket connection. Common error messages include:

- "Failed to identify user"
- "Game session not found"
- "Cannot join a game in progress"
- "User not authenticated"
- "Only the game master can start the game"
- "At least 2 players are required to start the game"
- "Player not found in this game session"

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

This documentation provides a comprehensive overview of the Guessing Game API, including its functionality, events, and data models. For further questions or contributions, please refer to the repository.
