const { createLogger, format, transports } = require("winston");

let logger;

const getLogger = () => {
    if (!logger) {
        const level = process.env.LOG_LEVEL || "info"
        console.log(process.env.LOG_LEVEL)

        logger = createLogger({
            format: format.combine(format.timestamp(), format.json()),
            transports: [new transports.Console({
                level,
            })],
        });
    }

    return logger;
}

module.exports = getLogger