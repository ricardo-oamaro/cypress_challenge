/**
 * Reusable custom commands.
 * Usage: cy.registerUserApi({ ... }), cy.loginApi(email, password), etc.
 *
 * ServeRest API expects Portuguese JSON keys (nome, administrador); JS uses English override names.
 * Passwords come from Cypress env / CYPRESS_testPassword, not from fixtures (see envPassword.js).
 */

const { getTestPassword } = require('./envPassword');

Cypress.Commands.add('registerUserApi', (overrides = {}) => {
  return cy.fixture('user').then((userFixture) => {
    const email = overrides.email ?? `u_${Date.now()}@qa.com`;
    const body = {
      nome: overrides.name ?? userFixture.names.e2eUser,
      email,
      password: getTestPassword(overrides.password),
      administrador:
        overrides.administrator ?? userFixture.administrator,
    };
    return cy
      .request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/usuarios`,
        body,
        failOnStatusCode: false,
      })
      .then((res) => ({
        res,
        email: body.email,
        password: body.password,
      }));
  });
});

Cypress.Commands.add('loginApi', (email, password) => {
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/login`,
    body: { email, password },
    failOnStatusCode: false,
  });
});
