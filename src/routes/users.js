'use strict';

const Promise = require( 'bluebird' );
const seneca = require( '../seneca' )();
const _ = require( 'lodash' );
const routesUtil = require( '../util/routes-util' );

// Promisify the seneca .act() method
const act = Promise.promisify( seneca.act, { context: seneca });

module.exports = function( server ) {

  const routeBase = '/api/v1/users';

  server
    .get( routeBase, function( req, res, next ) {

      act({
        role: 'api',
        path: 'users',
        type: 'read',
        cmd: 'get',
        params: req.params,
        query: req.query
        })
        .then( ( reply ) => {

          let status = 200,
            payload = {
              data: reply.data
            };

          if ( ! _.isEmpty( reply.errors ) ) {

            payload = {
              errors: reply.errors
            };

            status = routesUtil.extractAppropriateStatus( reply.errors );

          } else if ( _.isEmpty( reply.data ) ) {

            status = 404;

          }

          res
            .status( status )
            .json( payload );

        })
        .catch( ( err ) => {

          res.sendStatus( 500 );

        });

    })
    .get( routeBase + '/:id', function( req, res, next ) {

      act({
        role: 'api',
        path: 'users',
        type: 'read',
        cmd: 'get',
        params: req.params,
        query: req.query
        })
        .then( ( reply ) => {

          let status = 200,
            payload = {
              data: reply.data
            };

          if ( ! _.isEmpty( reply.errors ) ) {

            payload = {
              errors: reply.errors
            };

            status = routesUtil.extractAppropriateStatus( reply.errors );

          } else if ( _.isEmpty( reply.data ) ) {

            status = 404;

          }

          res
            .status( status )
            .json( payload );

        })
        .catch( ( err ) => {

          res.sendStatus( 500 );

        });

    });

};
