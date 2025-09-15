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

    // Open cart and proceed to checkout
    cy.get('[data-testid="open-cart"]').click();
    cy.contains('button', 'Proceed to Checkout').click();

    // Step 1: Contact
    cy.get('input[name="name"]').type('Test User');
    cy.get('input[name="phone"]').type('0500000000');
    cy.get('input[name="email"]').type('test@example.com');
    cy.contains('button', 'Next').click();

    // Step 2: Delivery (use Pickup for simplicity)
    cy.get('input[value="PICKUP"]').click();
    cy.contains('button', 'Next').click();

    // Step 3: Payment
    cy.get('input[value="CASH"]').click();
    cy.contains('button', 'Next').click();

    // Step 4: Review
    cy.contains('button', 'Place Order').click();

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
