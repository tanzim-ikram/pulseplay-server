# MoodMusic - AI recommendation System

A full-stack Mood-Based Music Recommendation System with Node.js backend and web frontend, designed for ESP32 IoT control.

## Setup Instructions

1.  **Clone/Download** the project.
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Configure Environment**:
    - Create a `.env` file in the root directory (copy `.env.example`).
    - Add your `OPENAI_API_KEY`.
    - (Optional) Change the `PORT` (default is 3000).
4.  **Run the Server**:
    ```bash
    npm start
    ```
    Or for development:
    ```bash
    npm run dev
    ```

## Usage

### Physical Device (ESP32)
The ESP32 should send a `POST` request to `/api/recommend`:
- **URL**: `http://YOUR_SERVER_IP:3000/api/recommend`
- **Body**: `{"mood": "calm"}`

### Web Interface
Open your browser at `http://localhost:3000`. The page will automatically refresh every 3 seconds to display the latest recommendations triggered by the ESP32.

## API Reference

### `POST /api/recommend`
Accepts a mood and triggers AI recommendation generation.
- **Request Body**: `{ "mood": "string" }`
- **Response**: `{ "status": "ok" }`

### `GET /api/latest`
Returns the most recent recommendations.
- **Response**:
```json
{
  "mood": "calm",
  "recommendations": [
    {
      "title": "Song Title",
      "artist": "Artist",
      "platform": "youtube",
      "url": "..."
    }
  ]
}
```
