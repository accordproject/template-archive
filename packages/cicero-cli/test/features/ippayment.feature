Feature: IP Payment Contract
  This describes the expected behavior for the Accord Project’s IP Payment Contract contract

  Background:
    Given the template in "data/ip-payment"
    And the default contract

  Scenario: Payment of a specified amount should be made
    When the current time is "2019-03-04T16:34:00-05:00"
    And the UTC offset is -5
    And it receives the request
"""
{
    "$class": "org.accordproject.ippayment.PaymentRequest",
    "netSaleRevenue": 1200,
    "sublicensingRevenue": 450,
    "permissionGrantedBy": "2018-04-05T00:00:00-05:00"
}
"""
    Then it should respond with
"""
{
    "$class": "org.accordproject.ippayment.PayOut",
    "totalAmount": 77.4,
    "dueBy": "2018-04-12T00:00:00.000-05:00"
}
"""

Scenario: Payment of a specified amount should be made
    When the current time is "2019-03-01T16:34:00-02:00"
    And the UTC offset is -2
    And it receives the request
"""
{
    "$class": "org.accordproject.ippayment.PaymentRequest",
    "netSaleRevenue": 1550,
    "sublicensingRevenue": 225,
    "permissionGrantedBy": "2018-04-05T00:00:00-05:00"
}
"""
    Then it should respond with
"""
{
    "$class": "org.accordproject.ippayment.PayOut",
    "totalAmount": 81.45,
    "dueBy": "2018-04-12T03:00:00.000-02:00"
}
"""

Scenario: Payment of a specified amount should be made
    When the current time is "2019-02-14T16:34:00-07:00"
    And the UTC offset is -7
    And it receives the request
"""
{
    "$class": "org.accordproject.ippayment.PaymentRequest",
    "netSaleRevenue": 700,
    "sublicensingRevenue": 400,
    "permissionGrantedBy": "2018-04-05T00:00:00-05:00"
}
"""
    Then it should respond with
"""
{
    "$class": "org.accordproject.ippayment.PayOut",
    "totalAmount": 52.3,
    "dueBy": "2018-04-11T22:00:00.000-07:00"
}
"""
