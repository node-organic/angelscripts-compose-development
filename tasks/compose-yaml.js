const YAML = require('json2yaml')
const path = require('path')
const getCells = require('organic-dna-cells-info')
const findSkeletonRoot = require('organic-stem-skeleton-find-root')

const printComposeYAML = async function (command) {
  const REPO = await findSkeletonRoot()
  const loadRootDNA = require(path.join(REPO, 'cells/node_modules/lib/load-root-dna'))
  const packagejson = require(process.cwd() + '/package.json')
  const DNA = await loadRootDNA()
  const cells = getCells(DNA.cells)
  const cellPorts = DNA['cell-ports']
  const cellMountpoints = DNA['cell-mountpoints']
  const commonDeps = packagejson['common_dependencies']

  let composeJSON = {
    version: '3.4',
    services: {}
  }
  for (let i = 0; i < cells.length; i++) {
    let cell = cells[i]
    if (cell.name !== packagejson.name) continue
    if (!cell.dna.cwd) continue

    let nodeVersion = '11.10.1'
    if (packagejson.engines && packagejson.engines.node) {
      nodeVersion = packagejson.engines.node
    }
    let cellCompose = {
      image: `node:${nodeVersion}-alpine`,
      labels: {},
      volumes: [],
      working_dir: `/${cell.dna.cwd}`,
      ports: [],
      environment: {
        USER: process.env.USER
      }
    }
    if (command) {
      cellCompose.command = command
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

    cellCompose.volumes.push(`${REPO}/cells:/cells`)
    cellCompose.volumes.push(`${REPO}/dna:/dna`)
    if (commonDeps) {
      commonDeps.forEach(dep => {
        let absolute_path = `${REPO}/cells/node_modules/${dep}`
        let depRelativePathFromCell = path.relative(process.cwd(), absolute_path)
        let depRepoPath = path.relative(REPO, absolute_path)
        cellCompose.volumes.push(`${depRelativePathFromCell}:/${depRepoPath}`)
      })
    }

    if (cell.dna.dockerCompose && cell.dna.dockerCompose.build) {
      delete cellCompose.image
    }

    composeJSON.services[cell.name] = Object.assign(cellCompose, cell.dna.dockerCompose)
    if (cell.dna.extendDockerCompose) {
      if (cell.dna.extendDockerCompose.volumes) {
        composeJSON.services[cell.name].volumes = composeJSON.services[cell.name].volumes.concat(cell.dna.extendDockerCompose.volumes)
      }
    }
  }
  console.log(YAML.stringify(composeJSON))
}

module.exports = function (angel) {
  angel.on(/compose.yaml$/, async function (angel) {
    printComposeYAML()
  })
  angel.on(/compose.yaml -- (.*)/, async function (angel) {
    printComposeYAML(angel.cmdData[1])
  })
}
