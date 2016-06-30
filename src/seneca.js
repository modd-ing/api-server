'use strict';

let seneca = require( 'seneca' )();

seneca
  .use( 'seneca-amqp-transport' )
  .client({
    pin: 'role:api,path:users,type:read',
    type: 'amqp',
    url: 'amqp://rabbitmq-api'
  })
  .client({
    pin: 'role:api,path:users,type:write',
    type: 'amqp',
    url: 'amqp://rabbitmq-api'
  })
  .client({
    pin: 'role:api,path:authorize',
    type: 'amqp',
    url: 'amqp://rabbitmq-api'
  });

module.exports = function() {

  return seneca;

};
