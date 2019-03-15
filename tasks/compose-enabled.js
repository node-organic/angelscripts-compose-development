const YAML = require('json2yaml')
const path = require('path')
const getCells = require('organic-dna-cells-info')
const findSkeletonRoot = require('organic-stem-skeleton-find-root')

const supportedCellKinds = [
  'docker',
  'webcell',
  'croncell',
  'apicell',
  'app'
]
module.exports = function (angel) {
  angel.on('compose-enabled', async function () {
    let REPO = await findSkeletonRoot()
    const loadRootDNA = require(path.join(REPO, 'cells/node_modules/lib/load-root-dna'))
    let DNA = await loadRootDNA()
    let cells = getCells(DNA.cells)
    let enabledCells = DNA['cell-enabled']
    let cellPorts = DNA['cell-ports']

    let composeJSON = {
      version: '3.4',
      services: {}
    }
    for (let i = 0; i < cells.length; i++) {
      if (enabledCells[cells[i].name]) {
        let cell = cells[i]
        if (supportedCellKinds.indexOf(cell.dna.cellKind) === -1) {
          continue
        }
        if (cell.dna.cellKind === 'docker') {
          composeJSON.services[cells[i].name] = cell.dna.docker
          continue
        }
        if (cell.dna.cellKind === 'webcell') {
          let cellPort = cellPorts[cell.name] || 8080
          composeJSON.services[cells[i].name] = {
            image: 'node:11.10.1-alpine',
            labels: cell.dna.labels,
            volumes: [
              `./${cell.dna.cwd}:/cells/${cell.name}`,
              `${REPO}/cells/node_modules:/cells/node_modules`,
              `${REPO}/node_modules:/node_modules`,
              `${REPO}/dna:/dna`
            ],
            working_dir: `/cells/${cell.name}`,
            environment: {
              CELL_MODE: '_development'
            },
            ports: [`${cellPort}:${cellPort}`],
            command: `npm run develop`
          }
        }
        // cronCell, app, apiCell are all nodejs server side apps
        let cellCompose = {
          image: 'node:11.10.1-alpine',
          labels: cell.dna.labels,
          volumes: [
            `./${cell.dna.cwd}:/cells/${cell.name}`,
            `${REPO}/cells/node_modules:/cells/node_modules`,
            `${REPO}/node_modules:/node_modules`,
            `${REPO}/dna:/dna`
          ],
          working_dir: `/cells/${cell.name}`,
          environment: {
            CELL_MODE: '_development'
          },
          command: `npm run develop`
        }
        if (cell.dna.labels && cell.dna.labels['docker.sock']) {
          cellCompose.volumes.push('/var/run/docker.sock:/var/run/docker.sock')
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
