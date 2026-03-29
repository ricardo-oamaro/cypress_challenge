# language: en
@e2e @front
Feature: ServeRest frontend
  As a visitor or customer
  I want to use the store frontend
  So that I can sign in, register, and use the logged-in area

  Scenario: Login page shows fields and link to sign up
    Given I open the ServeRest login page
    Then I should see the login form and sign-up link

  Scenario: New user registration completes successfully
    Given I open the user registration page
    When I fill the form with name, unique email, and valid password
    Then I should see the registration success message

  Scenario: Login redirects to the customer home
    Given a new user was registered via API
    When I log in through the UI with the registered credentials
    Then I should land on the customer home with the product listing

  Scenario: Invalid credentials show an error and stay on login
    When I try to sign in with invalid credentials
    Then I should remain on the login page with an error message

  Scenario: Home search finds an existing product
    Given I obtained a product name from the API listing
    And a new user was registered via API
    When I log in through the UI with the registered credentials
    And I search on the home page using that product name
    Then I should see the product in the filtered listing

  Scenario: Administrator login opens the admin dashboard
    Given an administrator user was registered via API
    When I log in through the UI with the registered credentials
    Then I should land on the admin home
