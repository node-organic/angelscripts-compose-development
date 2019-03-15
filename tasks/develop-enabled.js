module.exports = function (angel) {
  angel.on('develop-enabled', function () {
    process.on('SIGINT', function () {
      angel.exec('npx angel compose-enabled | docker-compose -f - down')
    })
    angel.exec('npx angel compose-enabled | docker-compose -f - up')
  })

  angel.on('develop-enabled stop', function () {
    angel.exec('npx angel compose-enabled | docker-compose -f - down')
  })
}
