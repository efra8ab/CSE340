/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts =  require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const expressEjsLayouts = require("express-ejs-layouts")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const utilities = require("./utilities/index")

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root
app.use(static)

//index route
app.get("/", utilities.handleErrors(baseController.buildHome))
app.use("/inv", inventoryRoute)
// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  const nav = await utilities.getNav()
    res.status(404).render("errors/error", {
    title: "Not Found",
    status: 404,
    message: "The page you requested was not found.",
    nav
  })
})

/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  const status = err.status || 500
  const nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)

  const message = status === 500
    ? 'Oh no! There was a crash. Maybe try a different route?'
    : err.message

  res.status(status).render("errors/error", {
    title: status === 500 ? 'Server Error' : String(status),
    status,
    message,
    nav
  })
})

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
