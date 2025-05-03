# Guessing Game API Documentation

## Overview

The Guessing Game API allows users to participate in a multiplayer guessing game. Players can join game sessions, submit guesses, and interact with each other in real-time using WebSocket connections. This documentation outlines the API's endpoints, events, and data structures.

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

To use the Guessing Game API, you need to establish a WebSocket connection to the server. The server will emit events and listen for user actions.

### WebSocket Connection

```javascript
const socket = io('http://your-server-url');
```

## WebSocket Events

### Connection

- **Event**: `connection`
- **Description**: Triggered when a user connects to the server.
- **Payload**: None
- **Response**: Logs the user's socket ID.

### Identify User

- **Event**: `identify`
- **Description**: Authenticates a user by their username and associates them with a socket ID.
- **Payload**:
  ```json
  {
    "username": "string",
    "sessionCode": "string" // optional
  }
  ```
- **Response**:
  - On success:
    ```json
    {
      "userId": "string",
      "username": "string"
    }
    ```
  - On error:
    ```json
    {
      "message": "Failed to identify user"
    }
    ```

### Join Game

- **Event**: `joinGame`
- **Description**: Allows a user to join a game session.
- **Payload**:
  ```json
  {
    "sessionCode": "string",
    "username": "string"
  }
  ```
- **Response**:
  - On success:
    ```json
    {
      "gameSession": {
        "id": "string",
        "code": "string",
        "gameMaster": "string",
        "status": "string"
      },
      "isGameMaster": true | false
    }
    ```
  - On error:
    ```json
    {
      "message": "Game session not found" | "Cannot join a game in progress"
    }
    ```

### Start Game

- **Event**: `startGame`
- **Description**: Starts the game session if the user is the game master.
- **Payload**:
  ```json
  {
    "sessionCode": "string",
    "question": "string",
    "answer": "string"
  }
  ```
- **Response**:
  - On success:
    ```json
    {
      "question": "string",
      "timeLimit": "number"
    }
    ```
  - On error:
    ```json
    {
      "message": "Only the game master can start the game" | "At least 2 players are required to start the game"
    }
    ```

### Submit Guess

- **Event**: `submitGuess`
- **Description**: Submits a guess for the current question.
- **Payload**:
  ```json
  {
    "sessionCode": "string",
    "guess": "string"
  }
  ```
- **Response**:
  - On success (correct guess):
    ```json
    {
      "reason": "correctAnswer",
      "answer": "string",
      "winner": {
        "username": "string",
        "score": "number"
      }
    }
    ```
  - On success (incorrect guess):
    ```json
    {
      "correct": false,
      "attempts": "number",
      "maxAttemptsReached": true | false
    }
    ```
  - On error:
    ```json
    {
      "message": "User not authenticated" | "Game session not found" | "Game is not active"
    }
    ```

### Leave Game

- **Event**: `leaveGame`
- **Description**: Allows a user to leave the current game session.
- **Payload**:
  ```json
  {
    "sessionCode": "string"
  }
  ```
- **Response**: None

### Disconnect

- **Event**: `disconnect`
- **Description**: Triggered when a user disconnects from the server.
- **Payload**: None
- **Response**: Logs the user's disconnection.

## Data Models

### User

- **Fields**:
  - `username`: String
  - `socketId`: String
  - `currentSession`: ObjectId (reference to GameSession)
  - `totalScore`: Number

### GameSession

- **Fields**:
  - `code`: String
  - `gameMaster`: ObjectId (reference to User)
  - `status`: String (e.g., "waiting", "active", "completed")
  - `players`: Array of player objects
    - Each player object contains:
      - `id`: ObjectId (reference to User)
      - `username`: String
      - `score`: Number
      - `attempts`: Number
  - `currentQuestion`: Object (contains `text` and `answer`)
  - `startTime`: Date
  - `endTime`: Date
  - `timeLimit`: Number (in seconds)

## Error Handling

The API provides error messages for various failure scenarios. Common error responses include:

- **User not authenticated**: The user must identify themselves before performing actions.
- **Game session not found**: The specified game session does not exist.
- **Cannot join a game in progress**: Players cannot join an active game session.
- **Only the game master can start the game**: Only the designated game master can initiate the game.
- **At least 2 players are required to start the game**: The game cannot start without sufficient players.

## Conclusion

This documentation provides a comprehensive overview of the Guessing Game API, including its WebSocket events, data models, and error handling. For further assistance, please refer to the codebase or contact the development team.