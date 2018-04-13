# Cicero Server

Exposes the Cicero Engine as a RESTful service, useful for testing. Templates are loaded from a 
the root CICERO_DIR. Clauses may be instantiated from JSON or TXT files loaded from CICERO_DIR.

## Installation

```
npm install -g @accordproject/cicero-server --save
```

## Run

```
export CICERO_DIR=<cicero-template-dir>
cicero-server
curl -X POST --header 'Content-Type: application/json' --header 'Accept: application/json' http://localhost:6001/execute/acceptance-of-delivery/sample.txt -d '{"$class" : "org.accordproject.acceptanceofdelivery.InspectDeliverable","deliverableReceivedAt" : "2017-12-03","inspectionPassed" : "false"}'
```