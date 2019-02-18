Feature: HelloWorld
  This describe the expected behavior for an Accord Project's template

  Background:
    Given the default contract

  Scenario: The contract should Respond "Hello Dan World"
    When it receives the default request
    Then it should respond with
"""
{
    "$class": "<%= data.modelNamespace %>.MyResponse",
    "output": "Hello Dan World"
}
"""

