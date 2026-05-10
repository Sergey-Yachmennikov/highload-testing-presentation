import http from 'k6/http';
import { check, sleep } from 'k6';

// Scenario 3: Caching
// Compares cached vs non-cached endpoints for the same product

export const options = {
    scenarios: {
        // Without cache (BAD under load)
        no_cache: {
            executor: 'constant-vus',
            vus: 50,
            duration: '30s',
            exec: 'noCacheEndpoint',
            tags: { test_type: 'no_cache' },
        },
        // With cache (GOOD)
        with_cache: {
            executor: 'constant-vus',
            vus: 50,
            duration: '30s',
            startTime: '35s',
            exec: 'cachedEndpoint',
            tags: { test_type: 'with_cache' },
        },
    },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8082';

// Use a small set of product IDs to maximize cache hits
const PRODUCT_IDS = [1, 2, 3, 4, 5, 10, 20, 50, 100];

export function noCacheEndpoint() {
    const id = PRODUCT_IDS[Math.floor(Math.random() * PRODUCT_IDS.length)];
    const res = http.get(`${BASE_URL}/api/v1/products/${id}`);
    check(res, {
        'status is 200': (r) => r.status === 200,
        'response time < 100ms': (r) => r.timings.duration < 100,
    });
    sleep(0.05);
}

export function cachedEndpoint() {
    const id = PRODUCT_IDS[Math.floor(Math.random() * PRODUCT_IDS.length)];
    const res = http.get(`${BASE_URL}/api/v1/products/${id}/cached`);
    check(res, {
        'status is 200': (r) => r.status === 200,
        'response time < 50ms': (r) => r.timings.duration < 50,
    });
    sleep(0.05);
}
