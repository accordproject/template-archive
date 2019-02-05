Feature: HelloWorld+Emit contract for the default sample
  This describe the expected behavior for the HelloWorld+Emit

  Background:
    Given the default contract

  Scenario: The contract data should be set
    Then the contract data should be
"""
{
  "$class": "org.accordproject.helloemit.TemplateModel",
  "name": "Fred Blogs"
}
"""

  Scenario: The contract should say hello
    When it receives the default request
    Then it should respond with
"""
{
  "$class": "org.accordproject.helloemit.MyResponse",
  "output": "Hello Fred Blogs (World)"
}
"""

