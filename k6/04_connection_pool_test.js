import http from 'k6/http';
import { check, sleep } from 'k6';

// Scenario 4: Connection Pool Exhaustion
// The /blocking endpoint holds a DB connection for 5 seconds.
// With HikariCP pool size = 10, sending 15+ concurrent requests
// will exhaust the pool and cause connection timeouts.

export const options = {
    scenarios: {
        // Gradually increase load to exhaust the connection pool
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
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8082';

export default function () {
    const res = http.get(`${BASE_URL}/api/v1/orders/blocking`, {
        timeout: '35s',
    });
    check(res, {
        'status is 200': (r) => r.status === 200,
        'no timeout': (r) => r.timings.duration < 30000,
    });
}
