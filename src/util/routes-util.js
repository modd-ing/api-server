'use strict';

const _ = require( 'lodash' );

/**
 * Given an array of objects with an html status, it returns
 * the most fitting one based on the first object.
 * @param {array} objects - Array of objects with the status property.
 */
exports.extractAppropriateStatus = function( objects ) {

  const defaultStatus = 500;

  if ( ! _.isArray( objects ) ) {

    return defaultStatus;

  }

  objects = objects.filter( ( object ) => {
    return _.isInteger( object.status );
  });

  if ( _.isEmpty( objects ) ) {

    return defaultStatus;

  }

  let firstObject = _.first( objects ),
    firstStatus = firstObject.status;

  if ( 1 === objects.length ) {

    return firstStatus;

  }

  function statusIsEqualToFirstStatus( object ) {

    return object.status === firstStatus;

  }

  if ( objects.every( statusIsEqualToFirstStatus ) ) {

    return firstStatus;

  }

  if ( firstStatus >= 500 ) {

    return 500;

  } else if ( firstStatus >= 400 ) {

    return 400;

  } else if ( firstStatus >= 300 ) {

    return 300;

  }

  return defaultStatus;

}
