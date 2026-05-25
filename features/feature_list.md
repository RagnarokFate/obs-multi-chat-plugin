# Product Feature Roadmap & Suggestions

This document outlines the desired features needed to help the plugin reach its full potential. They are categorized by priority and include motivations as well as alternative approaches.

## High Priority

### 1. Advanced Emote Support (7TV, BTTV, FFZ)
**Description:** Currently, the chat relies on Unicode emojis, but streaming culture utilizes third-party emote extensions. Integrating these APIs will allow the overlay to render custom emotes inline as images.
**Motivation:** An overlay that supports native stream emotes feels significantly more professional and engaging for the audience. This is often an immediate expectation for any streamer using a chat aggregator.
**Alternative Approaches:** 
- *Fallback to text:* Simply display the text code (e.g., `KEKW`) but map it to a tooltip on the dashboard if hovered (less ideal for the stream overlay, but lighter on the DOM). 
- *Pre-caching:* Instead of querying the APIs on every message load, pre-fetch and cache the channel's specific active emote list into the SQLite database when the streamer authenticates.

### 2. Comprehensive Cross-Platform Moderation
**Description:** Implement native `Timeout`, `Ban`, and `Delete Message` API calls not just for Twitch (in progress), but also completely for YouTube and Kick.
**Motivation:** Streamers and moderators need a truly centralized moderation hub. If moderation actions only work partially, moderators still need to keep native tabs open to effectively moderate trolls across different platforms.
**Alternative Approaches:** 
- *Soft-Delete / Front-End Only:* Instead of natively deleting on the platform via API, simply hide the specific message ID from the aggregator and OBS overlay. (Easier to implement, but leaves the toxic message visible on the actual native platform).

## Mid Priority

### 3. Automated Chat Moderation (AutoMod)
**Description:** Implement built-in word blocklists, caps lock filters, link stripping, and regex-based phrase blocking.
**Motivation:** Manual moderation is too slow during a live broadcast. Automated filters catch spam, hate speech, and malicious links before they ever reach the OBS overlay, immediately protecting the streamer from potential TOS violations.
**Alternative Approaches:** 
- *External API Webhooks:* Instead of building our own entire AutoMod logic, allow the dashboard to connect with existing sophisticated tools (like Nightbot) through webhooks to share moderation state. This shifts the complexity outwards, though it adds another point of failure.

### 4. Custom Themes, Aesthetics, and Animations
**Description:** Provide dropdown selections for preset aesthetic themes (e.g., *Cyberpunk*, *Minimalist Bubble*), custom entry/exit animations (fade, slide in, pop), and a custom CSS input box in the Dashboard for power users.
**Motivation:** Visual identity is paramount for streamers. Full control over themes and animations allows streamers to seamlessly blend the chat widget into their specific overlay branding.
**Alternative Approaches:** 
- *JSON Theme Store:* Create a standardized JSON formatting schema for themes that users can export, import, and easily share within the community rather than hardcoding only generic presets.

### 5. Stream Events & Alerts Consolidation
**Description:** Listen for Follows, Subscriptions, Cheers (Bits), and Raids across all integrated platforms, displaying them as highlighted VIP messages in the chat feed.
**Motivation:** Consolidating standard alerts into the chat feed creates a more unified interface and reduces the number of disparate OBS browser sources a streamer needs to run and manage simultaneously.
**Alternative Approaches:** 
- *Dedicated Alert Dock:* Keep chat pure, but listen to these API events on a separate WebSocket channel and offer a dedicated "Alerts Dock" for OBS, keeping text and alerts cleanly separated.

## Low Priority

### 6. Built-in Chatbot Commands Engine
**Description:** A custom automated command engine inside the dashboard (e.g., `!discord`, `!socials`, `!uptime`) that automatically replies to the chat of the originating platform.
**Motivation:** Replaces the need for external bots entirely, keeping stream management fully centralized in this one application.
**Alternative Approaches:** 
- *Timer-based Auto-posting:* Instead of active chat commands that require parsing user text, just offer periodic timer messages (e.g., automatically drop the Discord link every 20 minutes across all platforms).

### 7. Expansion to Additional Platforms
**Description:** Add ingestion support for platforms like TikTok Live, Facebook Gaming, or Trovo.
**Motivation:** Multi-streaming is growing rapidly to vertical video platforms. Capturing TikTok Live chat would be a massive differentiator.
**Alternative Approaches:** 
- *Generic Webhook Ingress / REST API:* Rather than officially supporting every niche platform, provide a generic authenticated webhook URL endpoint that advanced users can use to POST formatted JSON messages from any platform into the aggregator via custom scripts or macros.
