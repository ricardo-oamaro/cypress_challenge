# language: en
@api
Feature: ServeRest API
  As an API consumer
  I want to validate core contracts
  So that registration, authentication, and catalog behave as documented

  Scenario: User registration returns 201 Created
    When I send a user registration with a unique email to the API
    Then the API should respond 201 with registration success message

  Scenario: Successful login returns a Bearer token
    Given a user exists for API testing
    When I send login with correct email and password
    Then the API should respond 200 with login message and Bearer token

  Scenario: Product listing returns count and items
    When I request the product listing from the API
    Then the response should include quantity and a products array

  Scenario: Duplicate email on registration returns 400 Bad Request
    Given an email was already registered in the API
    When I try to register another user with the same email
    Then the API should respond 400 indicating the email is in use

  Scenario: Login with wrong password returns 401 Unauthorized
    Given a user exists for API testing
    When I send API login with incorrect password
    Then the API should respond 401 with invalid credentials message

  Scenario: Fetch user by id returns registered profile
    When I register a user and fetch by ID from the API
    Then the API should return the same email and name as registered
