class ClientHomePage {
  assertClientHomeUrl() {
    cy.url({ timeout: 20000 }).should('include', '/home');
  }

  assertLoggedInProductArea() {
    cy.get('[data-testid="pesquisar"]', { timeout: 20000 }).should('be.visible');
    cy.contains('Produtos').should('be.visible');
  }

  searchByTerm(term) {
    cy.get('[data-testid="pesquisar"]').clear().type(term);
    cy.get('[data-testid="botaoPesquisar"]').click();
  }

  assertProductVisibleInList(name) {
    cy.contains(name, { timeout: 15000 }).should('be.visible');
  }
}

module.exports = { ClientHomePage };
