const Docker = require('dockerode')

module.exports = class Util {
    static docker = new Docker()

    static exec(code) {
        return new Promise(resolve => {
            const {exec} = require('child_process')
            let res = ''
            const ex = exec(code)
            ex.stdout.on('data', chunk => res += chunk + '\n')
            ex.stderr.on('data', chunk => res += chunk + '\n')
            ex.on('exit', () => {
                resolve(res)
            })
        })
    }
}