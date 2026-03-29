class AdminHomePage {
  assertAdminHomeUrl() {
    cy.url({ timeout: 20000 }).should('include', '/admin/home');
  }

  assertAdminPanelVisible() {
    cy.contains('Bem Vindo', { timeout: 20000 }).should('be.visible');
    cy.get('[data-testid="listar-produtos"]', { timeout: 20000 }).should(
      'be.visible',
    );
  }
}

module.exports = { AdminHomePage };
