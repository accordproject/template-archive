'use strict';

/*eslint-disable no-unused-vars*/
/*eslint-disable no-undef*/
/*eslint-disable no-var*/

/**
 * Execute the smart clause
 * @param {Context} context - the Accord context
 * @param {org.accordproject.volumediscount.VolumeDiscountRequest} context.request - the incoming request
 * @param {org.accordproject.volumediscount.VolumeDiscountResponse} context.response - the response
 * @AccordClauseLogic
 */
function execute(context) {

    logger.info(context);
    var req = context.request;
    var res = context.response;
    var data = context.contract;

    // decision table
    var netAnnualChargeVolume = req.netAnnualChargeVolume;

    if (netAnnualChargeVolume < data.firstVolume) {
	res.discountRate = data.firstRate;
    } else if (netAnnualChargeVolume < data.secondVolume) {
	res.discountRate = data.secondRate;
    } else {
	res.discountRate = data.thirdRate;
    }
    
}

/*eslint-enable no-unused-vars*/
/*eslint-enable no-undef*/