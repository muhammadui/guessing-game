# Guessing Game API Documentation

## Overview

The Guessing Game API allows users to create and join game sessions where they can guess answers to questions. The API is built using WebSocket for real-time communication and MongoDB for data storage.

## Table of Contents

- [Installation](#installation)
- [API Endpoints](#api-endpoints)
  - [Socket Events](#socket-events)
- [Data Models](#data-models)
  - [User](#user)
  - [GameSession](#gamesession)
- [Error Handling](#error-handling)
- [Examples](#examples)

## Installation

To set up the Guessing Game API, follow these steps:

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd guessing-game
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your MongoDB database and update the connection string in your environment variables.

4. Start the server:
   ```bash
   npm start
   ```

## API Endpoints

The API primarily uses WebSocket for real-time communication. Below are the main socket events that can be emitted and listened to.

### Socket Events

#### 1. `identify`

- **Description**: Identifies a user and associates them with a socket connection.
- **Payload**:
  ```json
  {
    "username": "string",
    "sessionCode": "string" // optional
  }
  ```
- **Response**:
  ```json
  {
    "userId": "string",
    "username": "string"
  }
  ```

#### 2. `joinGame`

- **Description**: Allows a user to join an existing game session.
- **Payload**:
  ```json
  {
    "sessionCode": "string",
    "username": "string"
  }
  ```
- **Response**:
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

#### 3. `startGame`

- **Description**: Starts the game session.
- **Payload**:
  ```json
  {
    "sessionCode": "string",
    "question": "string",
    "answer": "string"
  }
  ```
- **Response**: Emits `gameStarted` to all players in the session.

#### 4. `submitGuess`

- **Description**: Submits a guess for the current question.
- **Payload**:
  ```json
  {
    "sessionCode": "string",
    "guess": "string"
  }
  ```
- **Response**: Emits `guessResult` to the player and may emit `gameEnded` if the guess is correct.

#### 5. `leaveGame`

- **Description**: Allows a user to leave the current game session.
- **Payload**:
  ```json
  {
    "sessionCode": "string"
  }
  ```
- **Response**: Emits `playerLeft` to all players in the session.

#### 6. `disconnect`

- **Description**: Handles user disconnection from the socket.

### Error Handling

The API emits error messages in response to various failure scenarios. The error format is as follows:

```json
{
  "message": "string"
}
```

Common error messages include:
- "Failed to identify user"
- "Game session not found"
- "Cannot join a game in progress"
- "User not authenticated"
- "Only the game master can start the game"

## Data Models

### User

- **Fields**:
  - `username`: String, unique identifier for the user.
  - `socketId`: String, the socket ID associated with the user.
  - `currentSession`: ObjectId, reference to the current game session.
  - `totalScore`: Number, total score accumulated by the user.

### GameSession

- **Fields**:
  - `code`: String, unique code for the game session.
  - `gameMaster`: ObjectId, reference to the user who is the game master.
  - `status`: String, current status of the game (e.g., "waiting", "active", "completed").
  - `players`: Array, list of players in the session.
  - `currentQuestion`: Object, contains the current question and answer.
  - `startTime`: Date, when the game started.
  - `endTime`: Date, when the game is expected to end.
  - `timeLimit`: Number, time limit for the game in seconds.

## Examples

### Identifying a User

```javascript
socket.emit("identify", {
  username: "player1",
  sessionCode: "abc123"
});
```

### Joining a Game

```javascript
socket.emit("joinGame", {
  sessionCode: "abc123",
  username: "player1"
});
```

### Starting a Game

```javascript
socket.emit("startGame", {
  sessionCode: "abc123",
  question: "What is the capital of France?",
  answer: "Paris"
});
```

### Submitting a Guess

```javascript
socket.emit("submitGuess", {
  sessionCode: "abc123",
  guess: "Paris"
});
```

### Leaving a Game

```javascript
socket.emit("leaveGame", {
  sessionCode: "abc123"
});
```

## Conclusion

This documentation provides an overview of the Guessing Game API, including its socket events, data models, and examples of usage. For further assistance, please refer to the source code or reach out to the development team.