import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Counter } from 'k6/metrics';

// Custom metrics
const blockingDuration = new Trend('blocking_duration', true);
const blockingReqs = new Counter('blocking_http_reqs_total');
const blockingErrors = new Counter('blocking_errors_total');

export const options = {
    scenarios: {
        ramp_up: {
            executor: 'ramping-vus',
            startVUs: 1,
            stages: [
                { duration: '10s', target: 5 },   // warm up
                { duration: '10s', target: 10 },  // at pool limit
                { duration: '10s', target: 20 },  // exceeding pool
                { duration: '10s', target: 30 },  // pool exhaustion
                { duration: '10s', target: 0 },   // cool down
            ],
        },
    },
    thresholds: {
        'blocking_duration': ['p(95)<35000'],
        'blocking_errors_total': ['count<50'],
    },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8082';

export default function () {
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
