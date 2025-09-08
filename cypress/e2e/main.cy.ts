/// <reference types="cypress" />

describe('Smokey Salmons E2E', () => {
  it('add to cart → checkout → admin sees order', () => {
    cy.viewport(1280, 900);
    cy.intercept('POST', '/api/orders').as('createOrder');

    cy.visit('/');

    // Add Quarter product to cart
    cy.get('[data-testid="product-card-quarter"]').within(() => {
        cy.get('select[aria-label="Flavor"]').select('Black Pepper');
        cy.get('input[aria-label="Quantity"]').clear().type('2');
        cy.contains('button', 'Add').click();
      });

    // Open cart via hash (CartDrawer listens to #cart)
    cy.window().then((win) => { win.location.hash = '#cart'; });
    cy.get('aside[aria-label="Shopping cart"]').should('be.visible');

    // Fill checkout form and submit
    cy.get('aside[aria-label="Shopping cart"]').within(() => {
      cy.get('input[name="name"]').scrollIntoView().type('Test User', { force: true });
      cy.get('input[name="phone"]').scrollIntoView().type('0500000000', { force: true });
      cy.get('input[name="email"]').scrollIntoView().type('test@example.com', { force: true });
      cy.get('select[name="deliverySlot"]').select('09:00-12:00', { force: true });
      cy.get('input[name="city"]').scrollIntoView().type('Tel Aviv', { force: true });
      cy.get('input[name="street"]').scrollIntoView().type('Herzl 1', { force: true });
      cy.get('input[name="apt"]').scrollIntoView().type('3', { force: true });
      cy.get('textarea[name="notes"]').scrollIntoView().type('Ring the bell', { force: true });
      cy.contains('button', 'Place Order').scrollIntoView().click({ force: true });
    });

    // Redirect landed
    cy.location('pathname').should('match', /\/order\//);
    cy.contains('Thank you! Your order is placed.');
    cy.contains('Order code:');

    // Admin sees order (bypass auth via cookie for E2E)
    cy.setCookie('e2e_admin', '1');
    cy.visit('/admin/orders');
    cy.contains('h2', 'Orders');
    cy.contains('table', 'Test User');
    cy.contains('table', '0500000000');
  });
});
