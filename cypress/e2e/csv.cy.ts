/// <reference types="cypress" />

// Places an order via UI, then downloads CSV via admin API using e2e cookie
// and verifies headers and that the order appears in the CSV.

describe('CSV export', () => {
  it('places an order and verifies it appears in CSV export', () => {
    cy.viewport(1280, 900);

    // Create order via UI
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
    cy.get('input[name="name"]').type('CSV Test User');
    cy.get('input[name="phone"]').type('0501111111');
    cy.get('input[name="email"]').type('csv@example.com');
    cy.contains('button', 'Next').click();

    // Step 2: Delivery - use pickup for simplicity
    cy.get('input[value="PICKUP"]').click();
    cy.get('select[name="deliverySlot"]').select('09:00-12:00');
    cy.contains('button', 'Next').click();

    // Step 3: Payment
    cy.get('input[value="CASH"]').click();
    cy.contains('button', 'Next').click();

    // Step 4: Review
    cy.contains('button', 'Place Order').click();

    // Confirm page and extract order code
    cy.location('pathname').should('match', /\/order\//);
    cy.contains('Order code:').invoke('text').then((txt) => {
      // Extract the code from: "Order code: ABC123"
      const code = txt.replace('Order code:', '').trim();

      // Request CSV with e2e admin bypass cookie
      cy.request({
        method: 'GET',
        url: '/api/admin/orders.csv',
        headers: { Cookie: 'e2e_admin=1' },
      }).then((resp) => {
        expect(resp.status).to.eq(200);
        const csv = resp.body as string;
        // Validate CSV header contains key columns
        expect(csv.split('\n')[0]).to.contain('placedAt,code,status,contactName,contactPhone,contactEmail,city,street,apt,deliverySlot,total,items');
        // Ensure our order code and phone appear in CSV lines
        expect(csv).to.contain(code);
        expect(csv).to.contain('0501111111');
      });
    });
  });
});
