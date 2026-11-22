export const AppActions = {
  login(email, password) {
    cy.get('#email').type(email);
    cy.get('#password').type(password);
    cy.get('#login-btn').click();
  },
};
