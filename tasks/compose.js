const path = require('path')
const findSkeletonRoot = require('organic-stem-skeleton-find-root')

module.exports = function (angel) {
  angel.on(/compose up$/, async function (angel) {
    let repoRoot = await findSkeletonRoot()
    let projectName = require(path.join(repoRoot, 'package.json')).name
    let cellName = require(path.join(process.cwd(), 'package.json')).name
    let upCmd = `npx angel compose.yaml | DOCKER_BUILDKIT=1 COMPOSE_DOCKER_CLI_BUILD=1 docker-compose -p ${projectName} -f - up ${cellName}`
    angel.exec(upCmd)
  })

  angel.on(/compose up -- (.*)/, async function (angel) {
    let repoRoot = await findSkeletonRoot()
    let projectName = require(path.join(repoRoot, 'package.json')).name
    let cellName = require(path.join(process.cwd(), 'package.json')).name
    let upCmd = `npx angel compose.yaml -- ${angel.cmdData[1]} | DOCKER_BUILDKIT=1 COMPOSE_DOCKER_CLI_BUILD=1 docker-compose -p ${projectName} -f - up ${cellName}`
    angel.exec(upCmd)
  })

  angel.on(/compose down$/, async function (angel) {
    let repoRoot = await findSkeletonRoot()
    let projectName = require(path.join(repoRoot, 'package.json')).name
    let downCmd = `npx angel compose.yaml | docker-compose -p ${projectName} -f - down`
    angel.exec(downCmd)
  })

  angel.on(/compose down -- (.*)/, async function (angel) {
    let repoRoot = await findSkeletonRoot()
    let projectName = require(path.join(repoRoot, 'package.json')).name
    let downCmd = `npx angel compose.yaml -- ${angel.cmdData[1]} | docker-compose -p ${projectName} -f - down`
    angel.exec(downCmd)
  })

  angel.on(/compose build -- (.*)/, async function (angel) {
    let repoRoot = await findSkeletonRoot()
    let projectName = require(path.join(repoRoot, 'package.json')).name
    let cellName = require(path.join(process.cwd(), 'package.json')).name
    let downCmd = `npx angel compose.yaml -- ${angel.cmdData[1]} | docker-compose -p ${projectName} -f - build ${cellName}`
    angel.exec(downCmd)
  })
}
