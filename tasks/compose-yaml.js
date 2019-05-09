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
      let augmentedLabels = cell.dna.labels || {}
      if (cellMountpoints[cell.name]) {
        Object.assign(augmentedLabels, {
          route: cellMountpoints[cell.name]
        })
      }
      if (cell.dna.docker) {
        composeJSON.services[cells[i].name] = cell.dna.docker
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
        labels: augmentedLabels,
        volumes: [
          `${REPO}/${cell.dna.cwd}:/${cell.dna.cwd}`,
          `${REPO}/cells/node_modules:/cells/node_modules`,
          `${REPO}/node_modules:/node_modules`,
          `${REPO}/dna:/dna`
        ],
        working_dir: `/${cell.dna.cwd}`,
        environment: {
          CELL_MODE: '_development'
        },
        command: angel.cmdData[1]
      }
      if (cell.dna.compose) {
        let composeConfig = cell.dna.compose
        if (composeConfig.volumes) {
          cellCompose.volumes = cellCompose.volumes.concat(composeConfig.volumes)
        }
      }
      if (cellPorts[cell.name]) {
        let cellPort = cellPorts[cell.name]
        cellCompose.ports = [`${cellPort}:${cellPort}`]
      }
      composeJSON.services[cells[i].name] = cellCompose
    }
    console.log(YAML.stringify(composeJSON))
  })
}
