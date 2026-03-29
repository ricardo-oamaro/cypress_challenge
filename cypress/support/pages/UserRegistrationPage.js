class UserRegistrationPage {
  visit() {
    cy.visit('/cadastrarusuarios');
  }

  fillName(name) {
    cy.get('[data-testid="nome"]').clear().type(name);
  }

  fillEmail(email) {
    cy.get('[data-testid="email"]').clear().type(email);
  }

  fillPassword(password) {
    cy.get('[data-testid="password"]').clear().type(password, { log: false });
  }

  submit() {
    cy.get('[data-testid="cadastrar"]').click();
  }

  assertRegistrationSuccess() {
    cy.contains('Cadastro realizado com sucesso', { timeout: 20000 }).should(
      'be.visible',
    );
  }
}

module.exports = { UserRegistrationPage };
