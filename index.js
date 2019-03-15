module.exports = async function (angel) {
  require('angelabilities-exec')(angel)
  require('./tasks/compose-enabled')(angel)
  require('./tasks/develop-enabled')(angel)
}
