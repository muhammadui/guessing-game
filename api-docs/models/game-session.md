# Guessing Game API Documentation

## Overview

The Guessing Game API allows users to create and join game sessions where they can guess answers to questions. The API is built using Node.js and Socket.IO for real-time communication. It supports user authentication, game session management, and player interactions.

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
- [Error Handling](#error-handling)
- [Data Models](#data-models)
  - [User](#user)
  - [GameSession](#gamesession)
- [Helper Functions](#helper-functions)

## Getting Started

To use the Guessing Game API, you need to set up a Node.js environment and install the required dependencies. The API uses MongoDB for data storage.

### Prerequisites

- Node.js
- MongoDB
- Socket.IO

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
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

## Socket Events

### Connection

When a user connects to the server, a connection event is emitted.

```javascript
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);
});
```

### Identify User

Users must identify themselves by sending their username and session code.

**Event:** `identify`

**Payload:**
```json
{
  "username": "string",
  "sessionCode": "string"
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

Users can join an existing game session.

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

The game master can start the game by providing a question and answer.

**Event:** `startGame`

**Payload:**
```json
{
  "sessionCode": "string",
  "question": "string",
  "answer": "string"
}
```

### Submit Guess

Players can submit their guesses during the game.

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

Players can leave the game session.

**Event:** `leaveGame`

**Payload:**
```json
{
  "sessionCode": "string"
}
```

### Disconnect

When a user disconnects, the server handles the disconnection.

```javascript
socket.on("disconnect", async () => {
  // Handle user disconnection
});
```

## Error Handling

The API provides error responses for various scenarios. Errors are emitted back to the client with a message.

**Example Error Response:**
```json
{
  "message": "Error description"
}
```

## Data Models

### User

The User model represents a player in the game.

**Fields:**
- `username`: String (unique)
- `socketId`: String
- `currentSession`: ObjectId (reference to GameSession)
- `totalScore`: Number

### GameSession

The GameSession model represents a game session.

**Fields:**
- `code`: String (unique)
- `gameMaster`: ObjectId (reference to User)
- `status`: String (e.g., "waiting", "active", "completed")
- `players`: Array of player objects
- `currentQuestion`: Object (contains question text and answer)
- `startTime`: Date
- `endTime`: Date
- `timeLimit`: Number (in seconds)

### Player Object in GameSession

Each player object in the `players` array contains:
- `id`: ObjectId (reference to User)
- `username`: String
- `score`: Number
- `attempts`: Number

## Helper Functions

### handlePlayerLeaving

Handles the logic when a player leaves a game session, including updating the game session and notifying other players.

### rotateGameMaster

Rotates the game master to the next player in the session when the current game master leaves or the game ends.

---

This documentation provides a comprehensive overview of the Guessing Game API, including its functionality, events, and data models. For further details, please refer to the source code or contact the development team.