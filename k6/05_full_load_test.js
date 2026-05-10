import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Counter } from 'k6/metrics';

// Custom metrics per endpoint type
const productListDuration = new Trend('product_list_duration', true);
const productCachedDuration = new Trend('product_cached_duration', true);
const productCategoryDuration = new Trend('product_category_duration', true);
const orderOptimizedDuration = new Trend('order_optimized_duration', true);

const productListReqs = new Counter('product_list_http_reqs_total');
const productCachedReqs = new Counter('product_cached_http_reqs_total');
const productCategoryReqs = new Counter('product_category_http_reqs_total');
const orderOptimizedReqs = new Counter('order_optimized_http_reqs_total');

export const options = {
    stages: [
        { duration: '30s', target: 20 },
        { duration: '1m', target: 50 },
        { duration: '1m', target: 100 },
        { duration: '1m', target: 100 },
        { duration: '30s', target: 0 },
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'],
        http_req_failed: ['rate<0.01'],
        'product_list_duration': ['p(95)<200'],
        'product_cached_duration': ['p(95)<50'],
        'product_category_duration': ['p(95)<200'],
        'order_optimized_duration': ['p(95)<300'],
    },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8082';

const categories = ['Electronics', 'Books', 'Clothing', 'Home', 'Sports', 'Toys', 'Food', 'Beauty', 'Auto', 'Garden'];

export default function () {
    const roll = Math.random();
    let res;

    if (roll < 0.25) {
        res = http.get(`${BASE_URL}/api/v1/products?page=0&size=20`);
        productListDuration.add(res.timings.duration);
        productListReqs.add(1);
    } else if (roll < 0.5) {
        const id = Math.floor(Math.random() * 1000) + 1;
        res = http.get(`${BASE_URL}/api/v1/products/${id}/cached`);
        productCachedDuration.add(res.timings.duration);
        productCachedReqs.add(1);
    } else if (roll < 0.75) {
        const cat = categories[Math.floor(Math.random() * categories.length)];
        res = http.get(`${BASE_URL}/api/v1/products/category/${cat}?page=0&size=20`);
        productCategoryDuration.add(res.timings.duration);
        productCategoryReqs.add(1);
    } else {
        const userId = Math.floor(Math.random() * 1000) + 1;
        res = http.get(`${BASE_URL}/api/v1/orders/user/${userId}/optimized`);
        orderOptimizedDuration.add(res.timings.duration);
        orderOptimizedReqs.add(1);
    }

    check(res, {
        'status is 200': (r) => r.status === 200,
        'response time < 500ms': (r) => r.timings.duration < 500,
    });

    sleep(0.1 + Math.random() * 0.3);
}
