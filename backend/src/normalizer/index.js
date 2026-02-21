/**
 * Message Normalizer
 * Standardizes varying platform chat payloads into a unified object:
 * { id, timestamp, platform, user, message, type, metadata }
 */

const { v4: uuidv4 } = require('uuid');

/**
 * Normalizes a Twitch tmi.js or EventSub message.
 */
function normalizeTwitch(userstate, message) {
    return {
        id: userstate.id || uuidv4(),
        timestamp: new Date(+userstate['tmi-sent-ts'] || Date.now()).toISOString(),
        platform: 'twitch',
        user: userstate['display-name'] || userstate.username || 'Unknown Twitch User',
        message: message,
        type: userstate['msg-id'] === 'highlighted-message' ? 'highlight' : 'chat',
        metadata: {
            badges: userstate.badges || {},
            color: userstate.color || '#9146FF',
            emotes: userstate.emotes || null,
            subscriber: userstate.subscriber,
            mod: userstate.mod
        }
    };
}

/**
 * Normalizes a YouTube Live Chat API message.
 */
function normalizeYouTube(item) {
    const snippet = item.snippet;
    const authorDetails = item.authorDetails;

    return {
        id: item.id || uuidv4(),
        timestamp: new Date(snippet.publishedAt || Date.now()).toISOString(),
        platform: 'youtube',
        user: authorDetails.displayName || 'Unknown YT User',
        message: snippet.displayMessage || snippet.textMessageDetails?.messageText,
        type: snippet.type === 'superChatEvent' ? 'superchat' : 'chat',
        metadata: {
            profileImageUrl: authorDetails.profileImageUrl,
            isChatOwner: authorDetails.isChatOwner,
            isChatSponsor: authorDetails.isChatSponsor,
            isChatModerator: authorDetails.isChatModerator,
            amountMicros: snippet.superChatDetails?.amountMicros,
            currency: snippet.superChatDetails?.currency
        }
    };
}

/**
 * Normalizes a Kick WebSocket message (Pusher).
 */
function normalizeKick(data) {
    // Needs adjusting based on actual Kick payload structures, this is a mock representation
    return {
        id: data.id || uuidv4(),
        timestamp: data.created_at ? new Date(data.created_at).toISOString() : new Date().toISOString(),
        platform: 'kick',
        user: data.sender?.username || 'Unknown Kick User',
        message: data.content,
        type: data.type === 'gift' ? 'gift' : 'chat',
        metadata: {
            badges: data.sender?.identity?.badges || [],
            color: data.sender?.identity?.color || '#53fc18'
        }
    };
}

module.exports = {
    normalizeTwitch,
    normalizeYouTube,
    normalizeKick
};
