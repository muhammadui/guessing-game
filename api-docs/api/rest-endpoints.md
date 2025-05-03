# Guessing Game API Documentation

## Overview

The Guessing Game API allows users to create and join guessing games in real-time using WebSocket connections. Players can submit guesses, and the game master can start the game and manage players. This API is built using Node.js and MongoDB.

## Table of Contents

- [Installation](#installation)
- [API Endpoints](#api-endpoints)
- [WebSocket Events](#websocket-events)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
- [Contributing](#contributing)

## Installation

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

4. The server will run on `http://localhost:3000`.

## API Endpoints

### User Authentication

- **Identify User**
  - **Event:** `identify`
  - **Payload:**
    ```json
    {
      "username": "string",
      "sessionCode": "string" // optional
    }
    ```
  - **Response:**
    ```json
    {
      "userId": "string",
      "username": "string"
    }
    ```

### Game Session Management

- **Join Game Session**

  - **Event:** `joinGame`
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

- **Start Game**

  - **Event:** `startGame`
  - **Payload:**
    ```json
    {
      "sessionCode": "string",
      "question": "string",
      "answer": "string"
    }
    ```
  - **Response:** No response; emits `gameStarted` event.

- **Submit Guess**

  - **Event:** `submitGuess`
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

- **Leave Game Session**
  - **Event:** `leaveGame`
  - **Payload:**
    ```json
    {
      "sessionCode": "string"
    }
    ```
  - **Response:** No response.

## WebSocket Events

### Connection Events

- **Connection**

  - Triggered when a user connects to the server.
  - Logs the socket ID.

- **Disconnection**
  - Triggered when a user disconnects from the server.
  - Logs the socket ID and handles player leaving.

### Game Events

- **Player List**

  - Emitted when a user identifies themselves and joins a game session.
  - Payload:
    ```json
    {
      "players": [
        {
          "username": "string",
          "score": "number"
        }
      ]
    }
    ```

- **Game Started**

  - Emitted when the game is started.
  - Payload:
    ```json
    {
      "question": "string",
      "timeLimit": "number"
    }
    ```

- **Game Ended**

  - Emitted when the game ends.
  - Payload:
    ```json
    {
      "reason": "string",
      "answer": "string",
      "winner": {
        "username": "string",
        "score": "number"
      }
    }
    ```

- **Player Joined**

  - Emitted when a new player joins the game.
  - Payload:
    ```json
    {
      "players": [
        {
          "username": "string",
          "score": "number"
        }
      ]
    }
    ```

- **Player Left**

  - Emitted when a player leaves the game.
  - Payload:
    ```json
    {
      "players": [
        {
          "username": "string",
          "score": "number"
        }
      ],
      "newGameMaster": "string"
    }
    ```

- **New Round**
  - Emitted when the game master is rotated.
  - Payload:
    ```json
    {
      "newGameMaster": "string",
      "players": [
        {
          "username": "string",
          "score": "number"
        }
      ]
    }
    ```

### Notifications

- **Winner Notification**
  - Emitted to the winner when they answer correctly.
  - Payload:
    ```json
    {
      "message": "You have won!"
    }
    ```

## Data Models

### User Model

```javascript
{
  _id: ObjectId,
  username: String,
  socketId: String,
  currentSession: ObjectId,
  totalScore: Number
}
```

### Game Session Model

```javascript
{
  _id: ObjectId,
  code: String,
  gameMaster: ObjectId,
  players: [
    {
      id: ObjectId,
      username: String,
      score: Number,
      attempts: Number
    }
  ],
  status: String, // "waiting", "active", "completed"
  currentQuestion: {
    text: String,
    answer: String
  },
  startTime: Date,
  endTime: Date,
  timeLimit: Number // in seconds
}
```

## Error Handling

The API emits error messages in response to various failure scenarios. The error message format is as follows:

```json
{
  "message": "Error description"
}
```

Common error scenarios include:

- User not found
- Game session not found
- User not authenticated
- Game is not active
- Cannot join a game in progress

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeature`).
3. Make your changes and commit them (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Open a pull request.

---

This documentation provides a comprehensive overview of the Guessing Game API, including its functionality, events, and data models. For any questions or issues, please refer to the repository's issue tracker.
