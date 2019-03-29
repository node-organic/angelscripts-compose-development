const path = require('path')

module.exports = function (angel) {
  angel.on('compose develop', function () {
    let cellName = require(path.join(process.cwd(), 'package.json')).name
    process.on('SIGINT', function () {
      angel.exec(`npx angel compose | docker-compose -p devshell -f - down ${cellName}`)
    })
    angel.exec(`npx angel compose | docker-compose -p devshell -f - up ${cellName}`)
  })
}
