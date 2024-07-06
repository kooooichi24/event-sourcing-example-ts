# Backend of event-sourcing-example-ts

## Description

TODO: Add description

## Getting Started

### Prerequisites

TODO: Add prerequisites

### Installation

1. Install NPM packages

    ```bash
    yarn install
    ```

2. Set up the database

    ```bash
    yarn setup:db
    yarn drizzle:migrate
    ```

3. Start the local server

    ```bash
    yarn deploy:local
    ```

### Commands

```sh
# Query
curl -X POST -H "Content-Type: application/json" \
  -d '{"query": "{ hello }"}' \
  http://localhost:3000


# Command
curl -X POST -H "Content-Type: application/json" \
  -d '{"query": "mutation { createAccount(name: \"NAME\", role: \"Admin\") }"}' \
  http://localhost:3000
```
