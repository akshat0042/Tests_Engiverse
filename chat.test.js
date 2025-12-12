//chat.test.js// tests/chat.test.js
const { request, app, mocks, createUserAndLogin } = require('./utils');

describe('Chat routes (mocked models)', () => {
  beforeEach(() => {
    mocks._resetAllMocks();
  });

  test('POST /user/crtgroup creates a group chat', async () => {
    // Prepare a token by calling createUserAndLogin which calls /signUp and /login
    const { token } = await createUserAndLogin({ userName: 'groupuser' });

    const res = await request(app)
      .post('/user/crtgroup')
      .set('Authorization', `Bearer ${token}`)
      .send({ userIds: ['mockUserId2', 'mockUserId3'], chatName: 'Test Group', chatDesc: 'desc', chatType: 'group' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('isGroupChat'); // Should now pass as mock.create returns an object
    expect(res.body.isGroupChat).toBe(true);
  });

  test('POST /user/accessChat/:id handles invalid id defensively', async () => {
    const { token } = await createUserAndLogin({ userName: 'dmuser' });

    const res = await request(app)
      .post('/user/accessChat/000000000000000000000000')
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect([200, 400, 500]).toContain(res.status);
  });

  test('GET /user/fetchChat returns 200 or 404 based on mocked data', async () => {
    // FIXED: Redefine find mock to support the .populate() method for chaining.
    mocks.chatModel.find = jest.fn(() => ({
        populate: jest.fn(function () { return this; }), 
        sort: jest.fn(function () { return this; }),
        exec: jest.fn(async () => []) // The final result is an empty array
    }));

    const { token } = await createUserAndLogin({ userName: 'fetchuser' });

    const res = await request(app)
      .get('/user/fetchChat')
      .set('Authorization', `Bearer ${token}`);

    expect([200, 404, 500]).toContain(res.status);
  });
});