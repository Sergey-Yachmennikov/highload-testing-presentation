import http from 'k6/http';
import { check, sleep } from 'k6';

// Scenario 5: Full load test - simulates realistic mixed traffic
// Run all "good" endpoints together to measure overall system capacity

export const options = {
    stages: [
        { duration: '30s', target: 20 },   // ramp up
        { duration: '1m', target: 50 },     // hold at 50 VUs
        { duration: '1m', target: 100 },    // increase to 100 VUs
        { duration: '1m', target: 100 },    // hold at 100 VUs
        { duration: '30s', target: 0 },     // ramp down
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'],    // 95% of requests under 500ms
        http_req_failed: ['rate<0.01'],      // less than 1% errors
    },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8082';

export default function () {
    const actions = [
        () => http.get(`${BASE_URL}/api/v1/products?page=0&size=20`),
        () => http.get(`${BASE_URL}/api/v1/products/${Math.floor(Math.random() * 1000) + 1}/cached`),
        () => http.get(`${BASE_URL}/api/v1/products/category/category_${Math.floor(Math.random() * 10) + 1}?page=0&size=20`),
        () => {
            const userId = Math.floor(Math.random() * 1000) + 1;
            return http.get(`${BASE_URL}/api/v1/orders/user/${userId}/optimized`);
        },
    ];

    const action = actions[Math.floor(Math.random() * actions.length)];
    const res = action();

    check(res, {
        'status is 200': (r) => r.status === 200,
        'response time < 500ms': (r) => r.timings.duration < 500,
    });

    sleep(0.1 + Math.random() * 0.3);
}
