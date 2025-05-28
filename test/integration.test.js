const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const Item = require('../models/item');

const mongoURI = 'mongodb://admin:password@localhost:27017/testdb?authSource=admin';

beforeAll(async () => {
  // Connect to MongoDB before tests run
  await mongoose.connect(mongoURI, {
    // options no longer needed in latest versions
  });
});

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
