# Guessing Game API Documentation

## Overview

The Guessing Game API allows users to create and join game sessions where they can guess answers to questions. The API is built using WebSockets for real-time communication and MongoDB for data storage.

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
- [Data Models](#data-models)
  - [User](#user)
  - [GameSession](#gamesession)
- [Error Handling](#error-handling)

## Getting Started

To use the Guessing Game API, you need to establish a WebSocket connection to the server. The server will handle user authentication, game session management, and real-time updates.

### WebSocket Connection

```javascript
const socket = io('http://your-server-url');
```

## Socket Events

### Connection

When a user connects to the server, the following event is triggered:

```javascript
socket.on('connect', () => {
  console.log(`User connected: ${socket.id}`);
});
```

### Identify User

To identify a user, emit the `identify` event with the username and optional session code.

**Event:** `identify`

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

To join an existing game session, emit the `joinGame` event.

**Event:** `joinGame`

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

The game master can start the game by emitting the `startGame` event.

**Event:** `startGame`

**Payload:**
```json
{
  "sessionCode": "string",
  "question": "string",
  "answer": "string"
}
```

**Response:** No specific response; game state is updated.

### Submit Guess

Players can submit their guesses by emitting the `submitGuess` event.

**Event:** `submitGuess`

**Payload:**
```json
{
  "sessionCode": "string",
  "guess": "string"
}
```

**Response:**
```json
{
  "correct": "boolean",
  "attempts": "number",
  "maxAttemptsReached": "boolean"
}
```

### Leave Game

Players can leave the game session by emitting the `leaveGame` event.

**Event:** `leaveGame`

**Payload:**
```json
{
  "sessionCode": "string"
}
```

**Response:** No specific response; game state is updated.

### Disconnect

When a user disconnects, the server will handle cleanup and notify remaining players.

```javascript
socket.on('disconnect', () => {
  console.log(`User disconnected: ${socket.id}`);
});
```

## Data Models

### User

The User model represents a player in the game.

**Fields:**
- `username`: String, unique identifier for the user.
- `socketId`: String, the WebSocket ID of the user.
- `currentSession`: ObjectId, reference to the current game session.
- `totalScore`: Number, total score accumulated by the user.

### GameSession

The GameSession model represents a game session.

**Fields:**
- `code`: String, unique code for the game session.
- `gameMaster`: ObjectId, reference to the user who is the game master.
- `status`: String, current status of the game (e.g., "waiting", "active", "completed").
- `players`: Array, list of players in the session.
- `currentQuestion`: Object, the current question being asked.
- `startTime`: Date, when the game started.
- `endTime`: Date, when the game is expected to end.
- `timeLimit`: Number, time limit for the game in seconds.

## Error Handling

The API provides error handling for various scenarios. Errors are emitted back to the client with a message.

**Error Response:**
```json
{
  "message": "string"
}
```

### Common Errors
- **User not authenticated**: Emitted when a user tries to perform an action without being identified.
- **Game session not found**: Emitted when a user tries to join or interact with a non-existent game session.
- **Cannot join a game in progress**: Emitted when a user tries to join a game that is already active.
- **Only the game master can start the game**: Emitted when a non-game master tries to start the game.
- **At least 2 players are required to start the game**: Emitted when there are not enough players to start the game.

## Conclusion

This documentation provides a comprehensive overview of the Guessing Game API, including how to connect, the events available, data models, and error handling. For further questions or issues, please refer to the API source code or contact the development team.