Feature: HelloWorld+Emit contract
  This describe the expected behavior for the HelloWorld+Emit

  Background:
    Given that the contract says
"""
Name of the person to greet: "John Doe".
Thank you!
"""

  Scenario: The contract data should be set
    Then the contract data should be
"""
{
  "$class": "org.accordproject.helloemit.TemplateModel",
  "name": "John Doe"
}
"""

  Scenario: The contract should say hello
    When it receives the request
"""
{
    "$class": "org.accordproject.helloemit.MyRequest",
    "input": "Le Monde"
}
"""
    Then it should respond with
"""
{
  "$class": "org.accordproject.helloemit.MyResponse",
  "output": "Hello John Doe (Le Monde)"
}
"""

  Scenario: The contract should emit a greeting
    When it receives the request
"""
{
    "$class": "org.accordproject.helloemit.MyRequest",
    "input": "World"
}
"""
    Then the following obligations should have been emitted
"""
[{
  "$class": "org.accordproject.helloemit.Greeting",
  "message": "Voila!"
}]
"""

  Scenario: The contract should say hello and emit a greeting
    When it receives the request
"""
{
    "$class": "org.accordproject.helloemit.MyRequest",
    "input": "World"
}
"""
    Then it should respond with
"""
{
  "$class": "org.accordproject.helloemit.MyResponse",
  "output": "Hello John Doe (World)"
}
"""
    And the following obligations should have been emitted
"""
[{
  "$class": "org.accordproject.helloemit.Greeting",
  "message": "Voila!"
}]
"""

