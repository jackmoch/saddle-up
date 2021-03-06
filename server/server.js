'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')
const RedisStore = require('connect-redis')(session)
const {red} = require('chalk')
const routes = require('./routes')
const { connect } = require('./db/database')
const app = express()

const port = process.env.PORT || 3000
app.set('port', port)

// middlewares
app.use(express.static('client'))

app.use(session({
  resave: false,
  saveUninitialized: false,
  store: new RedisStore({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  }),
  secret: 'saddleupsecretsalt'
}))
app.use(bodyParser.json())

// routes
app.use(routes)

//HTML5MODE middleware for any 'api' routes and alternate routes
app.use('/api', (req, res) => {
  res.status(404).send({message: 'Not found'});
});

app.use((req, res) => {
  res.sendFile(process.cwd() + '/client/index.html');
});

// Error handling middleware
app.use((
    err,
    { method, url, headers: { 'user-agent': agent } },
    res,
    next
  ) => {

    if (process.env.NODE_ENV === 'production') {
      res.sendStatus(err.status || 500)
    } else {
      res.set('Content-Type', 'text/plain').send(err.stack)
    }

    const timeStamp = new Date()
    const statusCode = res.statusCode
    const statusMessage = res.statusMessage

    console.error(
      `[${timeStamp}] "${red(`${method} ${url}`)}" Error (${statusCode}): "${statusMessage}"`
    )
    console.error(err.stack)
  }
)

// Listen to requests on the provided port and log when available
connect()
  .then(() => {
    app.listen(port, () =>
      console.log(`Listening on port: ${port}`)
    )
  })
  .catch(console.error)
