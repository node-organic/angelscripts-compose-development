const path = require('path')
const findSkeletonRoot = require('organic-stem-skeleton-find-root')

module.exports = function (angel) {
  angel.on(/compose run (.*)/, async function (angel) {
    let cmd = angel.cmdData[1]
    let repoRoot = await findSkeletonRoot()
    let projectName = require(path.join(repoRoot, 'package.json')).name
    angel.exec(`npx angel compose | docker-compose -p ${projectName} -f - ${cmd}`)
  })
}
