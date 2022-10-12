const fs = require('fs')

async function fetchTournaments() {
    const endpoint = `https://api.start.gg${process.env.GRAPHQL_ENDPOINT}`

    const queryBody = {
        query: fs.readFileSync("./query.gql", "utf-8"),
        variables: {
            "videogameId": 17,
            "coordinates": "49.719152  ,  13.407655",
            "radius": "1600mi",
            "afterDate": Math.floor(Date.now() / 1000),
            "page": 1
        },
        operationName: "TournamentsByVideogame"
    }

    const tournaments = [];
    let areThereTournaments = true

    // TODO: optimize promises
    while (areThereTournaments) {
        const res = await fetch(endpoint, {
            "headers": {
                "authorization": `Bearer ${process.env.START_GG_TOKEN}`,
            },
            "body": JSON.stringify(queryBody),
            "method": "POST"
        });

        if (res.status >= 400) {
            throw new Error(`Error in calling ${endpoint}: ${res.status}`)
        }

        const partial = (await res.json()).data.tournaments;

        if (partial.nodes.length < 1) {
            areThereTournaments = false;
            continue
        }

        tournaments.push(...partial.nodes);
        queryBody.variables.page++;
    }

    return tournaments
}

module.exports = { fetchTournaments };