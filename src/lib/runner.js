const Util = require('./Util')


module.exports = async (lang, code) => {
    Util.docker.getImage(`pikostudio/`)

    await Util.docker.createContainer({
        Image: ``
    })
}


module.exports('node', '123123123')
