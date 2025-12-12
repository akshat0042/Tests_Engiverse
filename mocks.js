// mocks.js // Tests/mocks.js
'use strict';

// --- Global Constants for Mock IDs ---
// Use a 24-character hex string for the ID to satisfy Mongoose ObjectId casting
const MOCK_USER_OBJECT_ID = '60b8d5a5f8a0c201d4a0b2c1'; 
const MOCK_ADMIN_OBJECT_ID = '60b8d5a5f8a0c201d4a0b2c2'; 
const MOCK_TEMP_ID = 'mockTempId'; // Assuming temporary IDs might not be ObjectIds

/*
  Safe jsonwebtoken mock (factory must NOT reference outer-scope variables).
  Tests can require('./mocks').__jwtMock to access and change behavior.
*/
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn((token, secret) => {
    // FIXED: Using MOCK_USER_OBJECT_ID instead of 'mockUserId'
    if (token === 'valid-user-token') return { id: MOCK_USER_OBJECT_ID };
    if (token === 'valid-temp-token') return { id: MOCK_TEMP_ID };
    if (token === 'valid-admin-token') return { id: MOCK_ADMIN_OBJECT_ID, isAdmin: true };
    if (token === 'valid-token') return { id: MOCK_USER_OBJECT_ID };
    throw new Error('invalid token');
  }),
  sign: jest.fn((payload) => 'signed-test-token')
}), { virtual: true });

// export the mocked jsonwebtoken so tests can mutate it at runtime
const __jwtMock = require('jsonwebtoken');

// --- Helpers for Mongoose-like mocks ---
// returns a chainable query-like object
const mockQuery = (result) => ({
  exec: jest.fn(async () => result),
  populate: jest.fn(function () { return this; }),
  select: jest.fn(function () { return this; }),
  sort: jest.fn(function () { return this; }),
  lean: jest.fn(function () { return this; }),
  then: jest.fn(function (resolve) { return Promise.resolve(result).then(resolve); }),
});

// Build a mock "Model" that works both as constructor (new Model(data)) and has static methods
function makeMockModel(staticMethods = {}, instanceMethods = {}) {
  // Constructor function that returns a plain object to avoid mongoose casting
  function Model(data = {}) {
    if (!(this instanceof Model)) {
      // allow calling without new
      return new Model(data);
    }
    // copy properties into plain object instance
    Object.assign(this, data);
    // attach instance methods
    Object.keys(instanceMethods).forEach(k => {
      this[k] = instanceMethods[k];
    });
    // toJSON / toObject convenience (if controllers call these)
    this.toObject = () => ({ ...this });
    return this;
  }

  // Attach static methods:
  Object.keys(staticMethods).forEach(key => {
    const fn = staticMethods[key];
    if (['find', 'findOne', 'findById', 'findByIdAndUpdate'].includes(key)) {
      if (fn.constructor.name !== 'AsyncFunction') {
        Model[key] = jest.fn((...args) => mockQuery(fn(...args)));
      } else {
        Model[key] = jest.fn(async (...args) => {
          const res = await fn(...args);
          return mockQuery(res);
        });
      }
    } else {
      Model[key] = fn;
    }
  });

  return Model;
}

// --- Default behaviours for each mocked Model ---

const signupStatic = {
  findOne: jest.fn(() => null),
  // Updated hardcoded ID to be an ObjectId
  findById: jest.fn(async (id) => ({ _id: id, firstName: 'Mock', profilePicture: '1' })),
  findByIdAndUpdate: jest.fn(async (id, update) => ({ _id: id, ...update })),
  create: jest.fn(async (data) => ({ _id: MOCK_USER_OBJECT_ID, ...data })), // Use ObjectId on create
  populate: jest.fn(async (data, options) => data),
};
const signupInstance = { save: jest.fn(async function () { return this; }) };
const signupmodel = makeMockModel(signupStatic, signupInstance);

const chatStatic = {
  find: jest.fn(() => []), 
  findOne: jest.fn(() => ({ _id: 'createdChatId', isGroupChat: true, users: [MOCK_USER_OBJECT_ID] })), 
  create: jest.fn(async (d) => ({ 
    _id: 'createdChatId', 
    ...d, 
    isGroupChat: d.isGroupChat || d.chatType === 'group' 
  })),
  findByIdAndUpdate: jest.fn(async (id, update) => ({ _id: id, ...update })),
  findById: jest.fn(async (id) => ({ _id: id })),
};
const chatModel = makeMockModel(chatStatic, {});

const communityStatic = {
  find: jest.fn(() => []),
  findById: jest.fn(async (id) => ({ _id: id, users: [] })),
  findOneAndUpdate: jest.fn(async (q, update) => ({ _id: 'comm1', ...update })),
};
const communityModel = makeMockModel(communityStatic, {});

const otpStatic = {
  find: jest.fn(async () => []),
  deleteMany: jest.fn(async () => ({})),
};
const otpmodel = makeMockModel(otpStatic, {});

const tempNumModel = function (data) { return { save: jest.fn(async () => ({ _id: MOCK_TEMP_ID, ...data })) }; };

const cartStatic = {
  findOne: jest.fn(() => null),
  create: jest.fn(async (d) => ({ _id: 'cart1', ...d })),
  findById: jest.fn(async (id) => ({ _id: id })),
  find: jest.fn(() => []),
};
const cartModel = makeMockModel(cartStatic, {});

const productStatic = {
  findById: jest.fn(async (id) => ({ _id: id, productName: 'Mock Product' })),
  find: jest.fn(async () => []),
};
const productmodel = makeMockModel(productStatic, {});

const pollStatic = {
  create: jest.fn(async (d) => ({ _id: 'poll1', ...d })),
  find: jest.fn(() => []),
  findByIdAndUpdate: jest.fn(async (id, update) => ({ _id: id, ...update })),
};
// Poll fix (instance method 'save')
const pollInstance = { save: jest.fn(async function () { return this; }) };
const pollmodel = makeMockModel(pollStatic, pollInstance);

const loginmodelStatic = { findOne: jest.fn(() => null) };
const loginmodel = makeMockModel(loginmodelStatic, {});

const msgStatic = { create: jest.fn(async (d) => ({ _id: 'createdMsgId', ...d })), find: jest.fn(() => []) };
const msgModel = makeMockModel(msgStatic, {});

// --- Export mocks and helpers ---
module.exports = {
  __jwtMock,
  signupmodel, signupModel: signupmodel,
  chatModel, chatmodel: chatModel,
  communityModel, communitymodel: communityModel,
  otpmodel, otpModel: otpmodel,
  tempNumModel, tempNummodel: tempNumModel,
  cartModel, cartmodel: cartModel,
  productmodel, productModel: productmodel,
  pollmodel, pollModel: pollmodel,
  loginmodel, loginModel: loginmodel,
  msgModel, msgmodel: msgModel,

  _resetAllMocks: () => {
    const allStatics = [
      signupStatic, chatStatic, communityStatic, otpStatic,
      cartStatic, productStatic, pollStatic, loginmodelStatic, msgStatic
    ];
    allStatics.flatMap(Object.values).forEach(fn => { if (fn && fn.mockClear) fn.mockClear(); });
    const jwt = require('jsonwebtoken');
    jwt.verify && jwt.verify.mockClear && jwt.verify.mockClear();
    jwt.sign && jwt.sign.mockClear && jwt.sign.mockClear();
  }
};

// --- Virtual jest.mock for model require paths used by controllers ---
jest.mock('../Models/signupmodel', () => ({ signupmodel: module.exports.signupmodel }), { virtual: true });
jest.mock('../Models/chatModel', () => ({ chatModel: module.exports.chatModel }), { virtual: true });
jest.mock('../Models/communityModel', () => ({ communityModel: module.exports.communityModel }), { virtual: true });
jest.mock('../Models/otpmodel', () => ({ otpmodel: module.exports.otpmodel }), { virtual: true });
jest.mock('../Models/tempNumStoringModel', () => ({ tempNumModel: module.exports.tempNumModel }), { virtual: true });
jest.mock('../Models/cartModel', () => ({ cartModel: module.exports.cartModel }), { virtual: true });
jest.mock('../Models/productmodel', () => ({ productmodel: module.exports.productmodel }), { virtual: true });
jest.mock('../Models/polsModel', () => ({ polsModel: module.exports.pollModel }), { virtual: true });
jest.mock('../Models/loginmodel', () => ({ loginmodel: module.exports.loginmodel }), { virtual: true });
jest.mock('../Models/msgModel', () => ({ msgModel: module.exports.msgModel }), { virtual: true });

// Mock middleware no-ops
jest.mock('../Middleweres/signUpMiddlewere', () => ({ signupAuth: (req, res, next) => next() }), { virtual: true });
jest.mock('../Middleweres/loginMiddlewere', () => ({ loginAuth: (req, res, next) => next() }), { virtual: true });

// Mock otp-generator predictably
jest.mock('otp-generator', () => ({ generate: jest.fn(() => '1234') }), { virtual: true });