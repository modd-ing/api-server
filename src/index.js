'use strict';

// Load the .env file
require( 'dotenv' ).config();

const express = require( 'express' );
const bodyParser = require( 'body-parser' );
const compress = require( 'compression' );
const requestIp = require( 'request-ip' );
const cookieParser = require( 'cookie-parser' );
const session = require( 'express-session' );
const RedisStore = require( 'connect-redis' )( session );

const server = express();

// We use sessions
server.use( session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.SESSION_SECRET,
  store: new RedisStore({
    host: 'redis-api'
  }),
  ttl: 86400 * 7 // 7 days
}));

// Check if session was initialized correctly
server.use( ( req, res, next ) => {

  if ( ! req.session ) {

    res.sendStatus( 500 );

    return;

  }

  next();

});

// GZip all the things
server.use( compress() );

// Parse json
server.use( bodyParser.json() );

// Parse cookies
server.use( cookieParser( process.env.COOKIE_SECRET ) );

// Set the client ip
server.use( function( req, res, next ) {

  server.set( 'clientIp', requestIp.getClientIp( req ) );

  next();

});

// Routes: API
require( './routes/sessions' )( server );
require( './routes/users' )( server );
require( './routes/attachments' )( server );
require( './routes/tokens' )( server );

// Error handling
server.use( ( err, req, res, next ) => {

  console.log( err );

  res
    .sendStatus( err.statusCode || 500 );

});

server.listen( 3000 );
