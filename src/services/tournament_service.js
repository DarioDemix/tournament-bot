const fs = require('fs')

class TournamentService {
    #graphqlApiEndpoint
    #graphqlToken

    constructor(graphqlApiUrl, graphqlToken) {
        this.#graphqlApiEndpoint = graphqlApiUrl;
        this.#graphqlToken = graphqlToken;
    }

    async lookup() {
        const allTournaments = [];

        // TODO: optimize promises
        // TODO: use reduce
        for (let page = 1; ; page++) {
            const partialTournaments = await this.#fetchTournaments(page)

            if (partialTournaments.length < 1) {
                break
            }

            allTournaments.push(...partialTournaments);
        }

        return allTournaments
    }

    async #fetchTournaments(page) {
        const res = await fetch(this.#graphqlApiEndpoint, {
            "headers": {
                "authorization": `Bearer ${this.#graphqlToken}`,
            },
            "body": JSON.stringify(this.#buildBody(page)),
            "method": "POST"
        });

        if (res.status >= 400) {
            throw new Error(`Error in calling ${endpoint}: ${res.status}`)
        }

        return (await res.json()).data?.tournaments?.nodes;
    }

    #buildBody(page) {
        return {
            query: fs.readFileSync("./query.gql", "utf-8"),
            variables: {
                "videogameId": 17,
                "coordinates": "49.719152  ,  13.407655",
                "radius": "1600mi",
                "afterDate": Math.floor(Date.now() / 1000),
                "page": page
            },
            operationName: "TournamentsByVideogame"
        }
    }

}

module.exports = TournamentService;