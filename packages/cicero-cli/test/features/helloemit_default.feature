Feature: HelloWorld+Emit contract for the default sample
  This describe the expected behavior for the HelloWorld+Emit

  Background:
    Given the template in "data/helloemit"
    And the default contract

  Scenario: The contract data should be set
    Then the contract data should be
"""
{
  "$class": "org.accordproject.helloemit@1.0.0.TemplateModel",
  "name": "Fred Blogs"
}
"""

  Scenario: The contract should say hello
    When it receives the default request
    Then it should respond with
"""
{
  "$class": "org.accordproject.helloemit@1.0.0.MyResponse",
  "output": "Hello Fred Blogs (World)"
}
"""

