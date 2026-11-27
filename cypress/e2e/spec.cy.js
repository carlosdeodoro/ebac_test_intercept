import { AppActions } from '../support/AppActions';

describe('Login com intercept', () => {
  it('Prepara a sessão e abre o dashboard sem usar a interface', () => {
    cy.env(['loginEmail', 'loginPassword']).then(({ loginEmail, loginPassword }) => {
      AppActions.login(loginEmail, loginPassword).then((user) => {
        cy.location('pathname').should('eq', '/dashboard.html');
        cy.get('body').should('contain', user.name);
        cy.window()
          .its('localStorage')
          .invoke('getItem', 'user')
          .should('eq', JSON.stringify(user));
      });
    });
  });

  it('Intercepta o login bem-sucedido pela interface', () => {
    cy.visit('/login.html');
    cy.env(['loginEmail', 'loginPassword']).then(({ loginEmail, loginPassword }) => {
      cy.intercept('POST', '/api/login', {
        statusCode: 200,
        body: {
          token: 'token-de-teste',
          id: 1,
          name: 'Usuário de teste',
          isAdmin: false,
        },
      }).as('login');
      cy.clock();
      cy.get('#email').type(loginEmail);
      cy.get('#password').type(loginPassword);
      cy.get('#login-btn').click();

      cy.wait('@login')
        .its('request.body')
        .should('deep.equal', { email: loginEmail, password: loginPassword });

      cy.get('#alert-container')
        .should('be.visible')
        .and('contain', 'Login realizado com sucesso!');
    });
  });

  it('Exibe erro para credenciais inválidas', () => {
    cy.visit('/login.html');
    cy.env(['loginEmail']).then(({ loginEmail }) => {
      cy.intercept('POST', '/api/login', {
        statusCode: 401,
        body: { message: 'Credenciais inválidas' },
      }).as('login');
      cy.get('#email').type(loginEmail);
      cy.get('#password').type('senha-invalida');
      cy.get('#login-btn').click();

      cy.wait('@login')
        .its('request.body')
        .should('deep.equal', { email: loginEmail, password: 'senha-invalida' });

      cy.get('#alert-container')
        .should('be.visible')
        .and('have.class', 'alert-danger')
        .and('contain', 'Credenciais inválidas');
    });
  });
});