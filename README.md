# Multi-Chat Plugin for OBS Studio

A lightweight, unified real-time chat aggregator for broadcasters who stream simultaneously on Twitch, YouTube, and Kick. This plugin provides a single moderation dashboard and a unified, animated, transparent HTML overlay specifically optimized for the OBS Browser Source.

## Features
- **Unified Real-time Ingestion**: Merges Twitch IRC, YouTube Live Chat Polling, and Kick WebSockets into one stream.
- **Streamer Dashboard**: A central web UI to monitor all incoming chat from all platforms simultaneously, complete with moderation actions (Timeout, Ban, Delete).
- **OBS Browser Source Overlay**: A transparent, animated, purely text-based aesthetic designed not to distract from gameplay.
- **High Performance**: Employs a strict DOM node capitalization to ensure zero memory bloat while running inside OBS for long streams.
- **Local Persistence**: OAuth tokens and user settings are persisted via a local SQLite file so you only have to log in once.

## Concept & Architecture
The goal of this plugin is to merge disjointed chat feeds from Twitch, YouTube, and Kick into a single, standardized data stream that can be displayed gracefully on an OBS overlay without lagging the broadcaster's computer.

To achieve this:
- **Backend (Node.js)**: Connects to Twitch (via IRC), YouTube (via Google API polling), and Kick (via Pusher WebSocket). Incoming chat events are normalized into a unified schema (`{ timestamp, platform, user, message, ... }`) and broadcast to the frontend using `Socket.io`.
- **Frontend (React)**: Built into static HTML/JS/CSS assets that the Node.js server serves directly to OBS. It aggressively manages DOM virtualization (capping the chat history to 50 elements) to prevent OBS from crashing under heavy chat loads.
- **Data Persistence (SQLite)**: Automatically stashes complex OAuth tokens securely on your local machine so you don't need to log in manually every stream. 

## Prerequisites
- **Node.js**: Minimum `v16.0.0` or higher installed on your streaming machine. Download from [nodejs.org](https://nodejs.org/).
- Developer API credentials for Twitch and Google Cloud Platform (YouTube). (Kick currently uses public API).

## Installation & Setup

### Option 1: The 1-Click Installer (Windows)
1. Download or clone this repository to your streaming PC.
2. Double-click the `Install-and-Run.bat` file in the main folder.
3. This script will automatically check for Node.js, install all the required backend dependencies, and launch the server for you.
4. Continue to the **Configure Environment Variables** section below.

### Option 2: Manual Installation (Mac/Linux/Advanced)
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
   - Width: `400` (or as desired, the overlay is designed to be slim)
   - Height: `800` (or as desired)
   - **Crucial**: Ensure you check "Shutdown source when not visible" to reset the DOM cache whenever you switch scenes.
   - Do NOT apply custom CSS in OBS (the plugin has optimized Tailwind CSS built-in).

## Testing the Application
This plugin includes a load-testing script to verify system stability under heavy chat floods. To test if your OBS and backend can handle high-traffic:
1. Make sure your server is running (`npm start` or the `.bat` file).
2. Open a new terminal window in the `/backend` folder.
3. Run `node loadTest.js`.
4. Over 50 mock messages per second will flood into your Dashboard and OBS overlay. The backend multiprocessor and frontend DOM capper should keep memory usage stable indefinitely!

## Disclaimer
This is an open-source project intended to help creators stream seamlessly to multiple platforms. Ensure you adhere to each individual platform's terms of service regarding multiplexing chat widgets and moderation API usage.
