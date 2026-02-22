# Release Notes - v1.1.0

## New Features
* **Typography Settings for Overlay**: You can now customize font family (Inter, Roboto, Outfit, Monospace), font size, weight, style (italic), and text wrapping directly from the Dashboard.
* **OBS Docks Support**: Added dedicated routes and components for OBS Docks.
  * Chat Dock (`/chat-dock`)
  * Settings Dock (`/settings-dock`)
  * Easy URL copy buttons added to the Dashboard header so you can add them directly to OBS Custom Browser Docks.
* **Clear Chat**: Added a "Clear Chat" button in the Live Chat dashboard to instantly clear the chat history across all overlays and docks.

## Bug Fixes & Improvements
* **Immediate Message Limit Enforcement**: Changing `maxMessages` in settings now immediately truncates the chat history on the UI without requiring a full connection refresh.
* **Platform Reconnection Resiliency**: Startup connections to Twitch, YouTube, and Kick now gracefully handle errors and will retry or log them without crashing the backend thread. Reconnection triggers have been fortified.
* **Documentation**: Added `YOUTUBE_QUOTA_ISSUE.md` to help troubleshoot common YouTube API quota errors.

## Usage
1. Open the **Dashboard**.
2. To use the new Typography settings, look under the **Typography Settings** section in the Dashboard side-panel. Tweak font size, weight, bold/italic, and text-wrap.
3. To configure OBS Docks, click the **Copy Chat Dock URL** and **Copy Settings Dock URL** buttons at the top of the dashboard. In OBS, go to `Docks` -> `Custom Browser Docks` and paste the URLs.
4. If your chat gets cluttered, click the **Clear Chat** button to wipe the visible interface.
