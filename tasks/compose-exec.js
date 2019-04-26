const path = require('path')
const findSkeletonRoot = require('organic-stem-skeleton-find-root')
const {spawn} = require('child_process')

module.exports = function (angel) {
  angel.on(/compose-exec (.*)/, async function (angel) {
    let repoRoot = await findSkeletonRoot()
    let projectName = require(path.join(repoRoot, 'package.json')).name
    let cellName = require(path.join(process.cwd(), 'package.json')).name
    // thanks to https://stackoverflow.com/questions/46540091/how-to-tell-docker-compose-exec-to-read-from-stdin
    let runCmd = `docker exec -it $(npx angel compose.yaml -- . | docker-compose -p ${projectName} -f - ps -q ${cellName}) ${angel.cmdData[1]}`
    let child = spawn('bash', ['-c', runCmd], {stdio: 'inherit'})
    child.on('exit', (status) => {
      process.exit(status)
    })
  })
}
