const path = require('path')
const findSkeletonRoot = require('organic-stem-skeleton-find-root')

module.exports = function (angel) {
  angel.on('compose develop', async function () {
    let repoRoot = await findSkeletonRoot()
    let projectName = require(path.join(repoRoot, 'package.json')).name
    let cellName = require(path.join(process.cwd(), 'package.json')).name
    process.on('SIGINT', function () {
      angel.exec(`npx angel compose | docker-compose -p ${projectName} -f - down ${cellName}`)
    })
    process.on('SIGTERM', function () {
      angel.exec(`npx angel compose | docker-compose -p ${projectName} -f - down ${cellName}`)
    })
    angel.exec(`npx angel compose | docker-compose -p ${projectName} -f - up ${cellName}`)
  })
}
