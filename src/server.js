const DiscordService = require("./services/discord_service")
const TournamentService = require("./services/tournament_service")
const { Client, GatewayIntentBits } = require('discord.js');
const TournamentsPublisher = require("./tournaments_publisher");
const winston = require("winston");
const { format, transports } = require("winston");
require('dotenv').config();

const {
    INTERVAL_IN_SECONDS,
    TOURNAMENTS_CHANNEL_ID,
    GRAPHQL_ENDPOINT,
    START_GG_URL,
    START_GG_TOKEN,
    DISCORD_TOKEN
} = process.env;

winston.loggers.add("primary", {
    format: format.combine(format.timestamp(), format.json()),
    transports: [new transports.Console()],
});
const logger = winston.loggers.get("primary");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const main = () => {
    const tournamentService = new TournamentService(GRAPHQL_ENDPOINT, START_GG_TOKEN);

    const discordService = new DiscordService(client, TOURNAMENTS_CHANNEL_ID, DISCORD_TOKEN);

    const intervalInSeconds = INTERVAL_IN_SECONDS || (30 * 60) // default to 30 min

    new TournamentsPublisher(discordService, tournamentService, {
        intervalInSeconds,
        START_GG_URL
    })
        .publishTournaments();
}

try {
    main();
} catch (err) {
    logger.error(err);
}