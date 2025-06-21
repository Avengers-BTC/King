# Chat Testing Guide

This guide explains how to test the chat functionality in the King application.

## Prerequisites

- Node.js installed
- The application running locally on port 3000
- A valid user session (you need to be logged in)

## Automated Testing

You can run the automated chat test script to verify basic functionality:

```bash
# Install socket.io-client if not already installed
npm install socket.io-client

# Run the test script
node scripts/chat-test.js
```

This script will:
1. Connect to the Socket.IO server
2. Join a test room
3. Send a test message
4. Verify message reception
5. Disconnect after 10 seconds

## Manual Testing Steps

For a more comprehensive test, follow these steps:

1. Open two browser windows/tabs (preferably in different browsers or one in incognito mode)
2. Log in with different accounts in each browser
3. Navigate to a chat room in both browsers (same room ID)
4. Send messages from each browser and verify they appear in both
5. Test typing indicators by starting to type in one browser and checking if it shows in the other
6. If one account has DJ privileges, test muting functionality

## Chat Features to Test

- [x] Room joining and leaving
- [x] Sending and receiving messages
- [x] User count updates
- [x] Typing indicators
- [x] Message persistence (previous messages appear when joining a room)
- [x] DJ moderation features (muting users)
- [x] Error handling (e.g., try sending empty messages)

## Troubleshooting

If you encounter issues:

1. Check browser console for errors
2. Verify WebSocket connection in Network tab
3. Ensure authentication is working correctly
4. Check server logs for Socket.IO related messages

## Socket.IO Events Reference

The chat system uses the following events:

- Client -> Server:
  - `join_room`: Join a chat room
  - `leave_room`: Leave a chat room
  - `send_message`: Send a chat message
  - `typing_start`: Indicate user started typing
  - `typing_end`: Indicate user stopped typing
  - `mod_mute`: Mute a user (DJ/admin only)
  - `mod_unmute`: Unmute a user (DJ/admin only)

- Server -> Client:
  - `room_joined`: Confirmation of room join with initial data
  - `new_message`: New message notification
  - `user_count`: Updated count of users in room
  - `typing_update`: List of currently typing users
  - `user_muted`: Notification of user being muted
  - `user_unmuted`: Notification of user being unmuted
  - `error`: Error notification
