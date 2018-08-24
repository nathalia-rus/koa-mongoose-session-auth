const expect = require('chai').expect;
const bcrypt = require('bcrypt');
const supertest = require('supertest');
const server = require('./utils/server');
const User = require('./utils/user');

describe('Auth controller', () => {
  after(() => {
    return server.close();
  });

  beforeEach(async () => {
    let hash = await bcrypt.hash('testpassword', 10);
    await User.create({
      email: 'testuser@test.com',
      password: hash,
    });
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  it('can authenticate a user', async () => {
    let request = supertest.agent(server);
    const response = await request.post('/login').send({
      email: 'testuser@test.com',
      password: 'testpassword',
    });
    const response2 = await request.get('/protected');

    expect(response.status).to.equal(200);
    expect(response2.status).to.equal(200);
    expect(response2.text).to.equal('Authenticated route');
  });

  it('can logout a user', async () => {
    let request = supertest.agent(server);
    const response = await request.post('/login').send({
      email: 'testuser@test.com',
      password: 'testpassword',
    });
    const response2 = await request.get('/protected');
    const response3 = await request.post('/logout');
    const response4 = await request.get('/protected');

    expect(response.status).to.equal(200);
    expect(response2.status).to.equal(200);
    expect(response2.text).to.equal('Authenticated route');
    expect(response3.status).to.equal(200);
    expect(response4.status).to.equal(401);
  });

  it('can register a new user', async () => {
    let request = supertest.agent(server);
    const response = await request.post('/register').send({
      email: 'testuser2@test.com',
      password: 'testpassword',
      firstName: 'Test',
      lastName: 'User',
    });

    expect(response.status).to.equal(200);
    expect(response.body.firstName).to.equal('Test');
    expect(response.body.lastName).to.equal('User');
    expect(response.body.email).to.equal('testuser2@test.com');
    expect(response.body.password).to.equal(undefined);
  });

  it('can register a new user and log in', async () => {
    let request = supertest.agent(server);
    const response = await request.post('/register').send({
      email: 'testuser2@test.com',
      password: 'testpassword',
      firstName: 'Test',
      lastName: 'User',
    });
    const response2 = await request.post('/login').send({
      email: 'testuser2@test.com',
      password: 'testpassword',
    });
    const response3 = await request.get('/protected');

    expect(response.status).to.equal(200);
    expect(response2.status).to.equal(200);
    expect(response3.status).to.equal(200);
  });
});
