/// <reference types="cypress" />

describe('Admin order status update', () => {
  it('places an order and updates status via admin API', () => {
    cy.viewport(1280, 900);

    // Place an order via UI
    cy.visit('/');
    cy.get('[data-testid="product-card-quarter"]').within(() => {
      cy.get('select[aria-label="Flavor"]').select('Black Pepper');
      cy.get('input[aria-label="Quantity"]').clear().type('1');
      cy.contains('button', 'Add').click();
    });

    cy.window().then((win) => { win.location.hash = '#cart'; });
    cy.get('aside[aria-label="Shopping cart"]').should('be.visible').within(() => {
      cy.get('input[name="name"]').type('Status Test', { force: true });
      cy.get('input[name="phone"]').type('0502222222', { force: true });
      cy.get('select[name="deliverySlot"]').select('09:00-12:00', { force: true });
      cy.contains('button', 'Place Order').click({ force: true });
    });

    // Extract order id from URL /order/[id]
    cy.location('pathname').should('match', /\/order\//).then((path) => {
      const id = path.split('/').pop() as string;

      // Update status via admin API with e2e cookie bypass
      cy.request({
        method: 'PATCH',
        url: `/api/admin/orders/${id}/status`,
        headers: { Cookie: 'e2e_admin=1' },
        body: { status: 'CONFIRMED' },
      }).its('status').should('eq', 200);

      // Verify in admin orders page
      cy.setCookie('e2e_admin', '1');
      cy.visit('/admin/orders');
      cy.contains('table', 'Status Test');
      cy.contains('table', 'CONFIRMED');
    });
  });
});
