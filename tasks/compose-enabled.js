const YAML = require('json2yaml')
const path = require('path')
const getCells = require('organic-dna-cells-info')
const findSkeletonRoot = require('organic-stem-skeleton-find-root')

module.exports = function (angel) {
  angel.on('compose-enabled', async function () {
    let REPO = await findSkeletonRoot()
    const loadRootDNA = require(path.join(REPO, 'cells/node_modules/lib/load-root-dna'))
    let DNA = await loadRootDNA()
    let cells = getCells(DNA.cells)
    let enabledCells = DNA['cell-enabled']
    let cellPorts = DNA['cell-ports']
    let cellMountpoints = DNA['cell-mountpoints']

    let composeJSON = {
      version: '3.4',
      services: {}
    }
    for (let i = 0; i < cells.length; i++) {
      if (enabledCells[cells[i].name]) {
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

        let cellCompose = {
          image: 'node:11.10.1-alpine',
          labels: augmentedLabels,
          volumes: [
            `./${cell.dna.cwd}:/${cell.dna.cwd}`,
            `${REPO}/cells/node_modules:/cells/node_modules`,
            `${REPO}/node_modules:/node_modules`,
            `${REPO}/dna:/dna`
          ],
          working_dir: `/${cell.dna.cwd}`,
          environment: {
            CELL_MODE: '_development'
          },
          command: `npm run develop`
        }
        if (cell.dna.compose) {
          let composeConfig = cell.dna.compose
          if (composeConfig.depends_on) {
            cellCompose.depends_on = composeConfig.depends_on
          }
          if (composeConfig.capabilities && composeConfig.capabilities['docker.sock']) {
            cellCompose.volumes.push('/var/run/docker.sock:/var/run/docker.sock')
          }
        }
        if (cellPorts[cell.name]) {
          let cellPort = cellPorts[cell.name]
          cellCompose.ports = [`${cellPort}:${cellPort}`]
        }
        composeJSON.services[cells[i].name] = cellCompose
      }
    }
    console.log(YAML.stringify(composeJSON))
  })
}
