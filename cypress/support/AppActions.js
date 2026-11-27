export const AppActions = {
  login(email, password) {
    return cy.request('POST', '/api/login', { email, password }).then(({ body }) =>
      cy.visit('/dashboard.html', {
        onBeforeLoad(window) {
          window.localStorage.setItem('user', JSON.stringify(body));
        },
      }).then(() => body),
    );
  },
};
