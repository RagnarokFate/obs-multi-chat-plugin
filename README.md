# Multi-Chat Plugin for OBS Studio

A lightweight, unified real-time chat aggregator for broadcasters who stream simultaneously on Twitch, YouTube, and Kick. This plugin provides a single moderation dashboard and a unified, animated, transparent HTML overlay specifically optimized for the OBS Browser Source.

## Features
- **Unified Real-time Ingestion**: Merges Twitch IRC, YouTube Live Chat Polling, and Kick WebSockets into one stream.
- **Streamer Dashboard**: A central web UI to monitor all incoming chat from all platforms simultaneously, complete with moderation actions (Timeout, Ban, Delete).
- **OBS Browser Source Overlay**: A transparent, animated, purely text-based aesthetic designed not to distract from gameplay.
- **High Performance**: Employs a strict DOM node capitalization to ensure zero memory bloat while running inside OBS for long streams.
- **Local Persistence**: OAuth tokens and user settings are persisted via a local SQLite file so you only have to log in once.

## Prerequisites
- **Node.js**: Minimum `v16.0.0` or higher installed on your streaming machine.
- Developer API credentials for Twitch and Google Cloud Platform (YouTube).

## Installation

1. **Download the Release**
   Clone or download this repository to your streaming PC.

2. **Install Dependencies**
   Open a terminal in the root directory and install the necessary backend packages:
   ```bash
   cd backend
   npm install
   ```

3. **Configure Environment Variables**
   Inside the `/backend` folder, duplicate the `.env.template` file and rename it to exactly `.env`. 
   
   Fill out your credentials:
   ```env
   TWITCH_CLIENT_ID=your_twitch_client_id
   TWITCH_CLIENT_SECRET=your_twitch_client_secret
   TWITCH_REDIRECT_URI=http://localhost:3000/auth/twitch/callback

   YOUTUBE_CLIENT_ID=your_youtube_client_id
   YOUTUBE_CLIENT_SECRET=your_youtube_client_secret
   YOUTUBE_REDIRECT_URI=http://localhost:3000/auth/youtube/callback

   KICK_CHANNEL=your_exact_kick_username

   PORT=3000
   SESSION_SECRET=super_secret_session_key
   ```
   *(Ensure your OAuth App callbacks on the Twitch and Google dev consoles match the redirect URIs above exactly).*

4. **Start the Application**
   Run the unified server:
   ```bash
   npm start
   ```

## Usage

Once running, the server automatically hosts both the backend and frontend on port 3000.

1. **Dashboard (For Moderation)**
   Open your regular browser (Chrome/Firefox/Edge) and go to:
   `http://localhost:3000/dashboard`
   - Use the sidebar widgets to connect and authenticate with your Twitch and YouTube accounts.
   - Adjust Overlay preferences here as well.

2. **OBS Overlay (For Streaming)**
   In OBS Studio, add a new **Browser Source**.
   - URL: `http://localhost:3000/overlay`
   - Width: `800` (or as desired)
   - Height: `800` (or as desired)
   - **Crucial**: Ensure you check "Shutdown source when not visible" if you want to reset the cache dynamically.

## Disclaimer
This is an open-source project intended to help creators stream seamlessly to multiple platforms. Ensure you adhere to each individual platform's terms of service regarding multiplexing chat widgets and moderation API usage.
