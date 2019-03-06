Feature: saft
  This describe the expected behavior for the Accord Project's saft contract

  Background:
    Given the default contract

  Scenario: The network launched and there was a payout
    When it receives the request
"""
{
    "$class": "org.accordproject.saft.Launch",
    "exchangeRate": 123
}
"""
    Then it should respond with
"""
{
    "$class": "org.accordproject.saft.Payout",
    "tokenAmount": {
      "$class": "org.accordproject.money.MonetaryAmount",
      "doubleValue": 100,
      "currencyCode": "USD"
    },
    "tokenAddress": "Daniel Charles Selman"
}
"""

  Scenario: The network terminates and there was a payout
    When it receives the request
"""
{
    "$class": "org.accordproject.saft.Terminate",
    "remainingFunds": {
        "$class": "org.accordproject.money.MonetaryAmount",
        "doubleValue": 246.609,
        "currencyCode": "KGS"
    },
    "totalInvested": {
        "$class": "org.accordproject.money.MonetaryAmount",
        "doubleValue": 129.934,
        "currencyCode": "TMT"
    }
}
"""
    Then it should respond with
"""
{
    "$class": "org.accordproject.saft.Payout",
    "tokenAmount": {
      "$class": "org.accordproject.money.MonetaryAmount",
      "doubleValue": 9,
      "currencyCode": "USD"
    },
    "tokenAddress": "Daniel Charles Selman"
}
"""