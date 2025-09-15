describe('Delivery Fee Logic', () => {
  beforeEach(() => {
    cy.visit('/');
    // Add items to cart
    cy.get('[data-testid="add-to-cart"]').first().click();
    cy.get('[data-testid="open-cart"]').click();
    cy.get('button').contains('Proceed to Checkout').click();
    
    // Fill contact info
    cy.get('input[name="name"]').type('John Doe');
    cy.get('input[name="phone"]').type('0501234567');
    cy.get('input[name="email"]').type('john@example.com');
    cy.get('button').contains('Next').click();
  });

  describe('Delivery Fee Display', () => {
    it('should show ₪20 fee for Yad Binyamin delivery', () => {
      cy.get('input[value="DELIVERY"]').click();
      cy.get('input[name="city"]').type('Yad Binyamin');
      
      cy.contains('Delivery fee: ₪20').should('be.visible');
      cy.contains('(Yad Binyamin)').should('be.visible');
    });

    it('should show ₪0 fee for pickup', () => {
      cy.get('input[value="PICKUP"]').click();
      cy.contains('Pickup selected — Free').should('be.visible');
    });

    it('should update fee dynamically when switching methods', () => {
      // Start with delivery
      cy.get('input[value="DELIVERY"]').click();
      cy.get('input[name="city"]').type('Yad Binyamin');
      cy.contains('Delivery fee: ₪20').should('be.visible');
      
      // Switch to pickup
      cy.get('input[value="PICKUP"]').click();
      cy.contains('Pickup selected — Free').should('be.visible');
      cy.contains('Delivery fee: ₪20').should('not.exist');
      
      // Switch back to delivery
      cy.get('input[value="DELIVERY"]').click();
      cy.contains('Delivery fee: ₪20').should('be.visible');
    });

    it('should update fee when city changes', () => {
      cy.get('input[value="DELIVERY"]').click();
      
      // Type non-Yad Binyamin city
      cy.get('input[name="city"]').type('Tel Aviv');
      cy.contains('Delivery fee: ₪0').should('be.visible');
      
      // Clear and type Yad Binyamin
      cy.get('input[name="city"]').clear().type('Yad Binyamin');
      cy.contains('Delivery fee: ₪20').should('be.visible');
    });
  });

  describe('Order Summary Integration', () => {
    it('should include delivery fee in order summary', () => {
      cy.get('input[value="DELIVERY"]').click();
      cy.get('input[name="city"]').type('Yad Binyamin');
      cy.get('input[name="street"]').type('Main St 1');
      
      // Check order summary sidebar
      cy.get('.lg\\:col-span-1').first().within(() => {
        cy.contains('Delivery fee').should('be.visible');
        cy.contains('₪20').should('be.visible');
      });
    });

    it('should update total when delivery fee changes', () => {
      // Get initial total with pickup
      cy.get('input[value="PICKUP"]').click();
      cy.get('[data-testid="order-total"]').invoke('text').then((initialTotal) => {
        const initialAmount = parseFloat(initialTotal.replace('₪', ''));
        
        // Switch to delivery
        cy.get('input[value="DELIVERY"]').click();
        cy.get('input[name="city"]').type('Yad Binyamin');
        
        // Check new total
        cy.get('[data-testid="order-total"]').invoke('text').then((newTotal) => {
          const newAmount = parseFloat(newTotal.replace('₪', ''));
          expect(newAmount).to.equal(initialAmount + 20);
        });
      });
    });

    it('should not show delivery fee line for pickup', () => {
      cy.get('input[value="PICKUP"]').click();
      
      cy.get('.lg\\:col-span-1').first().within(() => {
        cy.contains('Delivery fee').should('not.exist');
      });
    });
  });

  describe('API Integration', () => {
    it('should send correct delivery fee to server for Yad Binyamin', () => {
      cy.intercept('POST', '/api/orders').as('createOrder');
      
      cy.get('input[value="DELIVERY"]').click();
      cy.get('input[name="city"]').type('Yad Binyamin');
      cy.get('input[name="street"]').type('Main St 1');
      cy.get('button').contains('Next').click();
      
      cy.get('input[value="CASH"]').click();
      cy.get('button').contains('Next').click();
      cy.get('button').contains('Place Order').click();
      
      cy.wait('@createOrder').then((interception) => {
        expect(interception.request.body).to.have.property('method', 'DELIVERY');
        expect(interception.request.body).to.have.property('city', 'Yad Binyamin');
        // Server should calculate and add delivery fee
      });
    });

    it('should send correct data for pickup orders', () => {
      cy.intercept('POST', '/api/orders').as('createOrder');
      
      cy.get('input[value="PICKUP"]').click();
      cy.get('button').contains('Next').click();
      
      cy.get('input[value="CASH"]').click();
      cy.get('button').contains('Next').click();
      cy.get('button').contains('Place Order').click();
      
      cy.wait('@createOrder').then((interception) => {
        expect(interception.request.body).to.have.property('method', 'PICKUP');
        // City/street should be empty or not required for pickup
      });
    });
  });

  describe('Order Confirmation Display', () => {
    it('should show delivery fee in order confirmation for Yad Binyamin delivery', () => {
      cy.get('input[value="DELIVERY"]').click();
      cy.get('input[name="city"]').type('Yad Binyamin');
      cy.get('input[name="street"]').type('Main St 1');
      cy.get('button').contains('Next').click();
      
      cy.get('input[value="CASH"]').click();
      cy.get('button').contains('Next').click();
      cy.get('button').contains('Place Order').click();
      
      // Should show delivery fee in order confirmation
      cy.url().should('include', '/order/');
      cy.contains('Delivery fee').should('be.visible');
      cy.contains('₪20.00').should('be.visible');
      
      // Total should include delivery fee
      cy.get('[data-testid="order-total"]').should('contain', '₪');
    });

    it('should not show delivery fee for pickup orders', () => {
      cy.get('input[value="PICKUP"]').click();
      cy.get('button').contains('Next').click();
      
      cy.get('input[value="CASH"]').click();
      cy.get('button').contains('Next').click();
      cy.get('button').contains('Place Order').click();
      
      // Should not show delivery fee
      cy.url().should('include', '/order/');
      cy.contains('Delivery fee').should('not.exist');
    });
  });

  describe('Edge Cases', () => {
    it('should handle case-insensitive city matching', () => {
      cy.get('input[value="DELIVERY"]').click();
      
      // Test various cases
      const cityVariations = ['yad binyamin', 'YAD BINYAMIN', 'Yad Binyamin', 'YaD BiNyAmIn'];
      
      cityVariations.forEach((city) => {
        cy.get('input[name="city"]').clear().type(city);
        cy.contains('Delivery fee: ₪20').should('be.visible');
      });
    });

    it('should handle city with extra whitespace', () => {
      cy.get('input[value="DELIVERY"]').click();
      cy.get('input[name="city"]').type('  Yad Binyamin  ');
      
      cy.contains('Delivery fee: ₪20').should('be.visible');
    });

    it('should not apply fee for similar but different city names', () => {
      cy.get('input[value="DELIVERY"]').click();
      
      const nonMatchingCities = ['Yad Benjamin', 'Yad Binyamin City', 'New Yad Binyamin'];
      
      nonMatchingCities.forEach((city) => {
        cy.get('input[name="city"]').clear().type(city);
        cy.contains('Delivery fee: ₪0').should('be.visible');
        cy.contains('Delivery not available').should('be.visible');
      });
    });
  });

  describe('Validation Integration', () => {
    it('should prevent proceeding with invalid delivery city', () => {
      cy.get('input[value="DELIVERY"]').click();
      cy.get('input[name="city"]').type('Tel Aviv');
      cy.get('input[name="street"]').type('Main St 1');
      cy.get('button').contains('Next').click();
      
      cy.contains('Delivery is only available in Yad Binyamin').should('be.visible');
      cy.get('input[name="city"]').should('have.class', 'border-red-500');
    });

    it('should allow proceeding with valid Yad Binyamin delivery', () => {
      cy.get('input[value="DELIVERY"]').click();
      cy.get('input[name="city"]').type('Yad Binyamin');
      cy.get('input[name="street"]').type('Main St 1');
      cy.get('button').contains('Next').click();
      
      // Should proceed to payment step
      cy.contains('Payment Method').should('be.visible');
    });

    it('should allow proceeding with pickup regardless of city', () => {
      cy.get('input[value="PICKUP"]').click();
      cy.get('button').contains('Next').click();
      
      // Should proceed to payment step even without city
      cy.contains('Payment Method').should('be.visible');
    });
  });
});
