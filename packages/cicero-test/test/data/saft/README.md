
# SAFT (Simple Agreement for Future Tokens)

This is a smart legal contract that conforms to the [Accord Protocol Template Specification](https://docs.google.com/document/d/1UacA_r2KGcBA2D4voDgGE8jqid-Uh4Dt09AE-shBKR0), the protocol is managed by the open-source community of the [Accord Project](https://accordproject.org). The clause can be parsed and executed by the [Cicero](https://github.com/accordproject/cicero) engine.

## Description

> The SAFT contract is a futures contract where a person invests in a company in exchange for receiving utility tokens that may be used when a product launches.

This clause contains:
- *Sample Clause Text* - [sample.txt](sample.txt)
- *A template* - [grammar/template.tem](grammar/template.tem)
- *Some data models* - [models/model.cto](models/model.cto), [models/states.cto](models/states.cto)
- *Contact logic* (in JavaScript) - [logic/logic.js](lib/logic.js)

## Running this clause

### On your own machine

1. [Download the Cicero template library](https://github.com/accordproject/cicero-template-library/archive/master.zip)

2. Unzip the library with your favourite tool

3. Then from the command-line, change the current directory to the folder containing this README.md file.
```
cd saft
```
4. With the [Cicero command-line tool](https://github.com/accordproject/cicero#installation):
```
cicero execute --template ./ --sample ./sample.txt --request ./request.json --state./state.json
```
> Note, all of the command-line flags (like `--template`) are optional.

Alternatively you can use the simpler command below if you want to use all of the default files.
```
cicero execute
```

You should see the following output in your terminal:
```bash
mattmbp:saft matt$ cicero execute
11:29:54 - info: Logging initialized. 2018-02-18T11:29:54.114Z
11:29:54 - info: Using current directory as template folder
11:29:54 - info: Loading a default sample.txt file.
11:29:54 - info: Loading a default data.json file.
11:29:55 - info: CICERO-ENGINE {"request":{"$class":"org.accordproject.saft.Launch","exchangeRate":123,"transactionId":"416a8609-ad1f-4bb3-be88-e648f95c146d","timestamp":"2018-02-18T11:29:55.333Z"},"response":{"$class":"org.accordproject.saft.Payout","transactionId":"51cc3295-dec4-4e5c-a5f0-ea0ee7901d3e","timestamp":"2018-02-18T11:29:55.347Z"},"data":{"$class":"org.accordproject.saft.TemplateModel","token":"Clause Token","company":"Clause","companyType":"Limited","state":"NY","amendmentProvision":true,"purchaseAmount":25,"currency":"EUR","netProceedLimit":3000000,"date":"10/04/2017","deadlineDate":"04/20/2018","discountRatePercentage":38,"network":"Clause Network","coin":"Ether","exchanges":"itBit","companyRepresentative":"Peter Hunn","purchaser":"Daniel Charles Selman","description":"happiness and intergalactic equality"}}
11:29:55 - info: {"clause":"saft@0.1.1-d562b680e46b64846fdf0953aebcbf910da75f22b05b8553eea71ef0bd42e373","request":{"$class":"org.accordproject.saft.Launch","exchangeRate":123},"response":{"$class":"org.accordproject.saft.Payout","tokenAmount":100,"tokenAddress":"Daniel Charles Selman","transactionId":"51cc3295-dec4-4e5c-a5f0-ea0ee7901d3e","timestamp":"2018-02-18T11:29:55.347Z"}}
```

### Sample Payload Data


Request, as in [data.json](https://github.com/accordproject/cicero-template-library/blob/master/perishable-goods/data.json)
```json
{
    "$class": "org.accordproject.saft.Launch",
    "exchangeRate": 123
}
```

For the request above, you should see the following response:
```json
{
    "$class":"org.accordproject.saft.Payout",
    "tokenAmount":100,
    "tokenAddress":"Daniel Charles Selman",
    "transactionId":"51cc3295-dec4-4e5c-a5f0-ea0ee7901d3e",
    "timestamp":"2018-02-18T11:29:55.347Z"
}
```


## Testing this clause

This clause comes with an automated test that ensures that it executes correctly under different conditions. To test the clause, complete the following steps.

You need npm and node to test a clause. You can download both from [here](https://nodejs.org/).

> This clause was tested with Node v8.9.3 and NPM v5.6.0

From the `saft` directory.

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
mattmbp:saft matt$ npm test

> saft@0.1.1 test /Users/matt/dev/accordproject/cicero-template-library/saft
> mocha

11:31:59 - info: Logging initialized. 2018-02-18T11:31:59.439Z


  Logic
    #Launch
...
      ✓ when network launches there should be a payout


  1 passing (711ms)

```
> Output above is abbreviated for clarity at `...`
