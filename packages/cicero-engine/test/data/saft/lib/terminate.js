'use strict';

/*eslint-disable no-unused-vars*/
/*eslint-disable no-undef*/
/*eslint-disable no-var*/

/**
 * Execute the smart clause
 * @param {Context} context - the Accord context
 * @param {io.clause.saft.Terminate} context.request - the incoming request
 * @param {io.clause.saft.Payout} context.response - the response
 * @param {Event} context.emit - the emitted events
 * @AccordClauseLogic
 */
function onTerminate(context) {
    logger.info(context);    
    var req = context.request;
    var res = context.response;
    var contract = context.contract;
    res.tokenAmount = 9;
    res.tokenAddress = contract.purchaser;
}

/*eslint-enable no-unused-vars*/
/*eslint-enable no-undef*/