'use strict';

const Promise = require( 'bluebird' );
const seneca = require( '../seneca' )();
const _ = require( 'lodash' );
const routesUtil = require( '../util/routes-util' );
const uploadUtil = require( '../util/upload-util' );
const multer = require( 'multer' );
const s3 = require( 'multer-storage-s3' );
const storage = s3({
  destination: uploadUtil.getAttachmentUploadDestination,
  filename: uploadUtil.getAttachmentFilename,
});
const uploadMiddleware = multer({
  limits : {
    fileSize: 20 * 1000000
  },
  storage: storage
});

// Promisify the seneca .act() method
const act = Promise.promisify( seneca.act, { context: seneca });

module.exports = function( server ) {

  const routeBase = '/api/v1/attachments';

  server
    .get( routeBase, function( req, res, next ) {

      act({
        role: 'api',
        path: 'attachments',
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
        path: 'attachments',
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
    .post(
      routeBase,
      uploadMiddleware.single( 'attachment' ),
      ( req, res, next ) => {

        act({
          role: 'api',
          path: 'attachments',
          type: 'write',
          cmd: 'post',
          params: req.params,
          query: req.query,
          body: req.body,
          file: req.file,
          consumerJWT: req.session.consumerJWT
          })
          .then( ( reply ) => {

            let status = 201,
              payload = {
                data: reply.data
              };

            if ( ! _.isEmpty( reply.errors ) ) {

              payload = {
                errors: reply.errors
              };

              status = routesUtil.extractAppropriateStatus( reply.errors );

            }

            res
              .status( status )
              .json( payload );

          })
          .catch( ( err ) => {

            res.sendStatus( 500 );

          });

      },
      ( err, req, res, next ) => {

        res
          .status( err.status || 500 )
          .json({
            errors: [
              {
                title: err.title || 'Error',
                detail: err.detail || err.message,
                propertyName: err.propertyName || 'attachment',
                status: err.status || 400
              }
            ]
          });

        return;

      }
    )
    .patch( routeBase + '/:id', function( req, res, next ) {

      if ( ! req.session.consumer ) {

        res
          .status( 403 )
          .json({
            errors: [
              {
                title: 'Unauthorized',
                detail: 'You are not authorized to do this.',
                status: 403
              }
            ]
          });

        return;

      }

      act({
        role: 'api',
        path: 'attachments',
        type: 'write',
        cmd: 'patch',
        params: req.params,
        query: req.query,
        body: req.body,
        consumerJWT: req.session.consumerJWT
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
    .delete( routeBase + '/:id', function( req, res, next ) {

      if ( ! req.session.consumer ) {

        res
          .status( 403 )
          .json({
            errors: [
              {
                title: 'Unauthorized',
                detail: 'You are not authorized to do this.',
                status: 403
              }
            ]
          });

        return;

      }

      act({
        role: 'api',
        path: 'attachments',
        type: 'write',
        cmd: 'delete',
        params: req.params,
        query: req.query,
        body: req.body,
        consumerJWT: req.session.consumerJWT
        })
        .then( ( reply ) => {

          let status,
            payload = {
              data: reply.data
            };

          if ( ! _.isEmpty( reply.errors ) ) {

            payload = {
              errors: reply.errors
            };

            status = routesUtil.extractAppropriateStatus( reply.errors );

          } else  {

            res.sendStatus( 204 );

            return;

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
