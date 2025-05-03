# Guessing Game API Documentation

## Overview

The Guessing Game API allows users to create and join game sessions where they can guess answers to questions. The API is built using WebSocket for real-time communication and MongoDB for data storage.

## Table of Contents

- [Getting Started](#getting-started)
- [WebSocket Events](#websocket-events)
  - [Connection](#connection)
  - [Identify User](#identify-user)
  - [Join Game](#join-game)
  - [Start Game](#start-game)
  - [Submit Guess](#submit-guess)
  - [Leave Game](#leave-game)
  - [Disconnect](#disconnect)
- [Data Models](#data-models)
  - [User](#user)
  - [GameSession](#gamesession)
- [Error Handling](#error-handling)

## Getting Started

To use the Guessing Game API, you need to establish a WebSocket connection to the server. The server will emit events and listen for specific actions from the client.

### WebSocket Connection

```javascript
const socket = io('http://your-server-url');
```

## WebSocket Events

### Connection

When a user connects to the server, the following event is emitted:

- **Event:** `connection`
- **Payload:** `{ socketId: string }`
- **Description:** Indicates that a user has connected to the server.

### Identify User

- **Event:** `identify`
- **Payload:** `{ username: string, sessionCode?: string }`
- **Response:** 
  - **Event:** `identified`
    - **Payload:** `{ userId: string, username: string }`
  - **Event:** `error`
    - **Payload:** `{ message: string }`
- **Description:** Identifies the user and associates them with a socket ID. Optionally, the user can provide a session code to join a game session.

### Join Game

- **Event:** `joinGame`
- **Payload:** `{ sessionCode: string, username: string }`
- **Response:**
  - **Event:** `gameJoined`
    - **Payload:** `{ gameSession: { id: string, code: string, gameMaster: string, status: string }, isGameMaster: boolean }`
  - **Event:** `playerList`
    - **Payload:** `{ players: Array<{ username: string, score: number }> }`
  - **Event:** `error`
    - **Payload:** `{ message: string }`
- **Description:** Allows a user to join an existing game session.

### Start Game

- **Event:** `startGame`
- **Payload:** `{ sessionCode: string, question: string, answer: string }`
- **Response:**
  - **Event:** `gameStarted`
    - **Payload:** `{ question: string, timeLimit: number }`
  - **Event:** `error`
    - **Payload:** `{ message: string }`
- **Description:** Starts the game session. Only the game master can start the game.

### Submit Guess

- **Event:** `submitGuess`
- **Payload:** `{ sessionCode: string, guess: string }`
- **Response:**
  - **Event:** `guessResult`
    - **Payload:** `{ correct: boolean, attempts: number, maxAttemptsReached: boolean }`
  - **Event:** `gameEnded`
    - **Payload:** `{ reason: string, answer: string, winner: { username: string, score: number } }`
  - **Event:** `playerMaxAttempts`
    - **Payload:** `{ username: string }`
  - **Event:** `error`
    - **Payload:** `{ message: string }`
- **Description:** Submits a guess for the current question. The game will check if the guess is correct.

### Leave Game

- **Event:** `leaveGame`
- **Payload:** `{ sessionCode: string }`
- **Response:** 
  - **Event:** `playerLeft`
    - **Payload:** `{ players: Array<{ username: string, score: number }>, newGameMaster: string }`
- **Description:** Allows a user to leave the game session.

### Disconnect

- **Event:** `disconnect`
- **Response:** 
  - **Event:** `userDisconnected`
    - **Payload:** `{ socketId: string }`
- **Description:** Indicates that a user has disconnected from the server.

## Data Models

### User

- **Fields:**
  - `username`: String (unique identifier for the user)
  - `socketId`: String (the socket ID associated with the user)
  - `currentSession`: ObjectId (reference to the current game session)
  - `totalScore`: Number (total score accumulated by the user)

### GameSession

- **Fields:**
  - `code`: String (unique code for the game session)
  - `gameMaster`: ObjectId (reference to the user who is the game master)
  - `status`: String (current status of the game: "waiting", "active", "completed")
  - `players`: Array (list of players in the game session)
  - `currentQuestion`: Object (contains the current question and answer)
  - `startTime`: Date (when the game started)
  - `endTime`: Date (when the game is expected to end)
  - `timeLimit`: Number (time limit for the game in seconds)

## Error Handling

The API provides error handling for various scenarios. When an error occurs, the server emits an `error` event with a message describing the issue.

### Common Error Messages

- "Failed to identify user"
- "Game session not found"
- "Cannot join a game in progress"
- "Only the game master can start the game"
- "At least 2 players are required to start the game"
- "User not authenticated"
- "Game is not active"
- "Player not found in this game session"
- "Failed to submit guess"
- "Failed to leave game session"

## Conclusion

This documentation provides an overview of the Guessing Game API, including how to connect, the events available, and the data models used. For further assistance, please refer to the source code or contact the development team.