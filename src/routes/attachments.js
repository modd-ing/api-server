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
    .post( routeBase, uploadMiddleware.single( 'attachment' ), function( err, req, res, next ) {

      if ( err ) {

        res
          .status( err.status )
          .json({
            errors: [
              {
                title: err.title,
                detail: err.detail,
                propertyName: err.propertyName,
                status: err.status
              }
            ]
          });

        return;

      }

      act({
        role: 'api',
        path: 'attachments',
        type: 'write',
        cmd: 'post',
        params: req.params,
        query: req.query,
        body: req.body,
        file: req.file
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

    });

};
