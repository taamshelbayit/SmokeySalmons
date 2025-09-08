/// <reference types="cypress" />

// This spec verifies promotion creation (admin API with E2E bypass)
// and client-side validation/application inside the cart.

describe('Promotions flow', () => {
  it('creates a promo and applies it in cart', () => {
    const code = `SAVE10`;

    // Create promotion via admin API (E2E bypass cookie)
    cy.request({
      method: 'POST',
      url: '/api/admin/promotions',
      headers: { Cookie: 'e2e_admin=1' },
      body: {
        code,
        type: 'PERCENTAGE',
        value: 10,
        startsAt: null,
        endsAt: null,
        active: true,
      },
    }).its('status').should('eq', 200);

    // Go to homepage and add a product
    cy.visit('/');
    cy.get('[data-testid="product-card-quarter"]').within(() => {
      cy.get('select[aria-label="Flavor"]').select('Black Pepper');
      cy.get('input[aria-label="Quantity"]').clear().type('2');
      cy.contains('button', 'Add').click();
    });

    // Open cart via hash and apply promo
    cy.window().then((win) => { win.location.hash = '#cart'; });
    cy.get('aside[aria-label="Shopping cart"]').should('be.visible');

    // Enter and apply promo
    cy.intercept('POST', '/api/promotions/validate').as('validate');
    cy.get('input[aria-label="Promotion code"]').type(code);
    cy.contains('button', 'Apply').click();

    // Wait for validation and assert valid response
    cy.wait('@validate').its('response.statusCode').should('eq', 200);
    cy.wait('@validate').its('response.body.valid').should('eq', true);
    
    // Expect a discount row
    cy.contains('Discount (SAVE10)', { timeout: 5000 });
  });
});
