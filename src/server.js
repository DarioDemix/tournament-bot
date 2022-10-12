const DiscordService = require("./services/discord_service")
const TournamentService = require("./services/tournament_service")
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});
const tournamentService = new TournamentService(`https://api.start.gg${process.env.GRAPHQL_ENDPOINT}`, process.env.START_GG_TOKEN);

const intervalInSeconds = process.env.INTERVAL_IN_SECONDS || (30 * 60) // default to 30 min

new DiscordService(client, tournamentService, intervalInSeconds).publishTournaments();



