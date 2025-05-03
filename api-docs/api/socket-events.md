# Guessing Game API Documentation

## Overview

The Guessing Game API allows users to create and join guessing games in real-time using WebSocket connections. Players can submit guesses, and the game master can start the game and manage the game sessions.

## Table of Contents

- [Getting Started](#getting-started)
- [WebSocket Connection](#websocket-connection)
- [Events](#events)
  - [Connection](#connection)
  - [Identify User](#identify-user)
  - [Join Game](#join-game)
  - [Start Game](#start-game)
  - [Submit Guess](#submit-guess)
  - [Leave Game](#leave-game)
  - [Disconnect](#disconnect)
- [Error Handling](#error-handling)
- [Data Models](#data-models)
  - [User](#user)
  - [GameSession](#gamesession)
- [Helper Functions](#helper-functions)

## Getting Started

To use the Guessing Game API, you need to establish a WebSocket connection to the server. The server listens for incoming connections and handles various game-related events.

### WebSocket Connection

Connect to the server using a WebSocket client. The server URL is typically `ws://<server-address>:<port>`.

## Events

### Connection

- **Event:** `connection`
- **Description:** Triggered when a user connects to the server.
- **Payload:** None
- **Response:** Logs the user's socket ID.

### Identify User

- **Event:** `identify`
- **Description:** Identifies a user by their username and associates them with a socket ID.
- **Payload:**
  ```json
  {
    "username": "string",
    "sessionCode": "string" // optional
  }
  ```
- **Response:**
  - Emits `identified` with user details:
    ```json
    {
      "userId": "string",
      "username": "string"
    }
    ```
  - Emits `error` if identification fails.

### Join Game

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
  - Emits `gameJoined` with game session details:
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
  - Emits `error` if the game session is not found or cannot be joined.

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
- **Response:**
  - Emits `gameStarted` with the current question and time limit.
  - Emits `error` if the user is not the game master or if there are not enough players.

### Submit Guess

- **Event:** `submitGuess`
- **Description:** Allows a player to submit a guess for the current question.
- **Payload:**
  ```json
  {
    "sessionCode": "string",
    "guess": "string"
  }
  ```
- **Response:**
  - Emits `guessResult` with the result of the guess:
    ```json
    {
      "correct": "boolean",
      "attempts": "number",
      "maxAttemptsReached": "boolean"
    }
    ```
  - Emits `gameEnded` if the guess is correct or if the player has reached the maximum attempts.

### Leave Game

- **Event:** `leaveGame`
- **Description:** Allows a user to leave the current game session.
- **Payload:**
  ```json
  {
    "sessionCode": "string"
  }
  ```
- **Response:** Emits `playerLeft` to notify remaining players.

### Disconnect

- **Event:** `disconnect`
- **Description:** Triggered when a user disconnects from the server.
- **Response:** Logs the user's disconnection and handles cleanup.

## Error Handling

The API emits an `error` event with a message whenever an operation fails. The error message will provide details about the failure.

### Error Response Format
```json
{
  "message": "string"
}
```

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
  - `players`: Array, list of players in the game session.
  - `currentQuestion`: Object, contains the current question and answer.
  - `startTime`: Date, when the game started.
  - `endTime`: Date, when the game ends.
  - `timeLimit`: Number, time limit for the game in seconds.

## Helper Functions

### handlePlayerLeaving

Handles the logic when a player leaves a game session, including updating the game session and notifying other players.

### rotateGameMaster

Rotates the game master to the next player in the session when the current game master leaves or the game ends.

---

This documentation provides a comprehensive overview of the Guessing Game API, including how to connect, the events available, and the data models used. For further assistance, please refer to the source code or contact the API maintainers.