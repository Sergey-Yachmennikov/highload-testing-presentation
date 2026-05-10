import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Counter } from 'k6/metrics';

// Custom metrics per scenario
const nPlusOneDuration = new Trend('n_plus_one_duration', true);
const optimizedDuration = new Trend('optimized_duration', true);
const nPlusOneReqs = new Counter('n_plus_one_http_reqs_total');
const optimizedReqs = new Counter('optimized_http_reqs_total');

export const options = {
    scenarios: {
        n_plus_one: {
            executor: 'constant-vus',
            vus: 10,
            duration: '30s',
            exec: 'nPlusOneEndpoint',
            tags: { test_type: 'n_plus_one' },
        },
        optimized: {
            executor: 'constant-vus',
            vus: 10,
            duration: '30s',
            startTime: '35s',
            exec: 'optimizedEndpoint',
            tags: { test_type: 'optimized' },
        },
    },
    thresholds: {
        'n_plus_one_duration': ['p(95)<1000'],
        'optimized_duration': ['p(95)<200', 'avg<100'],
    },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8082';

export function nPlusOneEndpoint() {
    const userId = Math.floor(Math.random() * 1000) + 1;
    const res = http.get(`${BASE_URL}/api/v1/orders/user/${userId}`);
    nPlusOneDuration.add(res.timings.duration);
    nPlusOneReqs.add(1);
    check(res, {
        '[n+1] status 200': (r) => r.status === 200,
        '[n+1] < 500ms': (r) => r.timings.duration < 500,
    });
    sleep(0.2);
}

export function optimizedEndpoint() {
    const userId = Math.floor(Math.random() * 1000) + 1;
    const res = http.get(`${BASE_URL}/api/v1/orders/user/${userId}/optimized`);
    optimizedDuration.add(res.timings.duration);
    optimizedReqs.add(1);
    check(res, {
        '[optimized] status 200': (r) => r.status === 200,
        '[optimized] < 200ms': (r) => r.timings.duration < 200,
    });
    sleep(0.2);
}
