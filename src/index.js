'use strict';

// Load the .env file
require( 'dotenv' ).config();

const express = require( 'express' );
const bodyParser = require( 'body-parser' );
const compress = require( 'compression' );
const requestIp = require( 'request-ip' );
const cookieParser = require( 'cookie-parser' );

const server = express();

// Load server settings
server.set( 'cookieSecret', process.env.COOKIE_SECRET );

// GZip all the things
server.use( compress() );

// Parse json
server.use( bodyParser.json() );

// Parse cookies
server.use( cookieParser( server.get( 'cookieSecret' ) ) );

// Set the client ip
server.use( function( req, res, next ) {

  server.set( 'clientIp', requestIp.getClientIp( req ) );

  next();

});

// Routes: API
require( './routes/users' )( server );

server.listen( 3000 );
