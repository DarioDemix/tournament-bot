const { EmbedBuilder } = require("discord.js");

const logger = require("../logger")()


class DiscordService {
    #client;
    #channelID;

    constructor(client, channelID, discordToken) {
        this.#client = client;
        this.#channelID = channelID;

        client.login(discordToken);
    }

    apply = callback => {
        this.#client.on('ready', () => {
            logger.info(`Logged in as ${this.#client.user.tag}`);
            callback();
        });
    }

    getMessages() {
        const channel = this.#findChannelByID(this.#channelID);
        return channel.messages.fetch();
    }

    publishEmbeddedMessage(message, description, baseUrl) {
        const channel = this.#findChannelByID(this.#channelID);
        const builtMessage = this.#buildEmbeddedMessage(message, description, baseUrl);

        channel.send({ embeds: [builtMessage] });
    }

    #findChannelByID(ID) {
        const channel = this.#client.channels.cache.get(ID);

        if (!channel) {
            throw new Error(`Channel with ID ${ID} is missing. Exiting`);
        }

        return channel;
    }

    #buildEmbeddedMessage(message, description, baseUrl) {
        return new EmbedBuilder()
            .setTitle(message.name)
            .setDescription(description)
            .setURL(`${baseUrl}${message.url}`)
            .setThumbnail(message.images[0]?.url)
    }
}

module.exports = DiscordService;