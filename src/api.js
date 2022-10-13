// This is a workaround needed for deploying the app as a web service
// TODO: find a cleaner solution
const express = require("express")
const app = express()

const startApiServer = () => app.listen(process.env.PORT, () => console.log(`Server started at port ${process.env.PORT}`))

module.exports = startApiServer