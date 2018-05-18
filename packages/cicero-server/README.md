# Cicero Server

Exposes the Cicero Engine as a RESTful service, useful for testing. Templates are loaded from a 
the root CICERO_DIR. Clauses may be instantiated from JSON or TXT files loaded from CICERO_DIR.

## Installation

```
npm install -g @accordproject/cicero-server --save
```

## Run

### Stateful request
```
export CICERO_DIR=<cicero-template-dir>
cicero-server
curl -X POST --header 'Content-Type: application/json' --header 'Accept: application/json' http://localhost:6001/execute/latedeliveryandpenalty/sample.txt -d '{ "request": { "$class": "org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyRequest", "forceMajeure": false,"agreedDelivery": "December 17, 2017 03:24:00", "deliveredAt": null, "goodsValue": 200.00 }, "state": { "$class": "org.accordproject.common.ContractState", "stateId" : "org.accordproject.common.ContractState#1"}}'
```

/execute/latedeliveryandpenalty/data.json')
            .send({
                request: body,
                state,
            })

### Stateless request (legacy)
Only supported for clauses or contracts without references to contract state

```
export CICERO_DIR=<cicero-template-dir>
cicero-server
curl -X POST --header 'Content-Type: application/json' --header 'Accept: application/json' http://localhost:6001/execute/latedeliveryandpenalty/sample.txt -d '{ "$class": "org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyRequest", "forceMajeure": false,"agreedDelivery": "December 17, 2017 03:24:00", "deliveredAt": null, "goodsValue": 200.00 }'
```