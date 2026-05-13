# Highload Testing Presentation

Демо-проект для презентации по нагрузочному тестированию. Содержит намеренно "плохие" и "хорошие" эндпоинты для демонстрации типичных проблем производительности и их решений.

## Стек технологий

- Java 21, Spring Boot 4.0.6
- PostgreSQL 17, HikariCP
- Liquibase (миграции БД)
- Caffeine (кеширование)
- k6 (нагрузочное тестирование)
- Prometheus + Grafana (мониторинг)

## Демонстрируемые паттерны

| Проблема | Плохой эндпоинт | Хороший эндпоинт | Решение |
|----------|-----------------|-------------------|---------|
| Пагинация | `GET /api/v1/products/slow` | `GET /api/v1/products` | Spring Data Pageable |
| N+1 запросы | `GET /api/v1/orders/user/{id}` | `GET /api/v1/orders/user/{id}/optimized` | JOIN FETCH |
| Кеширование | `GET /api/v1/products/{id}` | `GET /api/v1/products/{id}/cached` | Caffeine cache |
| Connection Pool | `GET /api/v1/orders/blocking` | `GET /api/v1/orders/async` | Асинхронная обработка |

## Быстрый старт

### 1. Запуск инфраструктуры

```bash
docker-compose up -d
```

Будут подняты:
- PostgreSQL на порту `5434`
- Prometheus на порту `9090`
- Grafana на порту `3000` (admin/admin)

### 2. Запуск приложения

```bash
./mvnw spring-boot:run
```

Приложение стартует на порту `8082`. При старте Liquibase создаст схему и заполнит БД тестовыми данными (50k продуктов, 1000 пользователей, 10k заказов).

### 3. Запуск нагрузочных тестов

```bash
cd k6

# Отдельные тесты
just pagination        # Пагинация vs загрузка всех данных
just n-plus-one        # N+1 vs JOIN FETCH
just caching           # Без кеша vs с кешом
just connection-pool   # Исчерпание пула соединений
just full-load         # Смешанная нагрузка

# Все тесты последовательно
just all
```

### 4. Мониторинг

- **Grafana**: http://localhost:3000 (admin/admin) — дашборд "Spring Boot Highload" подключается автоматически
- **Prometheus**: http://localhost:9090
- **Actuator**: http://localhost:8082/actuator/health

## Структура проекта

```
src/main/java/com/highload/highload_testing_presentation/
  controller/    — REST-контроллеры (ProductController, OrderController)
  service/       — Бизнес-логика с примерами плохих и хороших подходов
  repository/    — JPA-репозитории (N+1 vs JOIN FETCH)
  entity/        — JPA-сущности (Product, Order, OrderItem, User)
  config/        — Конфигурация кеша и async

k6/              — Скрипты нагрузочного тестирования (k6)
monitoring/      — Конфигурация Prometheus и Grafana
```

## API документация

OpenAPI-спецификация доступна в файле `openapi.yaml`.
