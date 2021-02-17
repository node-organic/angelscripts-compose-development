# angelscripts-compose-development

[organic-angel](https://github.com/node-organic/organic-angel) scripts for generating [docker-compose](https://docs.docker.com/compose/) compatible configuration **and**  commands aiding docker-compose usage in development.

## commands

### `angel compose.yaml -- (.*)`

Generates docker compose version 3.4 configuration for all cells found within the 
current working repository folder. The structure and organization are expected to follow [organic-stem-skeleton v2.1](https://github.com/node-organic/organic-stem-skeleton)

The input `(.*)` is used as docker command. The generated yaml uses as source the following data points:

* current working directory with package.json
  * packagejson.name
  * packagejson.engines.node

* cell's dna
  * cellCompose.ports
  * cellCompose.volumes
  * cellCompose.labels
  
* repo's DNA
  * cell-ports[cell.name]
  * cell-mountpoints[cell.name]

### `angel compose -- (.*)`

Executes `docker-compose up` with the input `(.*)` as docker command. Listens for `SIGINT` or `SIGTERM` and gracefully stops via `docker-compose down`. It passes `angel compose.yaml` to docker compose.

### `angel compose up -- (.*)`

Executes `docker-compose up` with the input `(.*)` as docker command. It passes `angel compose.yaml` to docker compose.

### `angel compose down -- (.*)`

Executes `docker-compose down` with the input `(.*)` as docker command. It passes `angel compose.yaml` to docker compose.


### `angel compose build -- (.*)`

Executes `docker-compose build` with the input `(.*)` as docker command. It passes `angel compose.yaml` to docker compose.

### `angel compose-exec -- (.*)`

Executes `docker exec -it` with the input `(.*)` as command. It automatically finds the respective to the service docker container.
