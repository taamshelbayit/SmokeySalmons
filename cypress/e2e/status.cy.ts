/// <reference types="cypress" />

describe('Admin order status update', () => {
  it('places an order and updates status via admin API', () => {
    cy.viewport(1280, 900);

    // Place an order via new checkout flow
    cy.visit('/');
    cy.get('[data-testid="product-card-quarter"]').within(() => {
      cy.get('select[aria-label="Flavor"]').select('Black Pepper');
      cy.get('input[aria-label="Quantity"]').clear().type('1');
      cy.contains('button', 'Add').click();
    });

    // Proceed to checkout
    cy.get('[data-testid="open-cart"]').click();
    cy.contains('button', 'Proceed to Checkout').click();

    // Step 1: Contact
    cy.get('input[name="name"]').type('Status Test');
    cy.get('input[name="phone"]').type('0502222222');
    cy.get('input[name="email"]').type('status@example.com');
    cy.contains('button', 'Next').click();

    // Step 2: Pickup for simplicity
    cy.get('input[value="PICKUP"]').click();
    cy.contains('button', 'Next').click();

    // Step 3: Payment
    cy.get('input[value="CASH"]').click();
    cy.contains('button', 'Next').click();

    // Step 4: Review
    cy.contains('button', 'Place Order').click();

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
