
# Volume Discount

This is a smart legal clause conforms that to the [Accord Protocol Template Specification](https://docs.google.com/document/d/1UacA_r2KGcBA2D4voDgGE8jqid-Uh4Dt09AE-shBKR0), the protocol is managed by the open-source community of the [Accord Project](https://accordproject.org). The clause can be parsed and executed by the [Cicero](https://github.com/accordproject/cicero) engine.

## Description

> A sample volume discount clause.

This clause contains:
- *Sample Clause Text* - [sample.txt](sample.txt)
- *A template* - [grammar/template.tem](grammar/template.tem)
- *A data model* - [models/clause.cto](models/clause.cto)
- *Contact logic* (in JavaScript) - [logic/logic.js](lib/logic.js)

## Running this clause

### On your own machine

1. [Download the Cicero template library](https://github.com/accordproject/cicero-template-library/archive/master.zip)

2. Unzip the library with your favourite tool

3. Then from the command-line, change the current directory to the folder containing this README.md file.
```
cd volumediscount
```
4. With the [Cicero command-line tool](https://github.com/accordproject/cicero#installation):
```
cicero execute --template ./ --dsl ./sample --data ./data.json
```
> Note, all of the command-line flags (like `--template`) are optional.

Alternatively you can use the simpler command below if you want to use all of the default files.
```
cicero execute
```

You should see the following output in your terminal:
```bash
mattmbp:volumediscount matt$ cicero execute
11:36:39 - info: Logging initialized. 2018-02-18T11:36:39.495Z
11:36:40 - info: Using current directory as template folder
11:36:40 - info: Loading a default sample.txt file.
11:36:40 - info: Loading a default data.json file.
11:36:40 - info: CICERO-ENGINE {"request":{"$class":"org.accordproject.volumediscount.VolumeDiscountRequest","netAnnualChargeVolume":0.4,"transactionId":"06b93a11-2d74-4030-a486-f35449ac032f","timestamp":"2018-02-18T11:36:40.340Z"},"response":{"$class":"org.accordproject.volumediscount.VolumeDiscountResponse","transactionId":"5f448219-851a-4b10-8fb9-14f979951ebd","timestamp":"2018-02-18T11:36:40.353Z"},"data":{"$class":"org.accordproject.volumediscount.TemplateModel","firstVolume":1,"secondVolume":10,"firstRate":3,"secondRate":2.9,"thirdRate":2.8}}
11:36:40 - info: {"clause":"volumediscount@0.0.6-e6b68c35598afb65ddf51bfc40ada8cb482cb441605eb0285d46e708f8654d58","request":{"$class":"org.accordproject.volumediscount.VolumeDiscountRequest","netAnnualChargeVolume":0.4},"response":{"$class":"org.accordproject.volumediscount.VolumeDiscountResponse","discountRate":3,"transactionId":"5f448219-851a-4b10-8fb9-14f979951ebd","timestamp":"2018-02-18T11:36:40.353Z"}}
```

### Sample Payload Data


Request, as in [data.json](https://github.com/accordproject/cicero-template-library/blob/master/perishable-goods/data.json)
```json
{
    "$class": "org.accordproject.volumediscount.VolumeDiscountRequest",
    "netAnnualChargeVolume": 0.4
}
```

For the request above, you should see the following response:
```json
{
    "$class":"org.accordproject.volumediscount.VolumeDiscountResponse",
    "discountRate":3,
    "transactionId":"5f448219-851a-4b10-8fb9-14f979951ebd",
    "timestamp":"2018-02-18T11:36:40.353Z"
}
```


## Testing this clause

This clause comes with an automated test that ensures that it executes correctly under different conditions. To test the clause, complete the following steps.

You need npm and node to test a clause. You can download both from [here](https://nodejs.org/).

> This clause was tested with Node v8.9.3 and NPM v5.6.0

From the `volumediscount` directory.

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
mattmbp:volumediscount matt$ npm test

> volumediscount@0.0.6 test /Users/matt/dev/mttrbrts/cicero-template-library/volumediscount
> mocha

11:37:53 - info: Logging initialized. 2018-02-18T11:37:53.706Z


  Logic
    #VolumeDiscount
...
      ✓ should execute a smart clause


  1 passing (326ms)

```
> Output above is abbreviated for clarity at `...`