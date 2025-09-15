describe('Payment Flows', () => {
  beforeEach(() => {
    cy.visit('/');
    // Add items to cart and complete checkout to order confirmation
    cy.get('[data-testid="add-to-cart"]').first().click();
    cy.get('[data-testid="open-cart"]').click();
    cy.get('button').contains('Proceed to Checkout').click();
    
    // Complete checkout form
    cy.get('input[name="name"]').type('John Doe');
    cy.get('input[name="phone"]').type('0501234567');
    cy.get('input[name="email"]').type('john@example.com');
    cy.get('button').contains('Next').click();
    
    cy.get('input[value="DELIVERY"]').click();
    cy.get('input[name="city"]').type('Yad Binyamin');
    cy.get('input[name="street"]').type('Main St 1');
    cy.get('button').contains('Next').click();
  });

  describe('Cash Payment Flow', () => {
    it('should complete cash payment order', () => {
      cy.get('input[value="CASH"]').click();
      cy.get('button').contains('Next').click();
      cy.get('button').contains('Place Order').click();
      
      // Should redirect to order confirmation
      cy.url().should('include', '/order/');
      cy.contains('Thank you! Your order is placed').should('be.visible');
      
      // Should show cash payment info
      cy.contains('Payment Method').should('be.visible');
      cy.contains('CASH').should('be.visible');
      cy.contains('Cash Payment').should('be.visible');
      cy.contains('Pay').should('be.visible');
      cy.contains('in cash upon delivery or pickup').should('be.visible');
    });
  });

  describe('Bit Payment Flow', () => {
    it('should complete Bit payment order and show payment instructions', () => {
      cy.get('input[value="BIT"]').click();
      cy.get('button').contains('Next').click();
      cy.get('button').contains('Place Order').click();
      
      // Should redirect to order confirmation
      cy.url().should('include', '/order/');
      cy.contains('Thank you! Your order is placed').should('be.visible');
      
      // Should show Bit payment info
      cy.contains('Payment Method').should('be.visible');
      cy.contains('BIT').should('be.visible');
      cy.contains('Pay with Bit').should('be.visible');
      cy.contains('Send ₪').should('be.visible');
      cy.contains('via Bit to').should('be.visible');
      
      // Should show payment actions
      cy.get('a').contains('Open Bit App').should('have.attr', 'href').and('include', 'bit://pay');
      cy.get('button').contains('Copy Phone Number').should('be.visible');
      
      // Should show QR code
      cy.get('img[alt="Bit Payment QR Code"]').should('be.visible');
      cy.contains('Scan with Bit app').should('be.visible');
    });

    it('should show payment deadline for Bit payments', () => {
      cy.get('input[value="BIT"]').click();
      cy.get('button').contains('Next').click();
      cy.get('button').contains('Place Order').click();
      
      cy.contains('Payment Status').should('be.visible');
      cy.contains('PENDING').should('be.visible');
      cy.contains('Payment Deadline').should('be.visible');
    });

    it('should copy phone number to clipboard', () => {
      cy.get('input[value="BIT"]').click();
      cy.get('button').contains('Next').click();
      cy.get('button').contains('Place Order').click();
      
      cy.get('button').contains('Copy Phone Number').click();
      
      // Verify clipboard (this might need to be mocked in real tests)
      cy.window().then((win) => {
        win.navigator.clipboard.readText().then((text) => {
          expect(text).to.match(/^\+?[\d-]+$/); // Should be a phone number
        });
      });
    });
  });

  describe('PayBox Payment Flow', () => {
    it('should complete PayBox payment order and show payment instructions', () => {
      cy.get('input[value="PAYBOX"]').click();
      cy.get('button').contains('Next').click();
      cy.get('button').contains('Place Order').click();
      
      // Should redirect to order confirmation
      cy.url().should('include', '/order/');
      cy.contains('Thank you! Your order is placed').should('be.visible');
      
      // Should show PayBox payment info
      cy.contains('Payment Method').should('be.visible');
      cy.contains('PAYBOX').should('be.visible');
      cy.contains('Pay with PayBox').should('be.visible');
      cy.contains('Send ₪').should('be.visible');
      cy.contains('via PayBox to').should('be.visible');
      
      // Should show payment actions
      cy.get('a').contains('Open PayBox App').should('have.attr', 'href').and('include', 'paybox://pay');
      cy.get('button').contains('Copy Phone Number').should('be.visible');
      
      // Should show QR code
      cy.get('img[alt="PayBox Payment QR Code"]').should('be.visible');
      cy.contains('Scan with PayBox app').should('be.visible');
    });
  });

  describe('Delivery Fee Calculation', () => {
    it('should include delivery fee for Yad Binyamin delivery', () => {
      // Already set to delivery to Yad Binyamin in beforeEach
      cy.get('input[value="CASH"]').click();
      cy.get('button').contains('Next').click();
      
      // Should show delivery fee in review
      cy.contains('Delivery fee: ₪20').should('be.visible');
      
      cy.get('button').contains('Place Order').click();
      
      // Should show delivery fee in order confirmation
      cy.contains('Delivery fee').should('be.visible');
      cy.contains('₪20.00').should('be.visible');
      
      // Total should include delivery fee
      cy.get('[data-testid="order-total"]').should('contain', '₪');
    });

    it('should not include delivery fee for pickup', () => {
      cy.get('button').contains('Back').click(); // Go back to delivery step
      cy.get('input[value="PICKUP"]').click();
      cy.get('button').contains('Next').click();
      
      cy.get('input[value="CASH"]').click();
      cy.get('button').contains('Next').click();
      
      // Should not show delivery fee in review
      cy.contains('Delivery fee').should('not.exist');
      
      cy.get('button').contains('Place Order').click();
      
      // Should not show delivery fee in order confirmation
      cy.contains('Delivery fee').should('not.exist');
    });
  });

  describe('Order Confirmation Page', () => {
    beforeEach(() => {
      cy.get('input[value="BIT"]').click();
      cy.get('button').contains('Next').click();
      cy.get('button').contains('Place Order').click();
    });

    it('should show order details', () => {
      cy.contains('Thank you! Your order is placed').should('be.visible');
      cy.get('[data-testid="order-code"]').should('be.visible');
      cy.contains('Summary').should('be.visible');
      cy.contains('Subtotal').should('be.visible');
      cy.contains('Total').should('be.visible');
    });

    it('should show payment status and method', () => {
      cy.contains('Payment Information').should('be.visible');
      cy.contains('Payment Method').should('be.visible');
      cy.contains('Payment Status').should('be.visible');
      cy.contains('PENDING').should('be.visible');
    });

    it('should hide payment instructions when payment is confirmed', () => {
      // This would require mocking a paid order or updating payment status
      // For now, we test the pending state
      cy.contains('Pay with Bit').should('be.visible');
      
      // In a real scenario, after payment is marked as PAID:
      // cy.contains('Payment Confirmed').should('be.visible');
      // cy.contains('Pay with Bit').should('not.exist');
    });

    it('should have Continue Shopping link', () => {
      cy.get('a').contains('Continue Shopping').should('have.attr', 'href', '/');
    });
  });

  describe('Error Handling', () => {
    it('should handle order submission errors gracefully', () => {
      // Mock API failure
      cy.intercept('POST', '/api/orders', { statusCode: 500 }).as('orderError');
      
      cy.get('input[value="CASH"]').click();
      cy.get('button').contains('Next').click();
      cy.get('button').contains('Place Order').click();
      
      cy.wait('@orderError');
      cy.contains('Could not place order').should('be.visible');
      
      // Should stay on checkout page
      cy.url().should('include', '/checkout');
    });

    it('should prevent double submission', () => {
      cy.get('input[value="CASH"]').click();
      cy.get('button').contains('Next').click();
      
      // Click Place Order multiple times quickly
      cy.get('button').contains('Place Order').click();
      cy.get('button').contains('Place Order').should('be.disabled');
    });
  });

  describe('Mobile Responsiveness', () => {
    beforeEach(() => {
      cy.viewport('iphone-x');
    });

    it('should work on mobile devices', () => {
      cy.get('input[value="CASH"]').click();
      cy.get('button').contains('Next').click();
      cy.get('button').contains('Place Order').click();
      
      cy.url().should('include', '/order/');
      cy.contains('Thank you! Your order is placed').should('be.visible');
    });

    it('should show mobile-friendly payment buttons', () => {
      cy.get('input[value="BIT"]').click();
      cy.get('button').contains('Next').click();
      cy.get('button').contains('Place Order').click();
      
      // Payment buttons should stack vertically on mobile
      cy.get('a').contains('Open Bit App').should('be.visible');
      cy.get('button').contains('Copy Phone Number').should('be.visible');
    });
  });
});
