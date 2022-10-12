const { createLogger, format, transports } = require("winston");
const { EmbedBuilder } = require("discord.js")

const logger = createLogger({
    format: format.combine(format.timestamp(), format.json()),
    transports: [new transports.Console()],
});

function DiscordService(client, tournamentService, intervalInSeconds) {
    client.login(process.env.DISCORD_TOKEN);
    return {
        client,
        tournamentService,
        intervalInSeconds,
        publishTournaments
    }
}

const publishTournament = (tournament, client) => {
    const channel = client.channels.cache.get(process.env.TKT_NEWS_CHANNEL_ID);

    if (!channel) {
        console.error("Missing channel, exiting...");
        return
    }

    channel.messages.fetch()
        .then(messages => {
            if (!isAlreadyPublished(messages, tournament.url)) {
                channel.send({ embeds: [buildEmbeddedTournament(tournament)] });
            }
        });
}

function publishTournaments() {
    this.client.on('ready', async () => {
        logger.info(`Logged in as ${this.client.user.tag}`);

        setInterval(async () => {
            logger.info("Start fetching tournaments...");

            const tournaments = await this.tournamentService.fetchTournaments();

            tournaments.forEach(t => publishTournament(t, this.client))
        }, this.intervalInSeconds * 1000)
    });
}



function isAlreadyPublished(messages, tournamentUrl) {
    for (const [_, msg] of messages) {
        if (msg.embeds[0]?.url?.endsWith(tournamentUrl)) return true;
    }
    return false
}

function buildEmbeddedTournament(tournament) {
    const startTime = formatDate(tournament.startAt);
    const registrationCloseTime = formatDate(tournament.registrationClosesAt);

    const isOnline = `Il torneo è ${tournament.isOnline ? `online` : `offline`}`;

    return new EmbedBuilder()
        .setTitle(tournament.name)
        .setDescription(`
            Nuovo torneo nella città di ${tournament.city} [${tournament.countryCode}].
            Il torneo comincia il ${startTime}
            Le iscrizioni scadono il ${registrationCloseTime}
            ${isOnline}
        `)
        .setURL(`https://start.gg${tournament.url}`)
        .setThumbnail(tournament.images[0]?.url)
}

function formatDate(timestamp) {
    return new Date(timestamp * 1000).toLocaleString('it');
}

module.exports = DiscordService;