'use strict';

const fse = require( 'fs-extra' );
const allowedExtensions = [
  'jpg',
  'jpeg',
  'png',
  'zip',
  'pdf',
  'txt'
];

exports.getAttachmentUploadDestination = function( req, file, cb ) {

  if ( ! req.session.consumer ) {

    const err = new Error( 'Unauthorized' );

    err.title = 'Unauthorized';
    err.detail = 'You are not authorized to do this.';
    err.propertyName = 'attachment';
    err.status = 403;
    cb( err, null );

    return;

  }

  const destination = 'attachments/' + req.session.consumer.id;

  cb( null, destination );

}

exports.getAttachmentFilename = function( req, file, cb ) {

  const extension = exports.getFileExtension( file.originalname ),
    name = Date.now();

  let filename = name + '.' + extension,
    allowedExtensionsLocal = allowedExtensions;

  if ( req.query.force ) {

    allowedExtensionsLocal = req.query.force.split( ':' );

  }

  if ( req.session.consumer ) {

    filename = req.session.consumer.id.substring( 0, 13 ) + filename;

  }

  if ( ! extension || -1 === allowedExtensions.indexOf( extension ) || -1 === allowedExtensionsLocal.indexOf( extension ) ) {

    const err = new Error( 'File of this type is not allowed!' );

    err.title = 'File type not valid';
    err.detail = 'File of this type is not allowed.';
    err.propertyName = 'attachment';
    err.status = 415;

    cb( err, null );

    return;

  }

  cb( null, filename );

}

exports.getFileExtension = function( fileName ) {

  // http://stackoverflow.com/questions/680929/how-to-extract-extension-from-filename-string-in-javascript
  const re = /(?:\.([^.]+))?$/;

  return re.exec( fileName )[1];

}
