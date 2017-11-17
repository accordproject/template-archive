'use strict';

/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable no-var */

/**
 * Execute the smart clause
 * @param {Context} context - the Accord context
 * @param {<%= data.modelNamespace %>.Request} context.request - the incoming request
 * @param {<%= data.modelNamespace %>.Response} context.response - the response
 * @AccordClauseLogic
 */
function execute(context) {
  logger.info(context);
  var req = context.request;
  var res = context.response;
  var data = context.data;
  res.output = 'Hello ' + data.name + ' ' + request.input;
}

/* eslint-enable no-unused-vars */
/* eslint-enable no-undef */
