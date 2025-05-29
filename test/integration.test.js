const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const Item = require('../models/item');

// Updated URI to use container hostname (my-mongo)
const mongoURI = 'mongodb://admin:password@my-mongo:27017/testdb?authSource=admin';

beforeAll(async () => {
  // Increase timeout in case MongoDB takes time to connect
  await mongoose.connect(mongoURI);
}, 10000); // 10 seconds timeout

afterAll(async () => {
  // Clean up DB connection after all tests
  await mongoose.connection.close();
});

beforeEach(async () => {
  // Clear Items collection before each test
  await Item.deleteMany({});
});

describe('Integration Test for /items API', () => {
  it('POST /items should create a new item', async () => {
    const res = await request(app)
      .post('/items')
      .send({ name: 'Test Item', quantity: 3 });

    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Test Item');
    expect(res.body.quantity).toBe(3);
  });

  it('GET /items should return all items', async () => {
    await Item.create({ name: 'Sample Item', quantity: 5 });

    const res = await request(app).get('/items');

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe('Sample Item');
  });
});
