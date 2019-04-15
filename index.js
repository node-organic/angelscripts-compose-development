module.exports = async function (angel) {
  require('angelabilities-exec')(angel)
  require('./tasks/compose')(angel)
  require('./tasks/develop')(angel)
  require('./tasks/run')(angel)
}
