
# Copyright License

This is a smart legal clause that conforms to the [Accord Protocol Template Specification](https://docs.google.com/document/d/1UacA_r2KGcBA2D4voDgGE8jqid-Uh4Dt09AE-shBKR0), the protocol is managed by the open-source community of the [Accord Project](https://accordproject.org). The clause can be parsed and executed by the [Cicero](https://github.com/accordproject/cicero) engine.

## Description
> This clause is a copyright license agreement.

This clause contains:
- *Some sample Clause Text* - [sample.txt](sample.txt)
- *A template* - [grammar/template.tem](grammar/template.tem)
- *A data model* - [models/model.cto](models/model.cto)
- *Contact logic* (in JavaScript) - [logic/logic.js](lib/logic.js)

## Running this clause

### On your own machine

1. [Download the Cicero template library](https://github.com/accordproject/copyright-license/archive/master.zip)

2. Unzip the library with your favourite tool

3. Then from the command-line, change the current directory to the folder containing this README.md file.
```
cd copyright-license
```
4. With the [Cicero command-line tool](https://github.com/accordproject/cicero#installation):
```
cicero execute --template ./ --sample ./sample.txt --request ./request.json --state./state.json
00:42:29 - info: Logging initialized. 2018-05-04T04:42:29.992Z
00:42:30 - info: Using current directory as template folder
00:42:30 - info: Loading a default sample.txt file.
00:42:30 - info: Loading a default data.json file.
00:42:30 - info: {"clause":"copyright-license@0.0.3-e949d285040b994e1585f8e375d211b9c2e95e142213e1a76141e7a2de8589f8","request":{"$class":"org.accordproject.copyrightlicense.PaymentRequest"},"response":{"$class":"org.accordproject.copyrightlicense.PayOut","amount":1000,"transactionId":"478eff7c-6861-4af8-ad66-68ed532035a6","timestamp":"2018-05-04T04:42:30.698Z"}}
```
> Note, all of the command-line flags (like `--template`) are optional.

Alternatively you can use the simpler command below if you want to use all of the default files.
```
cicero execute
```

You should see the following output in your terminal:
```bash
mattmbp:copyright-license matt$ cicero execute
```

### Sample Payload Data


Request, as in [data.json](https://github.com/accordproject/cicero-template-library/blob/master/acceptance-of-delivery/data.json)
```json
{
    "$class":"org.accordproject.copyrightlicense.PaymentRequest"
}
```

For the request above, you should see the following response:
```json
{
  "$class": "org.accordproject.copyrightlicense.PayOut",
  "amount": 1000,
  "transactionId": "478eff7c-6861-4af8-ad66-68ed532035a6",
  "timestamp": "2018-05-04T04:42:30.698Z"
}
```


## Testing this clause

This clause comes with an automated test that ensures that it executes correctly under different conditions. To test the clause, complete the following steps.

You need npm and node to test a clause. You can download both from [here](https://nodejs.org/).

> This clause was tested with Node v8.9.3 and NPM v5.6.0

From the `copyright-license` directory.

1. Install all of the dependencies.
```
npm install
```

2. Run the tests
```
npm test
```
If successful, you should see the following output
```
mattmbp:copyright-license matt$ npm test

> copyright-license@0.0.3 test /Users/matt/dev/accordproject/cicero-template-library/copyright-license
> mocha

21:57:31 - info: Logging initialized. 2018-02-17T21:57:31.074Z


  Logic
    #InspectDeliverable
      ✓ passed inspection within time limit
      ✓ failed inspection within time limit
      ✓ inspection outside time limit
      ✓ inspection before delivable should throw


  4 passing (458ms)

```
