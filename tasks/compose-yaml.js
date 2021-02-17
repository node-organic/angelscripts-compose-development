const YAML = require('json2yaml')
const path = require('path')
const getCells = require('organic-dna-cells-info')
const findSkeletonRoot = require('organic-stem-skeleton-find-root')

module.exports = function (angel) {
  angel.on(/compose.yaml -- (.*)/, async function (angel) {
    let REPO = await findSkeletonRoot()
    const loadRootDNA = require(path.join(REPO, 'cells/node_modules/lib/load-root-dna'))
    const packagejson = require(process.cwd() + '/package.json')
    let DNA = await loadRootDNA()
    let cells = getCells(DNA.cells)
    let cellPorts = DNA['cell-ports']
    let cellMountpoints = DNA['cell-mountpoints']

    let composeJSON = {
      version: '3.4',
      services: {}
    }
    for (let i = 0; i < cells.length; i++) {
      if (cells[i].name !== packagejson.name) continue
      let cell = cells[i]
      if (cell.dna.dockerCompose) {
        composeJSON.services[cell.name] = cell.dna.dockerCompose
        continue
      }

      // without CWD the cellCompose bellow doesnt make any sense
      if (!cell.dna.cwd) continue
      let nodeVersion = '11.10.1'
      if (packagejson.engines && packagejson.engines.node) {
        nodeVersion = packagejson.engines.node
      }

      let cellCompose = {
        image: `node:${nodeVersion}-alpine`,
        labels: {},
        volumes: [
          `${REPO}:/workdir`,
        ],
        working_dir: `/workdir/${cell.dna.cwd}`,
        command: angel.cmdData[1],
        ports: [],
        environment: {
          USER: process.env.USER
        }
      }
      if (cell.dna.compose) {
        let composeConfig = cell.dna.compose
        if (composeConfig.volumes) {
          cellCompose.volumes = cellCompose.volumes.concat(composeConfig.volumes)
        }
        if (composeConfig.ports) {
          cellCompose.ports = cellCompose.ports.concat(composeConfig.ports)
        }
      }
      if (cellMountpoints[cell.name]) {
        Object.assign(cellCompose.labels, {
          route: cellMountpoints[cell.name]
        })
      }
      if (cellPorts[cell.name]) {
        let cellPort = cellPorts[cell.name]
        cellCompose.ports = cellCompose.ports.concat([`${cellPort}:${cellPort}`])
      }
      composeJSON.services[cell.name] = cellCompose
    }
    console.log(YAML.stringify(composeJSON))
  })
}
