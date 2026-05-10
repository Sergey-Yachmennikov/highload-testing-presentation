-- Add 850 more users (total: 1000)
INSERT INTO users (username, email, created_at)
SELECT
    'user_' || (150 + i),
    'user_' || (150 + i) || '@example.com',
    NOW() - (random() * interval '365 days')
FROM generate_series(1, 850) AS i;

-- Add 49850 more products (total: 50000)
INSERT INTO products (name, description, price, category, created_at)
SELECT
    'Product ' || (150 + i),
    'Description for product ' || (150 + i) || '. Sample product for load testing.',
    (random() * 9990 + 10)::numeric(10,2),
    (ARRAY['Electronics','Books','Clothing','Home','Sports','Toys','Food','Beauty','Auto','Garden'])[i % 10 + 1],
    NOW() - (random() * interval '365 days')
FROM generate_series(1, 49850) AS i;

-- Add 9850 more orders (total: 10000)
INSERT INTO orders (user_id, status, created_at)
SELECT
    (random() * 999 + 1)::bigint,
    (ARRAY['PENDING','PROCESSING','COMPLETED','CANCELLED'])[floor(random() * 4 + 1)::int],
    NOW() - (random() * interval '365 days')
FROM generate_series(1, 9850) AS i;

-- Add ~3 items per new order
INSERT INTO order_items (order_id, product_id, quantity, price)
SELECT
    o.id,
    (random() * 49999 + 1)::bigint,
    (random() * 4 + 1)::int,
    (random() * 990 + 10)::numeric(10,2)
FROM orders o
CROSS JOIN generate_series(1, 3) AS item_num
WHERE o.id > 150 AND random() < 0.8;
