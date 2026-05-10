import http from 'k6/http';
import { check, sleep } from 'k6';

// Scenario 1: Pagination vs No Pagination
// Demonstrates the difference between paginated and non-paginated endpoints

export const options = {
    scenarios: {
        // Test paginated endpoint (GOOD)
        paginated: {
            executor: 'constant-vus',
            vus: 20,
            duration: '30s',
            exec: 'paginatedEndpoint',
            tags: { test_type: 'paginated' },
        },
        // Test non-paginated endpoint (BAD) - starts after paginated test
        non_paginated: {
            executor: 'constant-vus',
            vus: 20,
            duration: '30s',
            startTime: '35s',
            exec: 'nonPaginatedEndpoint',
            tags: { test_type: 'non_paginated' },
        },
    },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8082';

export function paginatedEndpoint() {
    const res = http.get(`${BASE_URL}/api/v1/products?page=0&size=20`);
    check(res, {
        'status is 200': (r) => r.status === 200,
        'response time < 200ms': (r) => r.timings.duration < 200,
    });
    sleep(0.1);
}

export function nonPaginatedEndpoint() {
    const res = http.get(`${BASE_URL}/api/v1/products/slow`);
    check(res, {
        'status is 200': (r) => r.status === 200,
        'response time < 1000ms': (r) => r.timings.duration < 1000,
    });
    sleep(0.1);
}
