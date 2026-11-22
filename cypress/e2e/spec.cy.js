import { AppActions } from '../support/AppActions';

describe('Login com intercept', () => {
  beforeEach(() => {
    cy.visit('/login.html');
  });

  it('Faz login com sucesso', () => {
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
      AppActions.login(loginEmail, loginPassword);

      cy.wait('@login')
        .its('request.body')
        .should('deep.equal', { email: loginEmail, password: loginPassword });

      cy.get('#alert-container')
        .should('be.visible')
        .and('contain', 'Login realizado com sucesso!');
    });
  });

  it('Exibe erro para credenciais inválidas', () => {
    cy.env(['loginEmail']).then(({ loginEmail }) => {
      cy.intercept('POST', '/api/login', {
        statusCode: 401,
        body: { message: 'Credenciais inválidas' },
      }).as('login');
      AppActions.login(loginEmail, 'senha-invalida');

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