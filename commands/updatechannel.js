const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('updatechannel')
        .setDescription('Set the channel where updates will be forwarded to')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to receive updates')
                .setRequired(true)),
    
    async execute(interaction, config) {
        const channel = interaction.options.getChannel('channel');
        
        // Check if the channel is a text channel
        if (channel.type !== 0) { // 0 is GUILD_TEXT
            return await interaction.reply({
                content: 'Please select a text channel!',
                ephemeral: true
            });
        }

        // Update the configuration
        config.servers[interaction.guildId] = {
            updateChannel: channel.id
        };

        // Save the configuration
        fs.writeFileSync('./config.json', JSON.stringify(config, null, 4));

        await interaction.reply({
            content: `Update channel set to ${channel}! All updates will be forwarded here.`,
            ephemeral: true
        });
    },
}; 