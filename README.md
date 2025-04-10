# Discord News Bot

A Discord bot that forwards updates from a main channel to multiple servers.

## Features

- Set up a main channel where updates will be sent from
- Configure update channels in multiple servers
- Automatically forward messages from the main channel to all configured servers
- Support for text messages, embeds, and attachments

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with your Discord bot token:
```
DISCORD_TOKEN=your_bot_token_here
```

3. Invite the bot to your servers with the following permissions:
   - Send Messages
   - View Channels
   - Read Message History
   - Use Slash Commands

## Usage

### Setting up the main server

1. In your main server (where updates will be sent from), use the command:
```
/setmainchannel #channel
```
This command requires administrator permissions.

### Setting up receiving servers

1. In each server where you want to receive updates, use the command:
```
/updatechannel #channel
```
This will set the channel where updates will be forwarded to.

## Commands

- `/setmainchannel #channel` - Set the main channel where updates will be sent from (Admin only)
- `/updatechannel #channel` - Set the channel where updates will be forwarded to

## Configuration

The bot stores its configuration in `config.json`. This file is automatically created and updated when using the commands. 