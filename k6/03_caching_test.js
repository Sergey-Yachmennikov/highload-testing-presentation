import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Counter } from 'k6/metrics';

// Custom metrics per scenario
const noCacheDuration = new Trend('no_cache_duration', true);
const cachedDuration = new Trend('cached_duration', true);
const noCacheReqs = new Counter('no_cache_http_reqs_total');
const cachedReqs = new Counter('cached_http_reqs_total');

export const options = {
    scenarios: {
        no_cache: {
            executor: 'constant-vus',
            vus: 50,
            duration: '30s',
            exec: 'noCacheEndpoint',
            tags: { test_type: 'no_cache' },
        },
        with_cache: {
            executor: 'constant-vus',
            vus: 50,
            duration: '30s',
            startTime: '35s',
            exec: 'cachedEndpoint',
            tags: { test_type: 'with_cache' },
        },
    },
    thresholds: {
        'no_cache_duration': ['p(95)<200'],
        'cached_duration': ['p(95)<50', 'avg<20'],
    },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8082';

const PRODUCT_IDS = [1, 2, 3, 4, 5, 10, 20, 50, 100];

export function noCacheEndpoint() {
    const id = PRODUCT_IDS[Math.floor(Math.random() * PRODUCT_IDS.length)];
    const res = http.get(`${BASE_URL}/api/v1/products/${id}`);
    noCacheDuration.add(res.timings.duration);
    noCacheReqs.add(1);
    check(res, {
        '[no_cache] status 200': (r) => r.status === 200,
        '[no_cache] < 100ms': (r) => r.timings.duration < 100,
    });
    sleep(0.05);
}

export function cachedEndpoint() {
    const id = PRODUCT_IDS[Math.floor(Math.random() * PRODUCT_IDS.length)];
    const res = http.get(`${BASE_URL}/api/v1/products/${id}/cached`);
    cachedDuration.add(res.timings.duration);
    cachedReqs.add(1);
    check(res, {
        '[cached] status 200': (r) => r.status === 200,
        '[cached] < 50ms': (r) => r.timings.duration < 50,
    });
    sleep(0.05);
}
