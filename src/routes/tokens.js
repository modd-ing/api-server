'use strict';

const Promise = require( 'bluebird' );
const seneca = require( '../seneca' )();
const _ = require( 'lodash' );
const routesUtil = require( '../util/routes-util' );
const validator = require( 'validator' );

// Promisify the seneca .act() method
const act = Promise.promisify( seneca.act, { context: seneca });

module.exports = function( server ) {

  const routeBase = '/api/v1/tokens';

  server
    .post( routeBase, function( req, res, next ) {

      const username = req.body.username, // This could be email as well
        type = req.body.type;

      if ( ! username ) {

        let status = 400,
          payload = {
            errors: [
              {
                title: 'Username not valid',
                detail: 'Username was not provided.',
                propertyName: 'username',
                status: 400
              }
            ]
          };

        res
          .status( status )
          .json( payload );

        return;

      }

      const allowedType = [
        'password:update'
      ];

      if ( ! type || -1 === allowedType.indexOf( type ) ) {

        let status = 400,
          payload = {
            errors: [
              {
                title: 'Type not valid',
                detail: 'Type was not provided, or is not valid.',
                propertyName: 'type',
                status: 400
              }
            ]
          };

        res
          .status( status )
          .json( payload );

        return;

      }

      let queryParams = {};

      if ( validator.isEmail( username ) ) {

        queryParams.email = username;

      } else {

        queryParams.username = username;

      }

      act({
        role: 'api',
        path: 'users',
        type: 'read',
        cmd: 'getUsers',
        args: queryParams,
        options: {}
      })
      .then( ( result ) => {

        if ( _.isEmpty( result.data ) ) {

          // User not found, but don't let them know, we don't want to share that information
          res.sendStatus( 201 );

          return;

        }

        const user = result.data[0],
          userId = user.id;

        act({
          role: 'api',
          path: 'tokens',
          cmd: 'post',
          userId: userId,
          type: type
        })
        .then( ( result ) => {

          if ( ! _.isEmpty( reply.errors ) ) {

            res
              .status( routesUtil.extractAppropriateStatus( reply.errors ) )
              .json({
                errors: reply.errors
              });

            return;

          }

          res.sendStatus( 201 );

        })
        .catch( ( err ) => {

          res.sendStatus( 500 );

        });

      })
      .catch( ( err ) => {

        res.sendStatus( 500 );

      });

    });

};
