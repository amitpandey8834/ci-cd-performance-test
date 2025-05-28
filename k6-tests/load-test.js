import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '10s', target: 10 }, // Ramp-up to 10 users
    { duration: '20s', target: 10 }, // Stay at 10 users
    { duration: '10s', target: 0 },  // Ramp-down
  ],
};

export default function () {
  // Change this if your API runs on a different host or port
  const res = http.get('http://localhost:3000/items');
  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
