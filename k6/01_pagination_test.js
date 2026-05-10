import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Counter } from 'k6/metrics';

// Custom metrics per scenario
const paginatedDuration = new Trend('paginated_duration', true);
const nonPaginatedDuration = new Trend('non_paginated_duration', true);
const paginatedReqs = new Counter('paginated_http_reqs_total');
const nonPaginatedReqs = new Counter('non_paginated_http_reqs_total');

export const options = {
    scenarios: {
        paginated: {
            executor: 'constant-vus',
            vus: 20,
            duration: '30s',
            exec: 'paginatedEndpoint',
            tags: { test_type: 'paginated' },
        },
        non_paginated: {
            executor: 'constant-vus',
            vus: 20,
            duration: '30s',
            startTime: '35s',
            exec: 'nonPaginatedEndpoint',
            tags: { test_type: 'non_paginated' },
        },
    },
    thresholds: {
        'paginated_duration': ['p(95)<200', 'avg<100'],
        'non_paginated_duration': ['p(95)<2000'],
    },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8082';

export function paginatedEndpoint() {
    const res = http.get(`${BASE_URL}/api/v1/products?page=0&size=20`);
    paginatedDuration.add(res.timings.duration);
    paginatedReqs.add(1);
    check(res, {
        '[paginated] status 200': (r) => r.status === 200,
        '[paginated] < 200ms': (r) => r.timings.duration < 200,
    });
    sleep(0.1);
}

export function nonPaginatedEndpoint() {
    const res = http.get(`${BASE_URL}/api/v1/products/slow`);
    nonPaginatedDuration.add(res.timings.duration);
    nonPaginatedReqs.add(1);
    check(res, {
        '[non_paginated] status 200': (r) => r.status === 200,
        '[non_paginated] < 1000ms': (r) => r.timings.duration < 1000,
    });
    sleep(0.1);
}
