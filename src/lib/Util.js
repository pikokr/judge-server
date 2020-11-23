const Docker = require('dockerode')

module.exports = class Util {
    static docker = new Docker()
}