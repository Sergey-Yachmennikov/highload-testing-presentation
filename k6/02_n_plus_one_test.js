import http from 'k6/http';
import { check, sleep } from 'k6';

// Scenario 2: N+1 Problem
// Compares lazy loading (N+1) vs JOIN FETCH (optimized)

export const options = {
    scenarios: {
        // N+1 problem (BAD)
        n_plus_one: {
            executor: 'constant-vus',
            vus: 10,
            duration: '30s',
            exec: 'nPlusOneEndpoint',
            tags: { test_type: 'n_plus_one' },
        },
        // JOIN FETCH (GOOD)
        optimized: {
            executor: 'constant-vus',
            vus: 10,
            duration: '30s',
            startTime: '35s',
            exec: 'optimizedEndpoint',
            tags: { test_type: 'optimized' },
        },
    },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8082';

export function nPlusOneEndpoint() {
    const userId = Math.floor(Math.random() * 1000) + 1;
    const res = http.get(`${BASE_URL}/api/v1/orders/user/${userId}`);
    check(res, {
        'status is 200': (r) => r.status === 200,
        'response time < 500ms': (r) => r.timings.duration < 500,
    });
    sleep(0.2);
}

export function optimizedEndpoint() {
    const userId = Math.floor(Math.random() * 1000) + 1;
    const res = http.get(`${BASE_URL}/api/v1/orders/user/${userId}/optimized`);
    check(res, {
        'status is 200': (r) => r.status === 200,
        'response time < 200ms': (r) => r.timings.duration < 200,
    });
    sleep(0.2);
}
