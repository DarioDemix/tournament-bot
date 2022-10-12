const fs = require('fs')
const { Client, GatewayIntentBits, Message, EmbedBuilder } = require('discord.js');
const { fetch } = require('node-fetch')
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

require('dotenv').config();

client.login(process.env.DISCORD_TOKEN);

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);

    setInterval(async () => {
        console.log("Start fetching tournaments...");

        const tournaments = await fetchTournaments()

        if (tournaments.nodes.length < 1) {
            return
        }

        tournaments.nodes.forEach(publishTournament)
    }, 60 * 1000)
});

function fetchTournaments() {
    const queryBody = {
        query: fs.readFileSync("./query.gql", "utf-8"),
        variables: {
            "videogameId": 17,
            "coordinates": "49.719152  ,  13.407655",
            "radius": "1600mi",
            "afterDate": Math.floor(Date.now() / 1000)
        },
        operationName: "TournamentsByVideogame"
    }

    return fetch("https://api.start.gg/gql/alpha", {
        "headers": {
            "authorization": `Bearer ${process.env.START_GG_TOKEN}`,
        },
        "body": JSON.stringify(queryBody),
        "method": "POST"
    }).then(res => res.json())
        .then(json => json.data.tournaments)
}

function publishTournament(tournament) {
    const channel = client.channels.cache.get(process.env.TKT_NEWS_CHANNEL_ID);

    channel.messages.fetch()
        .then(messages => {
            if (!isAlreadyPublished(messages, tournament.url)) {
                channel.send({ embeds: [buildEmbeddedTournament(tournament)] });
            }
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
        .setURL(`https://start.gg/${tournament.url}`)
        .setThumbnail(tournament.images[0]?.url)
}

function formatDate(timestamp) {
    return new Date(timestamp * 1000).toLocaleString('it');
}