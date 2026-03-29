const { Given, When, Then } = require('@badeball/cypress-cucumber-preprocessor');
const { LoginPage } = require('../pages/LoginPage');
const { UserRegistrationPage } = require('../pages/UserRegistrationPage');
const { ClientHomePage } = require('../pages/ClientHomePage');
const { AdminHomePage } = require('../pages/AdminHomePage');

const apiUrl = () => Cypress.env('apiUrl');

Given('I open the ServeRest login page', () => {
  cy.clearAllLocalStorage();
  const loginPage = new LoginPage();
  loginPage.visit();
});

Then('I should see the login form and sign-up link', () => {
  const loginPage = new LoginPage();
  loginPage.assertLoginFormVisible();
});

Given('I open the user registration page', () => {
  cy.clearAllLocalStorage();
  const page = new UserRegistrationPage();
  page.visit();
});

When('I fill the form with name, unique email, and valid password', () => {
  const email = `cad_${Date.now()}@qa.com`;
  cy.fixture('user').then((userFixture) => {
    const page = new UserRegistrationPage();
    page.fillName(userFixture.names.signUpUi);
    page.fillEmail(email);
    page.fillPassword(userFixture.password);
    page.submit();
  });
});

Then('I should see the registration success message', () => {
  const page = new UserRegistrationPage();
  page.assertRegistrationSuccess();
});

Given('a new user was registered via API', () => {
  cy.fixture('user').then((userFixture) => {
    cy.registerUserApi({
      email: `e2e_${Date.now()}@qa.com`,
      name: userFixture.names.e2eUser,
    }).then(({ res, email, password }) => {
      expect(res.status).to.eq(201);
      expect(res.body.message).to.eq('Cadastro realizado com sucesso');
      cy.wrap({ email, password }).as('loginCredentials');
    });
  });
});

Given('an administrator user was registered via API', () => {
  cy.fixture('user').then((userFixture) => {
    cy.registerUserApi({
      email: `admin_${Date.now()}@qa.com`,
      name: userFixture.names.admin,
      administrator: 'true',
    }).then(({ res, email, password }) => {
      expect(res.status).to.eq(201);
      cy.wrap({ email, password }).as('loginCredentials');
    });
  });
});

Given('I obtained a product name from the API listing', () => {
  cy.request('GET', `${apiUrl()}/produtos`).then((res) => {
    expect(res.status).to.eq(200);
    expect(res.body.produtos.length).to.be.greaterThan(0);
    cy.wrap(res.body.produtos[0].nome).as('listedProductName');
  });
});

When('I log in through the UI with the registered credentials', () => {
  cy.get('@loginCredentials').then(({ email, password }) => {
    const loginPage = new LoginPage();
    loginPage.visit();
    loginPage.fillEmail(email);
    loginPage.fillPassword(password);
    loginPage.submit();
  });
});

When('I search on the home page using that product name', () => {
  cy.get('@listedProductName').then((productName) => {
    const home = new ClientHomePage();
    home.searchByTerm(productName);
  });
});

Then('I should land on the customer home with the product listing', () => {
  const home = new ClientHomePage();
  home.assertClientHomeUrl();
  home.assertLoggedInProductArea();
});

Then('I should land on the admin home', () => {
  const admin = new AdminHomePage();
  admin.assertAdminHomeUrl();
  admin.assertAdminPanelVisible();
});

Then('I should see the product in the filtered listing', () => {
  cy.get('@listedProductName').then((productName) => {
    const home = new ClientHomePage();
    home.assertProductVisibleInList(productName);
  });
});

When('I try to sign in with invalid credentials', () => {
  cy.clearAllLocalStorage();
  const loginPage = new LoginPage();
  loginPage.visit();
  loginPage.fillEmail('nonexistent@qa.com');
  loginPage.fillPassword('wrongPassword123!');
  loginPage.submit();
});

Then('I should remain on the login page with an error message', () => {
  const loginPage = new LoginPage();
  loginPage.assertInvalidCredentialsMessage();
});
