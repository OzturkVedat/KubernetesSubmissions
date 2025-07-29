# Broadcaster

Broadcaster listens for todo-related events published via NATS on the todo.events subject and forwards them to a configurable external webhook (e.g. https://httpbin.org/post) using a simple JSON payload.
