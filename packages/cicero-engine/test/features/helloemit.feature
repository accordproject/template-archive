Feature: HelloWorld+Emit contract
  This describe the expected behavior for the HelloWorld+Emit

  Background:
    Given the template in "data/helloemit"
    And that the contract says
"""
Name of the person to greet: "Fred Blogs".
Thank you!
"""

  Scenario: The contract should say hello
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
  "output": "Hello Fred Blogs (World)"
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
  "output": "Hello Fred Blogs (World)"
}
"""
    And the following obligations should have been emitted
"""
[{
  "$class": "org.accordproject.helloemit.Greeting",
  "message": "Voila!"
}]
"""

