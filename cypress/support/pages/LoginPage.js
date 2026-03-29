class LoginPage {
  visit() {
    cy.visit('/login');
  }

  fillEmail(email) {
    cy.get('[data-testid="email"]').clear().type(email);
  }

  fillPassword(password) {
    cy.get('[data-testid="senha"]').clear().type(password, { log: false });
  }

  submit() {
    cy.get('[data-testid="entrar"]').click();
  }

  assertLoginFormVisible() {
    cy.get('h1.font-robot').should('contain', 'Login');
    cy.get('[data-testid="email"]').should('be.visible');
    cy.get('[data-testid="senha"]').should('be.visible');
    cy.get('[data-testid="entrar"]').should('be.visible');
    cy.get('[data-testid="cadastrar"]').should('contain', 'Cadastre-se');
  }

  assertInvalidCredentialsMessage() {
    cy.url().should('include', '/login');
    cy.contains('Email e/ou senha inválidos', { timeout: 15000 }).should(
      'be.visible',
    );
  }
}

module.exports = { LoginPage };
