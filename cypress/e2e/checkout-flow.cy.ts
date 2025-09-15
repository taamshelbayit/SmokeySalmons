describe('Checkout Flow', () => {
  beforeEach(() => {
    cy.visit('/');
    // Add items to cart
    cy.get('[data-testid="add-to-cart"]').first().click();
    cy.get('[data-testid="open-cart"]').click();
    cy.get('button').contains('Proceed to Checkout').click();
  });

  describe('Stepper Navigation', () => {
    it('should show progress stepper with 4 steps', () => {
      cy.get('[data-testid="stepper"]').should('exist');
      cy.get('[data-testid="step-1"]').should('contain', 'Contact');
      cy.get('[data-testid="step-2"]').should('contain', 'Delivery');
      cy.get('[data-testid="step-3"]').should('contain', 'Payment');
      cy.get('[data-testid="step-4"]').should('contain', 'Review');
    });

    it('should start on step 1', () => {
      cy.get('[data-testid="step-1"]').should('have.class', 'bg-salmon-500');
      cy.get('h2').should('contain', 'Contact Information');
    });

    it('should navigate between steps with Next/Back buttons', () => {
      // Fill contact info
      cy.get('input[name="name"]').type('John Doe');
      cy.get('input[name="phone"]').type('0501234567');
      cy.get('input[name="email"]').type('john@example.com');
      
      // Go to step 2
      cy.get('button').contains('Next').click();
      cy.get('h2').should('contain', 'Delivery or Pickup');
      
      // Go back to step 1
      cy.get('button').contains('Back').click();
      cy.get('h2').should('contain', 'Contact Information');
      
      // Values should be preserved
      cy.get('input[name="name"]').should('have.value', 'John Doe');
    });
  });

  describe('Contact Information Step', () => {
    it('should validate required fields', () => {
      cy.get('button').contains('Next').click();
      
      cy.get('input[name="name"]').should('have.class', 'border-red-500');
      cy.contains('Name is required').should('be.visible');
      
      cy.get('input[name="phone"]').should('have.class', 'border-red-500');
      cy.contains('Phone is required').should('be.visible');
      
      cy.get('input[name="email"]').should('have.class', 'border-red-500');
      cy.contains('Email is required').should('be.visible');
    });

    it('should validate email format', () => {
      cy.get('input[name="name"]').type('John Doe');
      cy.get('input[name="phone"]').type('0501234567');
      cy.get('input[name="email"]').type('invalid-email');
      
      cy.get('button').contains('Next').click();
      cy.contains('Please enter a valid email').should('be.visible');
    });

    it('should validate minimum lengths', () => {
      cy.get('input[name="name"]').type('J');
      cy.get('input[name="phone"]').type('123');
      cy.get('input[name="email"]').type('j@e.co');
      
      cy.get('button').contains('Next').click();
      cy.contains('Name must be at least 2 characters').should('be.visible');
      cy.contains('Phone must be at least 5 characters').should('be.visible');
    });

    it('should save contact info when remember checkbox is checked', () => {
      cy.get('input[name="name"]').type('John Doe');
      cy.get('input[name="phone"]').type('0501234567');
      cy.get('input[name="email"]').type('john@example.com');
      cy.get('input[type="checkbox"]').check();
      
      cy.get('button').contains('Next').click();
      
      // Reload page and check if info is restored
      cy.reload();
      cy.get('input[name="name"]').should('have.value', 'John Doe');
      cy.get('input[name="phone"]').should('have.value', '0501234567');
      cy.get('input[name="email"]').should('have.value', 'john@example.com');
      cy.get('input[type="checkbox"]').should('be.checked');
    });
  });

  describe('Delivery Information Step', () => {
    beforeEach(() => {
      // Fill contact info and go to step 2
      cy.get('input[name="name"]').type('John Doe');
      cy.get('input[name="phone"]').type('0501234567');
      cy.get('input[name="email"]').type('john@example.com');
      cy.get('button').contains('Next').click();
    });

    it('should show delivery and pickup options', () => {
      cy.get('input[value="DELIVERY"]').should('exist');
      cy.get('input[value="PICKUP"]').should('exist');
      cy.contains('Delivery in Yad Binyamin (₪20)').should('be.visible');
      cy.contains('Collection from Yad Binyamin (Free)').should('be.visible');
    });

    it('should disable address fields when pickup is selected', () => {
      cy.get('input[value="PICKUP"]').click();
      cy.get('input[name="city"]').should('be.disabled');
      cy.get('input[name="street"]').should('be.disabled');
      cy.get('input[name="apt"]').should('be.disabled');
    });

    it('should show warning for non-Yad Binyamin delivery', () => {
      cy.get('input[value="DELIVERY"]').click();
      cy.get('input[name="city"]').type('Tel Aviv');
      
      cy.contains('Delivery not available').should('be.visible');
      cy.contains('We currently only deliver to Yad Binyamin').should('be.visible');
    });

    it('should validate required fields for delivery', () => {
      cy.get('input[value="DELIVERY"]').click();
      cy.get('button').contains('Next').click();
      
      cy.contains('City is required for delivery').should('be.visible');
      cy.contains('Street address is required for delivery').should('be.visible');
    });

    it('should validate Yad Binyamin city for delivery', () => {
      cy.get('input[value="DELIVERY"]').click();
      cy.get('input[name="city"]').type('Tel Aviv');
      cy.get('input[name="street"]').type('Main St 1');
      cy.get('button').contains('Next').click();
      
      cy.contains('Delivery is only available in Yad Binyamin').should('be.visible');
    });

    it('should show correct delivery fee', () => {
      cy.get('input[value="DELIVERY"]').click();
      cy.get('input[name="city"]').type('Yad Binyamin');
      
      cy.contains('Delivery fee: ₪20').should('be.visible');
      
      cy.get('input[value="PICKUP"]').click();
      cy.contains('Pickup selected — Free').should('be.visible');
    });
  });

  describe('Payment Method Step', () => {
    beforeEach(() => {
      // Fill contact and delivery info, go to step 3
      cy.get('input[name="name"]').type('John Doe');
      cy.get('input[name="phone"]').type('0501234567');
      cy.get('input[name="email"]').type('john@example.com');
      cy.get('button').contains('Next').click();
      
      cy.get('input[value="PICKUP"]').click();
      cy.get('button').contains('Next').click();
    });

    it('should show payment method options', () => {
      cy.get('input[value="CASH"]').should('exist');
      cy.get('input[value="BIT"]').should('exist');
      cy.get('input[value="PAYBOX"]').should('exist');
      cy.contains('Cash').should('be.visible');
      cy.contains('Bit').should('be.visible');
      cy.contains('PayBox').should('be.visible');
    });

    it('should validate payment method selection', () => {
      cy.get('button').contains('Next').click();
      cy.contains('Please select a payment method').should('be.visible');
    });

    it('should show Bit instructions when selected', () => {
      cy.get('input[value="BIT"]').click();
      cy.contains('After placing your order, send').should('be.visible');
      cy.contains('via Bit to').should('be.visible');
      cy.get('button').contains('Copy phone').should('be.visible');
    });

    it('should show PayBox instructions when selected', () => {
      cy.get('input[value="PAYBOX"]').click();
      cy.contains('After placing your order, send').should('be.visible');
      cy.contains('via PayBox to').should('be.visible');
      cy.get('button').contains('Copy phone').should('be.visible');
    });
  });

  describe('Review Step', () => {
    beforeEach(() => {
      // Complete all steps to reach review
      cy.get('input[name="name"]').type('John Doe');
      cy.get('input[name="phone"]').type('0501234567');
      cy.get('input[name="email"]').type('john@example.com');
      cy.get('button').contains('Next').click();
      
      cy.get('input[value="DELIVERY"]').click();
      cy.get('input[name="city"]').type('Yad Binyamin');
      cy.get('input[name="street"]').type('Main St 1');
      cy.get('select[name="deliverySlot"]').select('09:00-12:00');
      cy.get('textarea[name="notes"]').type('Ring the bell');
      cy.get('button').contains('Next').click();
      
      cy.get('input[value="BIT"]').click();
      cy.get('button').contains('Next').click();
    });

    it('should show order review details', () => {
      cy.contains('Review Your Order').should('be.visible');
      cy.contains('Contact: John Doe (0501234567) - john@example.com').should('be.visible');
      cy.contains('Method: Delivery to Yad Binyamin, Main St 1').should('be.visible');
      cy.contains('(09:00-12:00)').should('be.visible');
      cy.contains('Payment: BIT').should('be.visible');
      cy.contains('Notes: Ring the bell').should('be.visible');
    });

    it('should show Place Order button with total', () => {
      cy.get('button').contains('Place Order').should('be.visible');
      cy.get('button').contains('₪').should('be.visible'); // Should show total amount
    });
  });

  describe('Order Summary Sidebar', () => {
    it('should show cart items and totals', () => {
      cy.get('h2').contains('Order Summary').should('be.visible');
      cy.get('[data-testid="cart-item"]').should('have.length.at.least', 1);
      cy.contains('Subtotal').should('be.visible');
      cy.contains('Total').should('be.visible');
    });

    it('should update delivery fee when method changes', () => {
      // Fill contact info and go to delivery step
      cy.get('input[name="name"]').type('John Doe');
      cy.get('input[name="phone"]').type('0501234567');
      cy.get('input[name="email"]').type('john@example.com');
      cy.get('button').contains('Next').click();
      
      // Select delivery
      cy.get('input[value="DELIVERY"]').click();
      cy.get('input[name="city"]').type('Yad Binyamin');
      
      // Should show delivery fee in summary
      cy.contains('Delivery fee').should('be.visible');
      cy.contains('₪20').should('be.visible');
      
      // Switch to pickup
      cy.get('input[value="PICKUP"]').click();
      
      // Delivery fee should disappear from summary
      cy.contains('Delivery fee').should('not.exist');
    });
  });

  describe('Promo Code', () => {
    it('should apply valid promo code', () => {
      cy.get('input[placeholder="Enter promo code"]').type('TEST10');
      cy.get('button').contains('Apply').click();
      
      // Assuming TEST10 gives 10% discount
      cy.contains('Discount (TEST10)').should('be.visible');
    });

    it('should handle invalid promo code', () => {
      cy.get('input[placeholder="Enter promo code"]').type('INVALID');
      cy.get('button').contains('Apply').click();
      
      cy.on('window:alert', (text) => {
        expect(text).to.contains('Invalid or expired promotion code');
      });
    });
  });
});
