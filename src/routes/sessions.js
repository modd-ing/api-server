'use strict';

const Promise = require( 'bluebird' );
const seneca = require( '../seneca' )();
const _ = require( 'lodash' );
const routesUtil = require( '../util/routes-util' );
const validator = require( 'validator' );
const bcrypt = require( 'bcryptjs' );
const jwt = require( 'jsonwebtoken' );

// Promisify the seneca .act() method
const act = Promise.promisify( seneca.act, { context: seneca });

module.exports = function( server ) {

  const routeBase = '/api/v1/sessions';

  server
    .post( routeBase, function( req, res, next ) {

      if ( req.session.consumer ) {

        let status = 400,
          payload = {
            errors: [
              {
                title: 'Already authenticated',
                detail: 'You are already logged in.',
                status: 400
              }
            ]
          };

        res
          .status( status )
          .json( payload );

        return;

      }

      let username = req.body.username, // This could be email as well
        password = req.body.password,
        remember = !! req.body.remember || false;

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

      if ( ! password ) {

        let status = 400,
          payload = {
            errors: [
              {
                title: 'Password not valid',
                detail: 'Password was not provided.',
                propertyName: 'password',
                status: 400
              }
            ]
          };

        res
          .status( status )
          .json( payload );

        return;

      }

      if (
        ! validator.isEmail( username ) &&
        ! validator.isLength( username, 2 )
      ) {

        let status = 400,
          payload = {
            errors: [
              {
                title: 'Username not valid',
                detail: 'Username has to have at least two characters.',
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
        args: queryParams
      })
      .then( ( result ) => {

        if ( _.isEmpty( result.data ) ) {

          let status = 400,
            payload = {
              errors: [
                {
                  title: 'Username or password not valid',
                  detail: 'Username/email or password are incorrect.',
                  status: 400
                }
              ]
            };

          res
            .status( status )
            .json( payload );

          return;

        }

        let user = result.data[0];

        bcrypt.compare( password, user.password, ( err, isSame ) => {

          if ( err ) {

            res.sendStatus( 500 );

            return;

          }

          if ( ! isSame ) {

            let status = 400,
              payload = {
                errors: [
                  {
                    title: 'Username or password not valid',
                    detail: 'Username/email or password are incorrect.',
                    status: 400
                  }
                ]
              };

            res
              .status( status )
              .json( payload );

            return;

          }

          // Looks like everything is ok, authenticate the user
          if ( ! remember ) {

            req.session.cookie.expires = false;

          }

          req.session.consumer = user.id;

          jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' },
            ( err, token ) => {

              if ( err ) {

                res.sendStatus( 500 );

                return;

              }

              req.session.consumerJWT = token;

              res.sendStatus( 201 );

            }
          );

        });
      })
      .catch( ( err ) => {

        res.sendStatus( 500 );

      });

    })
    .delete( routeBase, function( req, res, next ) {

      if ( ! req.session.consumer ) {

        let status = 400,
          payload = {
            errors: [
              {
                title: 'Not authenticated',
                detail: 'You are not logged in.',
                status: 400
              }
            ]
          };

        res
          .status( status )
          .json( payload );

        return;

      }

      delete req.session.consumer;
      delete req.session.consumerJWT;

      res.sendStatus( 200 );

    });

};
