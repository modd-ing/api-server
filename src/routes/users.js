'use strict';

const Promise = require( 'bluebird' );
const seneca = require( '../seneca' )();
const _ = require( 'lodash' );

// Promisify the seneca .act() method
const act = Promise.promisify( seneca.act, { context: seneca });

module.exports = function( server ) {

  const routeBase = '/api/v1/users';

  server
    .get( routeBase, function( req, res, next ) {

      res.json({});

    });

};
