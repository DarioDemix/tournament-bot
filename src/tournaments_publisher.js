const winston = require("winston");

const logger = winston.loggers.get("primary");

const formatDate = timestamp => new Date(timestamp * 1000).toLocaleString('it');

class TournamentsPublisher {
    #tournamentService;
    #discordService
    #intervalInSeconds;
    #baseUrl;

    constructor(discordService, tournamentService, config) {
        const { intervalInSeconds, baseUrl } = config;

        this.#tournamentService = tournamentService;
        this.#intervalInSeconds = intervalInSeconds;
        this.#discordService = discordService;
        this.#baseUrl = baseUrl;
    }

    publishTournaments() {
        this.#discordService.apply(() => {
            setInterval(() => this.#publishFetchedTournaments(), this.#intervalInSeconds * 1000);
        });
    }

    async #publishFetchedTournaments() {
        logger.info("Start fetching tournaments...");

        const tournaments = await this.#tournamentService.lookup();

        tournaments.forEach(t => this.#publishTournament(t));
    }

    async #publishTournament(tournament) {
        const messages = await this.#discordService.getMessages();
        const description = `
            Nuovo torneo nella città di ${message.city} [${message.countryCode}].
            Il torneo comincia il ${formatDate(message.startAt)}.
            Le iscrizioni scadono il ${formatDate(message.registrationClosesAt)}.
            Il torneo è ${message.isOnline ? `online` : `offline`}`;

        !isAlreadyPublished(messages, tournament.url) &&
            this.#discordService
                .publishEmbeddedMessage(tournament, description, this.#baseUrl);
    }
}

const isAlreadyPublished = (messages, tournamentUrl) => {
    for (const [_, msg] of messages) {
        if (msg.embeds[0]?.url?.endsWith(tournamentUrl)) return true;
    }
    return false
}

module.exports = TournamentsPublisher;