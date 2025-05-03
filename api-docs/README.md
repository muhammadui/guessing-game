# Guessing Game API Documentation

## Overview

The Guessing Game API allows users to create and join game sessions where they can guess answers to questions. The API is built using Socket.IO for real-time communication and MongoDB for data storage.

## Table of Contents

- [Getting Started](#getting-started)
- [Socket Events](#socket-events)
  - [Connection](#connection)
  - [Identify User](#identify-user)
  - [Join Game](#join-game)
  - [Start Game](#start-game)
  - [Submit Guess](#submit-guess)
  - [Leave Game](#leave-game)
  - [Disconnect](#disconnect)
- [Models](#models)
  - [User](#user)
  - [GameSession](#gamesession)
- [Error Handling](#error-handling)
- [Helper Functions](#helper-functions)

## Getting Started

To use the Guessing Game API, you need to set up a Socket.IO client that connects to the server. The server will handle user authentication, game session management, and real-time communication between players.

### Installation

1. Clone the repository.
2. Install dependencies using npm or yarn.
3. Start the server.

```bash
npm install
npm start
```

## Socket Events

### Connection

When a user connects to the server, a unique socket ID is assigned.

```javascript
socket.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);
});
```

### Identify User

**Event:** `identify`

**Description:** Authenticates the user by username and associates them with a socket ID.

**Payload:**

```json
{
  "username": "string",
  "sessionCode": "string (optional)"
}
```

**Response:**

```json
{
  "userId": "string",
  "username": "string"
}
```

### Join Game

**Event:** `joinGame`

**Description:** Allows a user to join a game session.

**Payload:**

```json
{
  "sessionCode": "string",
  "username": "string"
}
```

**Response:**

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

**Event:** `startGame`

**Description:** Starts the game session if the user is the game master.

**Payload:**

```json
{
  "sessionCode": "string",
  "question": "string",
  "answer": "string"
}
```

**Response:** Emits `gameStarted` event to all players in the session.

### Submit Guess

**Event:** `submitGuess`

**Description:** Allows a player to submit a guess for the current question.

**Payload:**

```json
{
  "sessionCode": "string",
  "guess": "string"
}
```

**Response:**

- If correct: Emits `gameEnded` event with winner details.
- If incorrect: Emits `guessResult` event with attempts count.

### Leave Game

**Event:** `leaveGame`

**Description:** Allows a user to leave the game session.

**Payload:**

```json
{
  "sessionCode": "string"
}
```

### Disconnect

**Event:** `disconnect`

**Description:** Handles user disconnection and updates the game session accordingly.

## Models

### User

- **username**: String (unique)
- **socketId**: String
- **currentSession**: ObjectId (reference to GameSession)
- **totalScore**: Number (default: 0)

### GameSession

- **code**: String (unique)
- **gameMaster**: ObjectId (reference to User)
- **status**: String (e.g., "waiting", "active", "completed")
- **players**: Array of player objects
- **currentQuestion**: Object (contains question text and answer)
- **startTime**: Date
- **endTime**: Date
- **timeLimit**: Number (in seconds)

## Error Handling

The API emits error events with a message when an operation fails. For example:

```json
{
  "message": "Failed to identify user"
}
```

## Helper Functions

### handlePlayerLeaving

Handles the logic when a player leaves a game session, including updating the game session and notifying other players.

### rotateGameMaster

Rotates the game master to the next player in the session when the current game master leaves or when the game ends.

## Conclusion

This documentation provides an overview of the Guessing Game API, including its events, models, and error handling. For further assistance, please refer to the source code
