const { Client, GatewayIntentBits, Partials, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageTyping
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.User,
        Partials.GuildMember,
        Partials.Reaction
    ]
});

// Hardcoded main server configuration
const MAIN_SERVER_CONFIG = {
    guildId: 'MAINGUILDID', // Replace with your main server's ID
    channelId: 'MAINCHANNEL/UPDATECHANNELID' // Replace with your main channel's ID
};

// Load configurations for receiving servers
let config = {};
try {
    config = require('./config.json');
} catch (error) {
    config = {
        servers: {}
    };
    fs.writeFileSync('./config.json', JSON.stringify(config, null, 4));
}

// Command handling
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    client.commands.set(command.data.name, command);
}

// Event handling
client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    
    // Verify main server configuration
    try {
        const mainGuild = await client.guilds.fetch(MAIN_SERVER_CONFIG.guildId);
        const mainChannel = await mainGuild.channels.fetch(MAIN_SERVER_CONFIG.channelId);
        
        if (!mainGuild) {
            console.error('Main server not found! Please check MAIN_SERVER_CONFIG.guildId');
            process.exit(1);
        }
        
        if (!mainChannel) {
            console.error('Main channel not found! Please check MAIN_SERVER_CONFIG.channelId');
            process.exit(1);
        }
        
        console.log('Main server configuration verified successfully');
    } catch (error) {
        console.error('Error verifying main server configuration:', error.message);
        process.exit(1);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction, config);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

// Message forwarding
client.on('messageCreate', async message => {
    // Debug logging
    console.log('Message received:', {
        guildId: message.guildId,
        channelId: message.channelId,
        content: message.content
    });
    
    console.log('Main server config:', MAIN_SERVER_CONFIG);
    
    // Check if the message is from the main server's update channel
    if (message.guildId === MAIN_SERVER_CONFIG.guildId && 
        message.channelId === MAIN_SERVER_CONFIG.channelId) {
        
        console.log('Message matches main server configuration, forwarding...');
        
        // Clean the message content by removing mentions
        let cleanContent = message.content;
        if (message.mentions.roles.size > 0 || message.mentions.users.size > 0) {
            // Remove role and user mentions
            cleanContent = message.content.replace(/<@&?\d+>/g, '');
            // Remove any extra spaces that might have been left
            cleanContent = cleanContent.replace(/\s+/g, ' ').trim();
        }
        
        // Forward the message to all configured servers
        for (const [guildId, serverConfig] of Object.entries(config.servers)) {
            try {
                console.log(`Attempting to forward to server ${guildId}, channel ${serverConfig.updateChannel}`);
                const guild = await client.guilds.fetch(guildId);
                const channel = await guild.channels.fetch(serverConfig.updateChannel);
                
                if (!channel) {
                    console.error(`Channel not found in server ${guildId}`);
                    continue;
                }
                
                await channel.send({
                    content: cleanContent || message.content, // Use cleaned content if available, otherwise original
                    embeds: message.embeds,
                    files: message.attachments.map(attachment => attachment.url)
                });
                
                console.log(`Successfully forwarded message to server ${guildId}`);
            } catch (error) {
                console.error(`Error forwarding message to server ${guildId}:`, error.message);
                if (error.code === 50001) {
                    console.error('Missing permissions in server:', guildId);
                }
            }
        }
    } else {
        console.log('Message does not match main server configuration');
    }
});

// Login to Discord
client.login(process.env.DISCORD_TOKEN); 