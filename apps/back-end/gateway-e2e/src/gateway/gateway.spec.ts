import axios from 'axios';

describe('Get all users', () => {
  it('Should return a array', async () => {
    const res = await axios.get(`/api/users`);

    expect(res.status).toBe(200);
    expect(res.data).toBeInstanceOf(Array);
  });
});
