# angelscripts-compose-development

[organic-angel](https://github.com/node-organic/organic-angel) scripts for generating [docker-compose](https://docs.docker.com/compose/) compatible configuration **and**  commands aiding docker-compose usage in development.

## commands

### `angel compose.yaml -- (.*)`

Generates docker compose version 3.4 configuration for all cells found within the 
current working repository folder. The structure and organization are expected to follow [organic-stem-skeleton v2.1](https://github.com/node-organic/organic-stem-skeleton)

The input `(.*)` is used as docker command.

### `angel compose -- (.*)`

Executes `docker-compose up` with the input `(.*)` as docker command. Listens for `SIGINT` or `SIGTERM` and gracefully stops via `docker-compose down`
