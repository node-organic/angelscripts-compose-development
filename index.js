module.exports = async function (angel) {
  require('angelabilities-exec')(angel)
  require('./tasks/compose')(angel)
  require('./tasks/compose-yaml')(angel)
}
