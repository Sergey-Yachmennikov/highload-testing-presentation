import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Counter } from 'k6/metrics';

// Custom metrics
const blockingDuration = new Trend('blocking_duration', true);
const blockingReqs = new Counter('blocking_http_reqs_total');
const blockingErrors = new Counter('blocking_errors_total');
const asyncDuration = new Trend('async_duration', true);
const asyncReqs = new Counter('async_http_reqs_total');
const asyncErrors = new Counter('async_errors_total');

export const options = {
    scenarios: {
        blocking: {
            executor: 'ramping-vus',
            startVUs: 1,
            stages: [
                { duration: '10s', target: 5 },   // warm up
                { duration: '10s', target: 10 },  // at pool limit
                { duration: '10s', target: 20 },  // exceeding pool
                { duration: '10s', target: 30 },  // pool exhaustion
                { duration: '10s', target: 0 },   // cool down
            ],
            exec: 'blocking',
        },
        async: {
            executor: 'ramping-vus',
            startVUs: 1,
            startTime: '55s',
            stages: [
                { duration: '10s', target: 5 },
                { duration: '10s', target: 10 },
                { duration: '10s', target: 20 },
                { duration: '10s', target: 30 },
                { duration: '10s', target: 0 },
            ],
            exec: 'async',
        },
    },
    thresholds: {
        'blocking_duration': ['p(95)<35000'],
        'blocking_errors_total': ['count<50'],
        'async_duration': ['p(95)<10000'],
        'async_errors_total': ['count<10'],
    },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8082';

export function blocking() {
    const res = http.get(`${BASE_URL}/api/v1/orders/blocking`, {
        timeout: '35s',
    });
    blockingDuration.add(res.timings.duration);
    blockingReqs.add(1);
    if (res.status !== 200) {
        blockingErrors.add(1);
    }
    check(res, {
        '[blocking] status 200': (r) => r.status === 200,
        '[blocking] no timeout': (r) => r.timings.duration < 30000,
    });
}

export function async() {
    const res = http.get(`${BASE_URL}/api/v1/orders/async`, {
        timeout: '35s',
    });
    asyncDuration.add(res.timings.duration);
    asyncReqs.add(1);
    if (res.status !== 200) {
        asyncErrors.add(1);
    }
    check(res, {
        '[async] status 200': (r) => r.status === 200,
        '[async] no timeout': (r) => r.timings.duration < 10000,
    });
}
