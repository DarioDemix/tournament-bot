const DiscordService = require("./services/discord_service")
const tournamentService = require("./services/tournament_service")
const { Client, GatewayIntentBits } = require('discord.js');


const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

require('dotenv').config();

DiscordService(client, tournamentService, 10).publishTournaments()



