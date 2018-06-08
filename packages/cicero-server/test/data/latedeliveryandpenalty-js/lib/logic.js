'use strict';

/*eslint-disable no-unused-vars*/
/*eslint-disable no-undef*/
/*eslint-disable no-var*/

/**
 * Execute the smart clause
 * @param {Context} context - the Accord context
 * @param {org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyRequest} context.request - the incoming request
 * @param {org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse} context.response - the response
 * @param {Event} context.emit - the emitted events
 * @AccordClauseLogic
 */
function execute(context) {

    logger.info(context);
    var req = context.request;
    var res = context.response;
    var contract = context.contract;
    var now = moment(req.timestamp);
    var agreed = moment(req.agreedDelivery);

    res.buyerMayTerminate = false;
    res.penalty = 0;

    if (req.forceMajeure) {
        logger.info('forceMajeure');
        res.buyerMayTerminate = true;
    }

    if (!req.forceMajeure && now.isAfter(agreed)) {
        logger.info('late');
        logger.info('penalty duration unit: ' + contract.penaltyDuration.unit);
        logger.info('penalty duration amount: ' + contract.penaltyDuration.amount);
        // the delivery is late
        var diff = now.diff(agreed, contract.penaltyDuration.unit);
        logger.info('diff:' + diff);

        var penalty = (diff / contract.penaltyDuration.amount) * contract.penaltyPercentage/100 * req.goodsValue;

        // cap the maximum penalty
        if (penalty > contract.capPercentage/100 * req.goodsValue) {
            logger.info('capped.');
            penalty = contract.capPercentage/100 * req.goodsValue;
        }

        res.penalty = penalty;

        // can we terminate?
        if (diff > contract.termination.amount) {
            logger.info('buyerMayTerminate.');
            res.buyerMayTerminate = true;
        }
    }
}

/*eslint-enable no-unused-vars*/
/*eslint-enable no-undef*/