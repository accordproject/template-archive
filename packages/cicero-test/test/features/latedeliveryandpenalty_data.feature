Feature: Late delivery contract
  This describe the expected behavior for the Accord Project's late delivery and penalty contract

  Background:
    Given the template in "data/latedeliveryandpenalty"
    And that the contract data is
"""
{
  "$class": "org.accordproject.latedeliveryandpenalty.TemplateModel",
  "clauseId": "db000e58-ef72-4d43-9777-67428249a731",
  "forceMajeure": true,
  "penaltyDuration": {
    "$class": "org.accordproject.time.Duration",
    "amount": 2,
    "unit": "days"
  },
  "penaltyPercentage": 10.5,
  "capPercentage": 55,
  "termination": {
    "$class": "org.accordproject.time.Duration",
    "amount": 15,
    "unit": "days"
  },
  "fractionalPart": "days"
}
"""

  Scenario: The contract should be in the default initial state
    Then the initial state of the contract should be the default state

  Scenario: The contract should return the penalty amount but not allow the buyer to terminate
    When the current time is "2019-01-11T16:34:00-05:00"
    And it receives the request
"""
{
    "$class": "org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyRequest",
    "forceMajeure": false,
    "agreedDelivery": "2018-12-31 03:24:00Z",
    "deliveredAt": null,
    "goodsValue": 200.00
}
"""
    Then it should respond with
"""
{
  "$class": "org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse",
  "buyerMayTerminate": false,
  "penalty": 110
}
"""

  Scenario: The contract should return the penalty amount and allow the buyer to terminate
    When the current time is "2019-01-11T16:34:00-05:00"
    And it receives the request
"""
{
    "$class": "org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyRequest",
    "forceMajeure": false,
    "agreedDelivery": "2018-01-31 03:24:00Z",
    "deliveredAt": null,
    "goodsValue": 200.00
}
"""
    Then it should respond with
"""
{
  "$class": "org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse",
  "buyerMayTerminate": true,
  "penalty": 110
}
"""

  Scenario: The contract should not allow the late delivery clause to be triggered when the delivery is on time
    When the current time is "2019-01-11T16:34:00-05:00"
    And it receives the request
"""
{
    "$class": "org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyRequest",
    "forceMajeure": false,
    "agreedDelivery": "2019-01-31 03:24:00Z",
    "deliveredAt": null,
    "goodsValue": 200.00
}
"""
    Then it should reject the request with the error "[Ergo] Cannot exercise late delivery before delivery date"
