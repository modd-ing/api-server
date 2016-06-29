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

    process.exit( 1 );

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
require( './routes/users' )( server );

server.listen( 3000 );
