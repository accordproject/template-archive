'use strict';

/*eslint-disable no-unused-vars*/
/*eslint-disable no-undef*/
/*eslint-disable no-var*/

function execute(context) {

    logger.info(context);
    var req = context.request;
    var res = context.response;
    var data = context.data;
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
        logger.info('penalty duration unit: ' + data.penaltyDuration.unit);
        logger.info('penalty duration amount: ' + data.penaltyDuration.amount);
        // the delivery is late
        var diff = now.diff(agreed, data.penaltyDuration.unit);
        logger.info('diff:' + diff);

        var penalty = (diff / data.penaltyDuration.amount) * data.penaltyPercentage/100 * req.goodsValue;

        // cap the maximum penalty
        if (penalty > data.capPercentage/100 * req.goodsValue) {
            logger.info('capped.');
            penalty = data.capPercentage/100 * req.goodsValue;
        }

        res.penalty = penalty;

        // can we terminate?
        if (diff > data.termination) {
            logger.info('buyerMayTerminate.');
            res.buyerMayTerminate = true;
        }
    }
}

/*eslint-enable no-unused-vars*/
/*eslint-enable no-undef*/