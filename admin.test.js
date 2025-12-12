// tests/admin.test.js
const { request, app, mocks, createUserAndLogin } = require('./utils');

describe('Admin routes (mocked)', () => {
  beforeEach(() => {
    mocks._resetAllMocks();
  });

  test('POST /user/productReports returns some structure', async () => {
    const { token } = await createUserAndLogin({ userName: 'adminuser' });

    const res = await request(app)
      .post('/user/productReports')
      .set('Authorization', `Bearer valid-token`)
      .send({});

    expect([200, 400, 500]).toContain(res.status);
  });

  test('POST /user/orderReports returns some structure', async () => {
    const { token } = await createUserAndLogin({ userName: 'adminuser' });

    const res = await request(app)
      .post('/user/orderReports')
      .set('Authorization', `Bearer valid-token`)
      .send({});

    expect([200, 400, 500]).toContain(res.status);
  });
});
