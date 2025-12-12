// Tests/utils.js
// MUST import mocks BEFORE importing the app so mocked modules are used by controllers
const mocks = require('./mocks'); // make sure Tests/mocks.js exists and exported mocks
const request = require('supertest');

// require the app AFTER mocks are loaded
const app = require('../index'); // adjust if your index.js is elsewhere

/**
 * createUserAndLogin
 * - Calls /user/signUp then /user/login (controllers use mocked models)
 * - Ensures signupmodel.findOne returns a user for login
 * - Ensures jsonwebtoken.verify will accept the token used in tests
 */
async function createUserAndLogin(overrides = {}) {
  const payload = Object.assign({
    fName: 'Test',
    lName: 'User',
    mail: 'test.user@example.com',
    phone: '9999999990',
    password: 'password',
    userName: 'testuser',
    dob: '1990-01-01',
    gender: 'Other',
    e1: 'CSE'
  }, overrides);

  // 1) Call signup (controllers use mocked models)
  await request(app).post('/user/signUp').send(payload);

  // 2) Make signupmodel.findOne behave like a real user lookup for the login step
  // Return a user that matches the payload so login controller doesn't throw
  mocks.signupmodel.findOne = jest.fn(async (q) => {
    // return an object resembling a saved user; include password for login check
    return {
      _id: 'mockUserId',
      userName: payload.userName,
      password: payload.password,
      profilePicture: '1',
      firstName: payload.fName,
      lastName: payload.lName,
      email: payload.mail
    };
  });

  // 3) Prepare jwt mock so protected endpoints will accept 'valid-user-token'
  const jsonwebtoken = require('jsonwebtoken');
  // Ensure next verify call used in middleware returns decoded id
  jsonwebtoken.verify.mockImplementationOnce((token) => {
    if (token === 'valid-user-token') return { id: 'mockUserId' };
    if (token === 'valid-temp-token') return { id: 'mockTempId' };
    throw new Error('invalid token');
  });

  // 4) Call login
  const loginRes = await request(app).post('/user/login').send({ userName: payload.userName, password: payload.password });

  // 5) Return token that tests should use for protected endpoints.
  // We'll standardize on 'valid-user-token' in tests so jwt.verify mock accepts it.
  return { token: 'valid-user-token', user: loginRes.body || {} };
}

module.exports = {
  request,
  app,
  mocks,
  createUserAndLogin
};
