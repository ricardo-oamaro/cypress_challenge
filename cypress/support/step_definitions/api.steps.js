const { Given, When, Then } = require('@badeball/cypress-cucumber-preprocessor');

const apiUrl = () => Cypress.env('apiUrl');

When('I send a user registration with a unique email to the API', () => {
  cy.fixture('user').then((userFixture) => {
    cy.registerUserApi({
      email: `api_${Date.now()}@qa.com`,
      name: userFixture.names.apiRegister,
    }).then(({ res }) => {
      cy.wrap(res).as('registrationResponse');
    });
  });
});

Then('the API should respond 201 with registration success message', () => {
  cy.get('@registrationResponse').then((res) => {
    expect(res.status).to.eq(201);
    expect(res.body).to.have.property('message', 'Cadastro realizado com sucesso');
    expect(res.body).to.have.property('_id');
  });
});

Given('a user exists for API testing', () => {
  cy.fixture('user').then((userFixture) => {
    cy.registerUserApi({
      email: `login_${Date.now()}@qa.com`,
      name: userFixture.names.apiLogin,
    }).then(({ res, email, password }) => {
      expect(res.status).to.eq(201);
      cy.wrap({ email, password }).as('apiTestUser');
    });
  });
});

When('I send login with correct email and password', () => {
  cy.get('@apiTestUser').then(({ email, password }) => {
    cy.loginApi(email, password).as('loginResponse');
  });
});

Then('the API should respond 200 with login message and Bearer token', () => {
  cy.get('@loginResponse').then((res) => {
    expect(res.status).to.eq(200);
    expect(res.body.message).to.eq('Login realizado com sucesso');
    expect(res.body.authorization).to.be.a('string').and.match(/^Bearer\s+\S+/);
  });
});

When('I request the product listing from the API', () => {
  cy.request({
    method: 'GET',
    url: `${apiUrl()}/produtos`,
  }).as('productsResponse');
});

Then('the response should include quantity and a products array', () => {
  cy.get('@productsResponse').then((res) => {
    expect(res.status).to.eq(200);
    expect(res.body).to.have.property('quantidade');
    expect(res.body.quantidade).to.be.a('number');
    expect(res.body).to.have.property('produtos');
    expect(res.body.produtos).to.be.an('array');
    expect(res.body.produtos.length).to.be.greaterThan(0);
  });
});

Given('an email was already registered in the API', () => {
  cy.fixture('user').then((userFixture) => {
    const email = `dup_${Date.now()}@qa.com`;
    cy.wrap(email).as('duplicateEmail');
    cy.registerUserApi({ email, name: userFixture.names.apiRegister }).then(({ res }) => {
      expect(res.status).to.eq(201);
    });
  });
});

When('I try to register another user with the same email', () => {
  cy.get('@duplicateEmail').then((email) => {
    cy.fixture('user').then((userFixture) => {
      cy.registerUserApi({ email, name: userFixture.names.apiRegister }).then(({ res }) => {
        cy.wrap(res).as('duplicateRegistrationResponse');
      });
    });
  });
});

Then('the API should respond 400 indicating the email is in use', () => {
  cy.get('@duplicateRegistrationResponse').then((res) => {
    expect(res.status).to.eq(400);
    expect(res.body.message).to.eq('Este email já está sendo usado');
  });
});

When('I send API login with incorrect password', () => {
  cy.get('@apiTestUser').then(({ email }) => {
    cy.loginApi(email, 'WrongPassword!999').as('loginErrorResponse');
  });
});

Then('the API should respond 401 with invalid credentials message', () => {
  cy.get('@loginErrorResponse').then((res) => {
    expect(res.status).to.eq(401);
    expect(res.body.message).to.eq('Email e/ou senha inválidos');
  });
});

When('I register a user and fetch by ID from the API', () => {
  cy.fixture('user').then((userFixture) => {
    const email = `get_${Date.now()}@qa.com`;
    cy.registerUserApi({ email, name: userFixture.names.apiRegister }).then(
      ({ res, email: registeredEmail }) => {
        expect(res.status).to.eq(201);
        const id = res.body._id;
        cy.wrap({
          expectedName: userFixture.names.apiRegister,
          expectedEmail: registeredEmail,
        }).as('expectedUser');
        cy.request('GET', `${apiUrl()}/usuarios/${id}`).as('userByIdResponse');
      },
    );
  });
});

Then('the API should return the same email and name as registered', () => {
  cy.get('@expectedUser').then((expected) => {
    cy.get('@userByIdResponse').then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.email).to.eq(expected.expectedEmail);
      expect(res.body.nome).to.eq(expected.expectedName);
    });
  });
});
